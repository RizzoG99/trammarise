import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * api/sessions/[id]
 * Handle GET, PATCH, and DELETE operations for individual sessions
 *
 * GET    - Fetch session by sessionId
 * PATCH  - Update session fields
 * DELETE - Soft delete session (set deleted_at)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id: sessionId } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Authenticate user
    const { userId } = await requireAuth(req);

    switch (req.method) {
      case 'GET':
        return await handleGet(sessionId, userId, res);
      case 'PATCH':
        return await handlePatch(sessionId, userId, req.body, res);
      case 'DELETE':
        return await handleDelete(sessionId, userId, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Session ${req.method} error:`, error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET - Fetch session by sessionId
 */
async function handleGet(sessionId: string, userId: string, res: VercelResponse) {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.status(200).json(transformToCamelCase(data));
}

/**
 * PATCH - Update session fields
 */
async function handlePatch(
  sessionId: string,
  userId: string,
  body: Record<string, unknown>,
  res: VercelResponse
) {
  // Build update data with only provided fields
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  // Map camelCase request fields to snake_case database fields
  if ('audioUrl' in body) updateData.audio_url = body.audioUrl;
  if ('durationSeconds' in body) updateData.duration_seconds = body.durationSeconds;
  if ('processingMode' in body) updateData.processing_mode = body.processingMode;
  if ('noiseProfile' in body) updateData.noise_profile = body.noiseProfile;
  if ('selectionMode' in body) updateData.selection_mode = body.selectionMode;
  if ('regionStart' in body) updateData.region_start = body.regionStart;
  if ('regionEnd' in body) updateData.region_end = body.regionEnd;
  if ('transcript' in body) updateData.transcript = body.transcript;
  if ('summary' in body) updateData.summary = body.summary;
  if ('chatHistory' in body) updateData.chat_history = body.chatHistory;
  if ('aiConfig' in body) updateData.ai_config = body.aiConfig;

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update(updateData)
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.status(200).json(transformToCamelCase(data));
}

/**
 * DELETE - Soft delete session (set deleted_at)
 */
async function handleDelete(sessionId: string, userId: string, res: VercelResponse) {
  const { error } = await supabaseAdmin
    .from('sessions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ error: 'Failed to delete session' });
  }

  return res.status(200).json({ success: true });
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
