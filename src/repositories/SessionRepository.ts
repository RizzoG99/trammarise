/**
 * SessionRepository - Centralized data access layer for session API calls
 *
 * Provides type-safe CRUD operations for sessions via API endpoints.
 * Handles authentication automatically via Clerk cookies.
 */

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

// Response from list endpoint
export interface ListSessionsResponse {
  sessions: Session[];
  total: number;
}

export class SessionRepository {
  private baseUrl = '/api/sessions';

  /**
   * Create a new session
   * @throws Error if creation fails
   */
  async create(data: CreateSessionDTO): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return response.json();
  }

  /**
   * Create or update a session (upsert)
   * @throws Error if upsert fails
   */
  async upsert(data: CreateSessionDTO): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to upsert session');
    }

    return response.json();
  }

  /**
   * Fetch a session by sessionId
   * @returns Session or null if not found
   * @throws Error on server errors
   */
  async get(sessionId: string): Promise<Session | null> {
    const response = await fetch(`${this.baseUrl}/${sessionId}`, {
      method: 'GET',
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }

    return response.json();
  }

  /**
   * Update a session
   * @throws Error if update fails
   */
  async update(sessionId: string, data: UpdateSessionDTO): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update session');
    }

    return response.json();
  }

  /**
   * Soft delete a session (sets deleted_at timestamp)
   * @throws Error if deletion fails
   */
  async delete(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete session');
    }
  }

  /**
   * List sessions with pagination
   * @param limit Maximum number of sessions to return (default: 50)
   * @param offset Number of sessions to skip (default: 0)
   * @throws Error if fetch fails
   */
  async list(limit = 50, offset = 0): Promise<ListSessionsResponse> {
    const response = await fetch(`${this.baseUrl}/list?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    return response.json();
  }
}

// Singleton instance
export const sessionRepository = new SessionRepository();
