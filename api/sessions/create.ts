import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * POST /api/sessions/create
 * Create a new session for the authenticated user
 *
 * @param req.body.sessionId - Client-generated session ID
 * @param req.body.audioName - Name of the audio file
 * @param req.body.fileSizeBytes - Size of the audio file in bytes
 * @param req.body.language - Language code (e.g., 'en', 'it')
 * @param req.body.contentType - Type of content (e.g., 'meeting', 'lecture')
 * @param req.body.audioUrl - Optional URL to audio file in storage
 * @param req.body.durationSeconds - Optional audio duration
 * @param req.body.processingMode - Optional processing mode
 * @param req.body.transcript - Optional initial transcript
 * @param req.body.summary - Optional initial summary
 * @param req.body.chatHistory - Optional chat history
 * @param req.body.aiConfig - Optional AI configuration
 *
 * @returns 201 with session data
 * @returns 400 for validation errors
 * @returns 401 for unauthenticated requests
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

    // Validate required fields
    const { sessionId, audioName, fileSizeBytes, language, contentType } = req.body;

    if (!sessionId || !audioName || !fileSizeBytes || !language || !contentType) {
      return res.status(400).json({
        error:
          'Missing required fields: sessionId, audioName, fileSizeBytes, language, contentType',
      });
    }

    const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!UUID_V4.test(sessionId)) {
      return res.status(400).json({ error: 'sessionId must be a valid UUID v4' });
    }

    // Build insert data with only provided fields
    const insertData: Record<string, unknown> = {
      user_id: userId,
      session_id: sessionId,
      audio_name: audioName,
      file_size_bytes: fileSizeBytes,
      language,
      content_type: contentType,
    };

    // Add optional fields only if provided
    if ('audioUrl' in req.body) insertData.audio_url = req.body.audioUrl;
    if ('durationSeconds' in req.body) insertData.duration_seconds = req.body.durationSeconds;
    if ('processingMode' in req.body) insertData.processing_mode = req.body.processingMode;
    if ('noiseProfile' in req.body) insertData.noise_profile = req.body.noiseProfile;
    if ('selectionMode' in req.body) insertData.selection_mode = req.body.selectionMode;
    if ('regionStart' in req.body) insertData.region_start = req.body.regionStart;
    if ('regionEnd' in req.body) insertData.region_end = req.body.regionEnd;
    if ('transcript' in req.body) insertData.transcript = req.body.transcript;
    if ('summary' in req.body) insertData.summary = req.body.summary;
    if ('chatHistory' in req.body) insertData.chat_history = req.body.chatHistory;
    if ('aiConfig' in req.body) insertData.ai_config = req.body.aiConfig;

    // Insert session into database
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create session:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Transform database response to camelCase
    return res.status(201).json({
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
    console.error('Session creation error:', error);

    // Handle auth errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
