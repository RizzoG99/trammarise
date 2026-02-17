import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * GET /api/audio/:sessionId
 *
 * Securely serve audio files from private Supabase Storage bucket.
 *
 * Security:
 * - Requires authentication (Clerk JWT)
 * - Verifies user owns the session
 * - Streams file from private bucket
 * - No direct URLs (prevents URL stealing)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verify user is authenticated
    const { userId } = await requireAuth(req);
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    // 2. Fetch session and verify ownership
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('user_id, audio_url')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 3. Check ownership
    if (session.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied: You do not own this session' });
    }

    // 4. Check if audio exists in Supabase
    if (!session.audio_url || !session.audio_url.includes('audio-files')) {
      return res.status(404).json({ error: 'Audio file not found in cloud storage' });
    }

    // 5. Extract file path from URL
    // Example URL: https://xxx.supabase.co/storage/v1/object/audio-files/sessionId/filename
    const urlParts = session.audio_url.split('/audio-files/');
    if (urlParts.length < 2) {
      return res.status(500).json({ error: 'Invalid audio URL format' });
    }
    const filePath = urlParts[1];

    // 6. Download file from private bucket (using admin client bypasses RLS)
    const { data: audioBlob, error: downloadError } = await supabaseAdmin.storage
      .from('audio-files')
      .download(filePath);

    if (downloadError || !audioBlob) {
      console.error('Failed to download audio:', downloadError);
      return res.status(500).json({ error: 'Failed to retrieve audio file' });
    }

    // 7. Stream audio to user
    const buffer = Buffer.from(await audioBlob.arrayBuffer());

    // Set appropriate headers
    res.setHeader('Content-Type', audioBlob.type || 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    res.setHeader('Accept-Ranges', 'bytes'); // Enable seeking

    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Error serving audio:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
