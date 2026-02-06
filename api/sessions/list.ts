import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * GET /api/sessions/list
 * List sessions for the authenticated user with pagination
 *
 * @param req.query.limit - Maximum number of sessions to return (default: 50)
 * @param req.query.offset - Number of sessions to skip (default: 0)
 *
 * @returns 200 with { sessions: Session[], total: number }
 * @returns 401 for unauthenticated requests
 * @returns 405 for non-GET requests
 * @returns 500 for server errors
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const { userId } = await requireAuth();

    // Parse pagination parameters
    const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);
    const offset = parseInt((req.query.offset as string) || '0', 10);

    // Fetch sessions from database
    const { data, error, count } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null) // Filter out soft-deleted sessions
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    // Transform sessions to camelCase
    const sessions = (data || []).map(transformToCamelCase);

    return res.status(200).json({
      sessions,
      total: count || 0,
    });
  } catch (error) {
    console.error('Session list error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Transform database snake_case response to camelCase
 */
function transformToCamelCase(data: Record<string, unknown>) {
  return {
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
  };
}
