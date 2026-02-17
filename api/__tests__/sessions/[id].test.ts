import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock auth middleware
const mockRequireAuth = vi.fn();
vi.mock('../../middleware/auth', () => ({
  requireAuth: mockRequireAuth,
}));

// Mock Supabase admin
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseUpdate = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('api/sessions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockRequireAuth.mockResolvedValue({
      userId: 'user-uuid-123',
      clerkId: 'user_clerk123',
    });
  });

  describe('GET /api/sessions/:id', () => {
    beforeEach(() => {
      mockSupabaseFrom.mockReturnValue({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValue({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSupabaseSingle,
        }),
      });
    });

    it('should fetch session by sessionId', async () => {
      // Arrange
      const mockDbResponse = {
        id: 'uuid-123',
        user_id: 'user-uuid-123',
        session_id: 'test-session-123',
        audio_name: 'test-audio.mp3',
        file_size_bytes: 1024000,
        audio_url: 'https://example.com/audio.mp3',
        duration_seconds: 120,
        language: 'en',
        content_type: 'meeting',
        processing_mode: 'standard',
        noise_profile: null,
        selection_mode: 'full',
        region_start: null,
        region_end: null,
        transcript: 'Test transcript',
        summary: 'Test summary',
        chat_history: [],
        ai_config: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null,
      };

      mockSupabaseSingle.mockResolvedValue({
        data: mockDbResponse,
        error: null,
      });

      const { default: handler } = await import('../../sessions/[id]');
      const mockReq = {
        method: 'GET',
        query: { id: 'test-session-123' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'test-session-123',
          audioName: 'test-audio.mp3',
        })
      );
    });

    it('should return 404 when session not found', async () => {
      // Arrange
      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const { default: handler } = await import('../../sessions/[id]');
      const mockReq = {
        method: 'GET',
        query: { id: 'non-existent' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Session not found' });
    });
  });

  describe('PATCH /api/sessions/:id', () => {
    beforeEach(() => {
      mockSupabaseFrom.mockReturnValue({
        update: mockSupabaseUpdate,
      });
      mockSupabaseUpdate.mockReturnValue({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: mockSupabaseSelect,
        }),
      });
      mockSupabaseSelect.mockReturnValue({
        single: mockSupabaseSingle,
      });
    });

    it('should update session fields', async () => {
      // Arrange
      const mockDbResponse = {
        id: 'uuid-123',
        user_id: 'user-uuid-123',
        session_id: 'test-session-123',
        transcript: 'Updated transcript',
        summary: 'Updated summary',
        updated_at: '2024-01-01T00:01:00Z',
      };

      mockSupabaseSingle.mockResolvedValue({
        data: mockDbResponse,
        error: null,
      });

      const { default: handler } = await import('../../sessions/[id]');
      const mockReq = {
        method: 'PATCH',
        query: { id: 'test-session-123' },
        body: {
          transcript: 'Updated transcript',
          summary: 'Updated summary',
        },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({
        transcript: 'Updated transcript',
        summary: 'Updated summary',
        updated_at: expect.any(String),
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when updating non-existent session', async () => {
      // Arrange
      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const { default: handler } = await import('../../sessions/[id]');
      const mockReq = {
        method: 'PATCH',
        query: { id: 'non-existent' },
        body: { transcript: 'Updated' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    beforeEach(() => {
      mockSupabaseFrom.mockReturnValue({
        update: mockSupabaseUpdate,
      });
      mockSupabaseUpdate.mockReturnValue({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: { id: 'uuid-123' },
          error: null,
        }),
      });
    });

    it('should soft delete session', async () => {
      // Arrange
      const { default: handler } = await import('../../sessions/[id]');
      const mockReq = {
        method: 'DELETE',
        query: { id: 'test-session-123' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({
        deleted_at: expect.any(String),
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const { default: handler } = await import('../../sessions/[id]');
      const mockReq = {
        method: 'GET',
        query: { id: 'test-123' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Method Validation', () => {
    it('should return 405 for unsupported methods', async () => {
      // Arrange
      const { default: handler } = await import('../../sessions/[id]');
      const mockReq = {
        method: 'POST',
        query: { id: 'test-123' },
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
  });
});
