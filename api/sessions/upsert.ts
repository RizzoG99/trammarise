import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * POST /api/sessions/upsert
 * Create or update a session (upsert pattern)
 *
 * Uses PostgreSQL's ON CONFLICT to avoid GET-then-POST pattern
 *
 * @param req.body - Session data (same as create endpoint)
 * @returns 200 with session data (created or updated)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = await requireAuth(req);

    // Validate required fields
    const { sessionId, audioName, fileSizeBytes, language, contentType } = req.body;

    if (!sessionId || !audioName || !fileSizeBytes || !language || !contentType) {
      return res.status(400).json({
        error:
          'Missing required fields: sessionId, audioName, fileSizeBytes, language, contentType',
      });
    }

    // Build upsert data
    const upsertData: Record<string, unknown> = {
      user_id: userId,
      session_id: sessionId,
      audio_name: audioName,
      file_size_bytes: fileSizeBytes,
      language,
      content_type: contentType,
    };

    // Add optional fields
    if ('audioUrl' in req.body) upsertData.audio_url = req.body.audioUrl;
    if ('durationSeconds' in req.body) upsertData.duration_seconds = req.body.durationSeconds;
    if ('processingMode' in req.body) upsertData.processing_mode = req.body.processingMode;
    if ('noiseProfile' in req.body) upsertData.noise_profile = req.body.noiseProfile;
    if ('selectionMode' in req.body) upsertData.selection_mode = req.body.selectionMode;
    if ('regionStart' in req.body) upsertData.region_start = req.body.regionStart;
    if ('regionEnd' in req.body) upsertData.region_end = req.body.regionEnd;
    if ('transcript' in req.body) upsertData.transcript = req.body.transcript;
    if ('summary' in req.body) upsertData.summary = req.body.summary;
    if ('chatHistory' in req.body) upsertData.chat_history = req.body.chatHistory;
    if ('aiConfig' in req.body) upsertData.ai_config = req.body.aiConfig;

    // Upsert using ON CONFLICT (session_id) DO UPDATE
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .upsert(upsertData, {
        onConflict: 'session_id',
        ignoreDuplicates: false, // Always update on conflict
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to upsert session:', error);
      return res.status(500).json({ error: 'Failed to save session' });
    }

    // Return camelCase response
    return res.status(200).json({
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      audioName: data.audio_name,
      fileSizeBytes: data.file_size_bytes,
      audioUrl: data.audio_url,
      durationSeconds: data.duration_seconds,
      language: data.language,
      contentType: data.content_type,
      processingMode: data.processing_mode,
      noiseProfile: data.noise_profile,
      selectionMode: data.selection_mode,
      regionStart: data.region_start,
      regionEnd: data.region_end,
      transcript: data.transcript,
      summary: data.summary,
      chatHistory: data.chat_history,
      aiConfig: data.ai_config,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    });
  } catch (error) {
    console.error('Session upsert error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
