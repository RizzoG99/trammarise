import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock AuthError class
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Mock auth middleware
const mockRequireAuth = vi.fn();
vi.mock('../../middleware/auth', () => ({
  requireAuth: mockRequireAuth,
  AuthError,
}));

// Mock Supabase admin
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseIs = vi.fn();
const mockSupabaseOrder = vi.fn();
const mockSupabaseRange = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('GET /api/sessions/list', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock chain setup
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValue({
      is: mockSupabaseIs,
    });
    mockSupabaseIs.mockReturnValue({
      order: mockSupabaseOrder,
    });
    mockSupabaseOrder.mockReturnValue({
      range: mockSupabaseRange,
    });
  });

  describe('Authentication & Authorization', () => {
    it('should return 401 for unauthenticated requests', async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should only return sessions owned by authenticated user', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      const userSessions = [
        {
          id: 'session-1',
          user_id: userId,
          session_id: 'sess_1',
          audio_name: 'recording1.mp3',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 'session-2',
          user_id: userId,
          session_id: 'sess_2',
          audio_name: 'recording2.mp3',
          created_at: '2024-01-14T10:00:00Z',
        },
      ];

      mockSupabaseRange.mockResolvedValue({
        data: userSessions,
        error: null,
        count: 2,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - verify user_id filter was applied
      expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', userId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        sessions: expect.arrayContaining([
          expect.objectContaining({
            userId: userId,
            sessionId: 'sess_1',
          }),
          expect.objectContaining({
            userId: userId,
            sessionId: 'sess_2',
          }),
        ]),
        total: 2,
      });
    });

    it('should not expose other users sessions', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      // Database returns only user's sessions (other users filtered at DB level)
      const userSessions = [
        {
          id: 'session-1',
          user_id: userId,
          session_id: 'sess_1',
          audio_name: 'my-recording.mp3',
          created_at: '2024-01-15T10:00:00Z',
        },
      ];

      mockSupabaseRange.mockResolvedValue({
        data: userSessions,
        error: null,
        count: 1,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - verify only user's sessions returned
      expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', userId);
      expect(mockRes.json).toHaveBeenCalledWith({
        sessions: expect.arrayContaining([
          expect.objectContaining({
            userId: userId,
          }),
        ]),
        total: 1,
      });

      // Verify no sessions from other users are included
      const response = vi.mocked(mockRes.json).mock.calls[0][0];
      expect(response.sessions).toHaveLength(1);
      expect(response.sessions.every((s: { userId: string }) => s.userId === userId)).toBe(true);
    });
  });

  describe('Pagination', () => {
    it('should support default pagination (limit 50, offset 0)', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      mockSupabaseRange.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {}, // No pagination params
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - default limit 50, offset 0
      expect(mockSupabaseRange).toHaveBeenCalledWith(0, 49); // range is [0, 49] for 50 items
    });

    it('should support custom pagination parameters', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      mockSupabaseRange.mockResolvedValue({
        data: [],
        error: null,
        count: 100,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {
          limit: '10',
          offset: '20',
        },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - custom limit 10, offset 20
      expect(mockSupabaseRange).toHaveBeenCalledWith(20, 29); // range is [20, 29] for 10 items
    });

    it('should enforce maximum limit of 100', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      mockSupabaseRange.mockResolvedValue({
        data: [],
        error: null,
        count: 200,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {
          limit: '500', // Requesting more than max
        },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - limit capped at 100
      expect(mockSupabaseRange).toHaveBeenCalledWith(0, 99); // range is [0, 99] for max 100 items
    });

    it('should return total count with paginated results', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      const sessions = [
        {
          id: 'session-1',
          user_id: userId,
          session_id: 'sess_1',
          audio_name: 'recording1.mp3',
          created_at: '2024-01-15T10:00:00Z',
        },
      ];

      mockSupabaseRange.mockResolvedValue({
        data: sessions,
        error: null,
        count: 75, // Total count across all pages
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {
          limit: '1',
          offset: '0',
        },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        sessions: expect.any(Array),
        total: 75, // Total count, not just returned items
      });
    });
  });

  describe('Filtering & Ordering', () => {
    it('should filter out soft-deleted sessions', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      mockSupabaseRange.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - verify deleted_at filter
      expect(mockSupabaseIs).toHaveBeenCalledWith('deleted_at', null);
    });

    it('should order sessions by created_at descending (newest first)', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      mockSupabaseRange.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - verify ordering
      expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('Response Transformation', () => {
    it('should transform snake_case database fields to camelCase', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      const dbSession = {
        id: 'session-1',
        user_id: 'user-uuid-123',
        session_id: 'sess_abc123',
        audio_name: 'my-recording.mp3',
        file_size_bytes: 1024000,
        audio_url: 'https://example.com/audio.mp3',
        duration_seconds: 180,
        language: 'en',
        content_type: 'meeting',
        processing_mode: 'full',
        noise_profile: 'clean',
        selection_mode: 'full',
        region_start: null,
        region_end: null,
        transcript: 'Hello world',
        summary: 'Meeting summary',
        chat_history: [],
        ai_config: { provider: 'openai' },
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z',
        deleted_at: null,
      };

      mockSupabaseRange.mockResolvedValue({
        data: [dbSession],
        error: null,
        count: 1,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - verify camelCase transformation
      expect(mockRes.json).toHaveBeenCalledWith({
        sessions: [
          {
            id: 'session-1',
            userId: 'user-uuid-123',
            sessionId: 'sess_abc123',
            audioName: 'my-recording.mp3',
            fileSizeBytes: 1024000,
            audioUrl: 'https://example.com/audio.mp3',
            durationSeconds: 180,
            language: 'en',
            contentType: 'meeting',
            processingMode: 'full',
            noiseProfile: 'clean',
            selectionMode: 'full',
            regionStart: null,
            regionEnd: null,
            transcript: 'Hello world',
            summary: 'Meeting summary',
            chatHistory: [],
            aiConfig: { provider: 'openai' },
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T11:00:00Z',
            deletedAt: null,
          },
        ],
        total: 1,
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 405 for non-GET methods', async () => {
      // Arrange
      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'POST',
        query: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
    });

    it('should return 500 on database error', async () => {
      // Arrange
      const userId = 'user-uuid-123';
      mockRequireAuth.mockResolvedValue({ userId, clerkId: 'clerk-123' });

      mockSupabaseRange.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
        count: null,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch sessions' });
    });
  });
});
