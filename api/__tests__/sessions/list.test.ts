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
const mockSupabaseIsNull = vi.fn();
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

    mockRequireAuth.mockResolvedValue({
      userId: 'user-uuid-123',
      clerkId: 'user_clerk123',
    });

    // Setup default Supabase mock chain
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValue({
      is: mockSupabaseIsNull,
    });
    mockSupabaseIsNull.mockReturnValue({
      order: mockSupabaseOrder,
    });
    mockSupabaseOrder.mockReturnValue({
      range: mockSupabaseRange,
    });
  });

  describe('Successful Listing', () => {
    it('should list sessions with default pagination', async () => {
      // Arrange
      const mockSessions = [
        {
          id: 'uuid-1',
          user_id: 'user-uuid-123',
          session_id: 'session-1',
          audio_name: 'audio1.mp3',
          file_size_bytes: 1024000,
          language: 'en',
          content_type: 'meeting',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          deleted_at: null,
        },
        {
          id: 'uuid-2',
          user_id: 'user-uuid-123',
          session_id: 'session-2',
          audio_name: 'audio2.mp3',
          file_size_bytes: 2048000,
          language: 'it',
          content_type: 'lecture',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          deleted_at: null,
        },
      ];

      mockSupabaseRange.mockResolvedValue({
        data: mockSessions,
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

      // Assert
      expect(mockSupabaseFrom).toHaveBeenCalledWith('sessions');
      expect(mockSupabaseSelect).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', 'user-uuid-123');
      expect(mockSupabaseIsNull).toHaveBeenCalledWith('deleted_at', null);
      expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockSupabaseRange).toHaveBeenCalledWith(0, 49); // Default limit 50 → range 0-49
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        sessions: expect.arrayContaining([
          expect.objectContaining({ sessionId: 'session-1' }),
          expect.objectContaining({ sessionId: 'session-2' }),
        ]),
        total: 2,
      });
    });

    it('should list sessions with custom pagination', async () => {
      // Arrange
      mockSupabaseRange.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      const { default: handler } = await import('../../sessions/list');
      const mockReq = {
        method: 'GET',
        query: { limit: '10', offset: '20' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockSupabaseRange).toHaveBeenCalledWith(20, 29); // offset 20, limit 10 → range 20-29
    });

    it('should filter out deleted sessions', async () => {
      // Arrange
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

      // Assert
      expect(mockSupabaseIsNull).toHaveBeenCalledWith('deleted_at', null);
    });
  });

  describe('Method Validation', () => {
    it('should return 405 for non-GET requests', async () => {
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
  });

  describe('Authentication', () => {
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
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database errors', async () => {
      // Arrange
      mockSupabaseRange.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
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
