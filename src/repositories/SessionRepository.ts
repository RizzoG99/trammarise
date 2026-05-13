/**
 * SessionRepository - Centralized data access layer for sessions
 *
 * Provides type-safe CRUD operations for sessions via direct Supabase client queries.
 * RLS (row-level security) enforces ownership: user_id = auth.uid().
 */
import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

// Session types matching database schema
export interface Session {
  id: string;
  userId: string;
  sessionId: string;
  audioName: string;
  fileSizeBytes: number;
  audioUrl: string | null;
  durationSeconds: number | null;
  language: string;
  contentType: string;
  processingMode: string | null;
  noiseProfile: string | null;
  selectionMode: 'full' | 'selection' | null;
  regionStart: number | null;
  regionEnd: number | null;
  transcript: string | null;
  summary: string | null;
  chatHistory: unknown;
  aiConfig: unknown;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// DTO for creating a new session
export interface CreateSessionDTO {
  sessionId: string;
  audioName: string;
  fileSizeBytes: number;
  language: string;
  contentType: string;
  audioUrl?: string | null;
  durationSeconds?: number | null;
  processingMode?: string | null;
  noiseProfile?: string | null;
  selectionMode?: 'full' | 'selection' | null;
  regionStart?: number | null;
  regionEnd?: number | null;
  transcript?: string | null;
  summary?: string | null;
  chatHistory?: unknown;
  aiConfig?: unknown;
}

// DTO for updating a session
export interface UpdateSessionDTO {
  audioUrl?: string | null;
  durationSeconds?: number | null;
  processingMode?: string | null;
  noiseProfile?: string | null;
  selectionMode?: 'full' | 'selection' | null;
  regionStart?: number | null;
  regionEnd?: number | null;
  transcript?: string | null;
  summary?: string | null;
  chatHistory?: unknown;
  aiConfig?: unknown;
}

// Response from list operation
export interface ListSessionsResponse {
  sessions: Session[];
  total: number;
}

// Maps camelCase DTO fields to snake_case DB columns
function toDbRow(data: CreateSessionDTO, userId: string): SessionInsert {
  return {
    user_id: userId,
    session_id: data.sessionId,
    audio_name: data.audioName,
    file_size_bytes: data.fileSizeBytes,
    language: data.language,
    content_type: data.contentType,
    audio_url: data.audioUrl ?? null,
    duration_seconds: data.durationSeconds ?? null,
    processing_mode: data.processingMode ?? null,
    noise_profile: data.noiseProfile ?? null,
    selection_mode: data.selectionMode ?? null,
    region_start: data.regionStart ?? null,
    region_end: data.regionEnd ?? null,
    transcript: data.transcript ?? null,
    summary: data.summary ?? null,
    chat_history: data.chatHistory ?? null,
    ai_config: data.aiConfig ?? null,
  };
}

// Maps snake_case DB row to camelCase Session type
function fromDbRow(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    sessionId: row.session_id as string,
    audioName: row.audio_name as string,
    fileSizeBytes: row.file_size_bytes as number,
    audioUrl: (row.audio_url as string | null) ?? null,
    durationSeconds: (row.duration_seconds as number | null) ?? null,
    language: row.language as string,
    contentType: row.content_type as string,
    processingMode: (row.processing_mode as string | null) ?? null,
    noiseProfile: (row.noise_profile as string | null) ?? null,
    selectionMode: (row.selection_mode as 'full' | 'selection' | null) ?? null,
    regionStart: (row.region_start as number | null) ?? null,
    regionEnd: (row.region_end as number | null) ?? null,
    transcript: (row.transcript as string | null) ?? null,
    summary: (row.summary as string | null) ?? null,
    chatHistory: row.chat_history ?? null,
    aiConfig: row.ai_config ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    deletedAt: (row.deleted_at as string | null) ?? null,
  };
}

async function getCurrentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.user.id;
}

export class SessionRepository {
  /**
   * Create a new session
   * @throws Error if creation fails or user is not authenticated
   */
  async create(data: CreateSessionDTO): Promise<Session> {
    const userId = await getCurrentUserId();
    const { data: row, error } = await supabaseClient
      .from('sessions')
      .insert(toDbRow(data, userId))
      .select()
      .single();

    if (error) throw new Error(`Failed to create session: ${error.message}`);
    return fromDbRow(row as Record<string, unknown>);
  }

  /**
   * Create or update a session (upsert by session_id)
   * @throws Error if upsert fails or user is not authenticated
   */
  async upsert(data: CreateSessionDTO): Promise<Session> {
    const userId = await getCurrentUserId();
    const { data: row, error } = await supabaseClient
      .from('sessions')
      .upsert(toDbRow(data, userId), { onConflict: 'session_id' })
      .select()
      .single();

    if (error) throw new Error(`Failed to upsert session ${data.sessionId}: ${error.message}`);
    return fromDbRow(row as Record<string, unknown>);
  }

  /**
   * Fetch a session by sessionId
   * @returns Session or null if not found
   */
  async get(sessionId: string): Promise<Session | null> {
    const { data: row, error } = await supabaseClient
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch session ${sessionId}: ${error.message}`);
    if (!row) return null;
    return fromDbRow(row as Record<string, unknown>);
  }

  /**
   * Update a session
   * @throws Error if update fails
   */
  async update(sessionId: string, data: UpdateSessionDTO): Promise<Session> {
    const updateRow: SessionUpdate = {};
    if (data.audioUrl !== undefined) updateRow.audio_url = data.audioUrl;
    if (data.durationSeconds !== undefined) updateRow.duration_seconds = data.durationSeconds;
    if (data.processingMode !== undefined) updateRow.processing_mode = data.processingMode;
    if (data.noiseProfile !== undefined) updateRow.noise_profile = data.noiseProfile;
    if (data.selectionMode !== undefined) updateRow.selection_mode = data.selectionMode;
    if (data.regionStart !== undefined) updateRow.region_start = data.regionStart;
    if (data.regionEnd !== undefined) updateRow.region_end = data.regionEnd;
    if (data.transcript !== undefined) updateRow.transcript = data.transcript;
    if (data.summary !== undefined) updateRow.summary = data.summary;
    if (data.chatHistory !== undefined) updateRow.chat_history = data.chatHistory;
    if (data.aiConfig !== undefined) updateRow.ai_config = data.aiConfig;

    const { data: row, error } = await supabaseClient
      .from('sessions')
      .update(updateRow)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update session ${sessionId}: ${error.message}`);
    return fromDbRow(row as Record<string, unknown>);
  }

  /**
   * Soft delete a session (sets deleted_at timestamp)
   * @throws Error if deletion fails
   */
  async delete(sessionId: string): Promise<void> {
    const softDelete: SessionUpdate = { deleted_at: new Date().toISOString() };
    const { error } = await supabaseClient
      .from('sessions')
      .update(softDelete)
      .eq('session_id', sessionId);

    if (error) throw new Error(`Failed to delete session ${sessionId}: ${error.message}`);
  }

  /**
   * List sessions with pagination (excludes soft-deleted)
   * @param limit Maximum number of sessions to return (default: 50)
   * @param offset Number of sessions to skip (default: 0)
   */
  async list(limit = 50, offset = 0): Promise<ListSessionsResponse> {
    const {
      data: rows,
      error,
      count,
    } = await supabaseClient
      .from('sessions')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch sessions: ${error.message}`);
    return {
      sessions: (rows ?? []).map((r) => fromDbRow(r as Record<string, unknown>)),
      total: count ?? 0,
    };
  }
}

// Singleton instance
export const sessionRepository = new SessionRepository();
