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
const mockSupabaseIn = vi.fn();
const mockSupabaseInsert = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('POST /api/sessions/import', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockRequireAuth.mockResolvedValue({
      userId: 'user-uuid-123',
      clerkId: 'user_clerk123',
    });
  });

  describe('Successful Import', () => {
    it('should import up to 50 sessions', async () => {
      // Arrange - Create 60 sessions to test limit (using valid UUID v4 format)
      const sessions = Array.from({ length: 60 }, (_, i) => ({
        sessionId: `00000000-0000-4000-a000-${String(i + 1).padStart(12, '0')}`,
        audioName: `audio-${i}.mp3`,
        fileSizeBytes: 1024000,
        language: 'en',
        contentType: 'meeting',
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000,
      }));

      // Mock existing sessions check (none exist)
      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        in: mockSupabaseIn,
      });
      mockSupabaseIn.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Mock insert
      mockSupabaseFrom.mockReturnValueOnce({
        insert: mockSupabaseInsert,
      });
      mockSupabaseInsert.mockResolvedValueOnce({
        data: sessions.slice(0, 50).map((s, i) => ({ id: `uuid-${i}`, ...s })),
        error: null,
      });

      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'POST',
        body: { localSessions: sessions },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ imported: 50, rejected: 0 });
    });

    it('should skip duplicate sessionIds', async () => {
      // Arrange
      const sessions = [
        {
          sessionId: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a601',
          audioName: 'audio-1.mp3',
          fileSizeBytes: 1024000,
          language: 'en',
          contentType: 'meeting',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          sessionId: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a602',
          audioName: 'audio-2.mp3',
          fileSizeBytes: 2048000,
          language: 'it',
          contentType: 'lecture',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          sessionId: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a603',
          audioName: 'audio-3.mp3',
          fileSizeBytes: 3072000,
          language: 'es',
          contentType: 'interview',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      // Mock existing sessions (a601 already exists)
      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        in: mockSupabaseIn,
      });
      mockSupabaseIn.mockResolvedValueOnce({
        data: [{ session_id: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a601' }],
        error: null,
      });

      // Mock insert (should only insert a602 and a603)
      mockSupabaseFrom.mockReturnValueOnce({
        insert: mockSupabaseInsert,
      });
      mockSupabaseInsert.mockResolvedValueOnce({
        data: [
          { id: 'uuid-2', session_id: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a602' },
          { id: 'uuid-3', session_id: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a603' },
        ],
        error: null,
      });

      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'POST',
        body: { localSessions: sessions },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({ imported: 2, rejected: 0 });
    });

    it('should import empty array successfully', async () => {
      // Arrange
      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'POST',
        body: { localSessions: [] },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ imported: 0, rejected: 0 });
    });
  });

  describe('Partial Import with Invalid Sessions', () => {
    it('should report rejected count when some sessions fail validation', async () => {
      // Arrange - 2 valid sessions, 1 invalid (bad UUID)
      const sessions = [
        {
          sessionId: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a601',
          contentType: 'meeting',
          fileSizeBytes: 1024,
          language: 'en',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          sessionId: 'not-a-valid-uuid',
          contentType: 'meeting',
        },
        {
          sessionId: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a603',
          contentType: 'other',
          fileSizeBytes: 2048,
          language: 'it',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      // Mock existing sessions check (none exist)
      mockSupabaseFrom.mockReturnValueOnce({ select: mockSupabaseSelect });
      mockSupabaseSelect.mockReturnValueOnce({ eq: mockSupabaseEq });
      mockSupabaseEq.mockReturnValueOnce({ in: mockSupabaseIn });
      mockSupabaseIn.mockResolvedValueOnce({ data: [], error: null });

      // Mock insert
      mockSupabaseFrom.mockReturnValueOnce({ insert: mockSupabaseInsert });
      mockSupabaseInsert.mockResolvedValueOnce({ data: [], error: null });

      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'POST',
        body: { localSessions: sessions },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - response includes rejected count so callers can surface it
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ imported: 2, rejected: 1 });
    });
  });

  describe('Validation', () => {
    it('should return 400 for non-POST requests', async () => {
      // Arrange
      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'GET',
        body: {},
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

    it('should return 400 if localSessions is not an array', async () => {
      // Arrange
      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'POST',
        body: { localSessions: 'invalid' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'localSessions must be an array',
      });
    });

    it('should return 400 if localSessions is missing', async () => {
      // Arrange
      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'POST',
        body: {},
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'localSessions must be an array',
      });
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'POST',
        body: { localSessions: [] },
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
  });

  describe('Error Handling', () => {
    it('should return 500 on database insert error', async () => {
      // Arrange
      const sessions = [
        {
          sessionId: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a601',
          audioName: 'audio-1.mp3',
          fileSizeBytes: 1024000,
          language: 'en',
          contentType: 'meeting',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      // Mock existing sessions check (none exist)
      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        in: mockSupabaseIn,
      });
      mockSupabaseIn.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Mock insert failure
      mockSupabaseFrom.mockReturnValueOnce({
        insert: mockSupabaseInsert,
      });
      mockSupabaseInsert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const { default: handler } = await import('../../sessions/import');
      const mockReq = {
        method: 'POST',
        body: { localSessions: sessions },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to import sessions',
      });
    });
  });
});
