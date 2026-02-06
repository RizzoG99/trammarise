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
      // Arrange - Create 60 sessions to test limit
      const sessions = Array.from({ length: 60 }, (_, i) => ({
        sessionId: `session-${i}`,
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
      expect(mockRes.json).toHaveBeenCalledWith({ imported: 50 });
    });

    it('should skip duplicate sessionIds', async () => {
      // Arrange
      const sessions = [
        {
          sessionId: 'session-1',
          audioName: 'audio-1.mp3',
          fileSizeBytes: 1024000,
          language: 'en',
          contentType: 'meeting',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          sessionId: 'session-2',
          audioName: 'audio-2.mp3',
          fileSizeBytes: 2048000,
          language: 'it',
          contentType: 'lecture',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          sessionId: 'session-3',
          audioName: 'audio-3.mp3',
          fileSizeBytes: 3072000,
          language: 'es',
          contentType: 'interview',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      // Mock existing sessions (session-1 already exists)
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
        data: [{ session_id: 'session-1' }],
        error: null,
      });

      // Mock insert (should only insert session-2 and session-3)
      mockSupabaseFrom.mockReturnValueOnce({
        insert: mockSupabaseInsert,
      });
      mockSupabaseInsert.mockResolvedValueOnce({
        data: [
          { id: 'uuid-2', session_id: 'session-2' },
          { id: 'uuid-3', session_id: 'session-3' },
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
      expect(mockRes.json).toHaveBeenCalledWith({ imported: 2 });
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
      expect(mockRes.json).toHaveBeenCalledWith({ imported: 0 });
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
          sessionId: 'session-1',
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
