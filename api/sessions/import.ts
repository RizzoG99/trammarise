import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_CONTENT_TYPES = ['meeting', 'lecture', 'interview', 'podcast', 'voice_memo', 'other'];

function validateSession(session: Record<string, unknown>): boolean {
  if (!session.sessionId || !UUID_V4.test(String(session.sessionId))) return false;
  if (session.contentType && !VALID_CONTENT_TYPES.includes(String(session.contentType)))
    return false;
  if (session.language !== undefined) {
    const lang = String(session.language);
    if (!lang || lang.length > 10) return false;
  }
  if (session.fileSizeBytes !== undefined) {
    const size = Number(session.fileSizeBytes);
    if (isNaN(size) || size < 0 || size > 524288000) return false;
  }
  if (session.audioUrl !== undefined) {
    try {
      new URL(String(session.audioUrl));
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * POST /api/sessions/import
 * Import local sessions to database for authenticated user
 *
 * Deduplicates by sessionId and limits to 50 sessions per import
 *
 * @param req.body.localSessions - Array of session objects from localStorage
 * @returns 200 with { imported: number }
 * @returns 400 for invalid request body
 * @returns 401 for unauthenticated requests
 * @returns 405 for non-POST requests
 * @returns 500 for server errors
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const { userId } = await requireAuth(req);

    // Validate request body
    const { localSessions } = req.body;

    if (!Array.isArray(localSessions)) {
      return res.status(400).json({ error: 'localSessions must be an array' });
    }

    // Limit to 50 sessions and filter out structurally invalid ones
    const sliced = localSessions.slice(0, 50);
    const sessionsToImport = sliced.filter(validateSession);
    const rejectedCount = sliced.length - sessionsToImport.length;

    // If no sessions to import, return early
    if (sessionsToImport.length === 0) {
      return res.status(200).json({ imported: 0, rejected: rejectedCount });
    }

    // Get existing session IDs to avoid duplicates
    const sessionIds = sessionsToImport.map((s) => s.sessionId);
    const { data: existingSessions } = await supabaseAdmin
      .from('sessions')
      .select('session_id')
      .eq('user_id', userId)
      .in('session_id', sessionIds);

    const existingIds = new Set(existingSessions?.map((s) => s.session_id) || []);

    // Filter out sessions that already exist
    const newSessions = sessionsToImport.filter((s) => !existingIds.has(s.sessionId));

    // If no new sessions to import, return early
    if (newSessions.length === 0) {
      return res.status(200).json({ imported: 0, rejected: rejectedCount });
    }

    // Transform sessions to database format
    const sessionsToInsert = newSessions.map((session) => {
      const insertData: Record<string, unknown> = {
        user_id: userId,
        session_id: session.sessionId,
        audio_name: session.audioName || 'unknown.wav',
        file_size_bytes: session.fileSizeBytes || 0,
        language: session.language || 'en',
        content_type: session.contentType || 'other',
        created_at: session.createdAt
          ? new Date(session.createdAt).toISOString()
          : new Date().toISOString(),
        updated_at: session.updatedAt
          ? new Date(session.updatedAt).toISOString()
          : new Date().toISOString(),
      };

      // Add optional fields if present
      if (session.audioUrl) insertData.audio_url = session.audioUrl;
      if (session.durationSeconds) insertData.duration_seconds = session.durationSeconds;
      if (session.processingMode) insertData.processing_mode = session.processingMode;
      if (session.noiseProfile) insertData.noise_profile = session.noiseProfile;
      if (session.selectionMode) insertData.selection_mode = session.selectionMode;
      if (session.regionStart !== undefined) insertData.region_start = session.regionStart;
      if (session.regionEnd !== undefined) insertData.region_end = session.regionEnd;

      // Extract from result if present
      if (session.result) {
        if (session.result.transcript) insertData.transcript = session.result.transcript;
        if (session.result.summary) insertData.summary = session.result.summary;
        if (session.result.chatHistory) insertData.chat_history = session.result.chatHistory;
        if (session.result.configuration) insertData.ai_config = session.result.configuration;
      }

      return insertData;
    });

    // Insert sessions in batch
    const { error } = await supabaseAdmin.from('sessions').insert(sessionsToInsert);

    if (error) {
      console.error('Failed to import sessions:', error);
      return res.status(500).json({ error: 'Failed to import sessions' });
    }

    return res.status(200).json({ imported: newSessions.length, rejected: rejectedCount });
  } catch (error) {
    console.error('Session import error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
