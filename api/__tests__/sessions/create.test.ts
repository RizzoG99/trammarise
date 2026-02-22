import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock auth middleware
const mockRequireAuth = vi.fn();
vi.mock('../../middleware/auth', () => ({
  requireAuth: mockRequireAuth,
}));

// Mock Supabase admin
const mockSupabaseFrom = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseSingle = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('POST /api/sessions/create', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default auth mock
    mockRequireAuth.mockResolvedValue({
      userId: 'user-uuid-123',
      clerkId: 'user_clerk123',
    });

    // Setup default Supabase mock chain
    mockSupabaseFrom.mockReturnValue({
      insert: mockSupabaseInsert,
      select: mockSupabaseSelect,
    });
    mockSupabaseInsert.mockReturnValue({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValue({
      single: mockSupabaseSingle,
    });
  });

  describe('Successful Creation', () => {
    it('should create session for authenticated user', async () => {
      // Arrange
      const requestBody = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 1024000,
        language: 'en',
        contentType: 'meeting',
      };

      const mockDbResponse = {
        id: 'uuid-123',
        user_id: 'user-uuid-123',
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        audio_name: 'test-audio.mp3',
        file_size_bytes: 1024000,
        audio_url: null,
        duration_seconds: null,
        language: 'en',
        content_type: 'meeting',
        processing_mode: null,
        noise_profile: null,
        selection_mode: null,
        region_start: null,
        region_end: null,
        transcript: null,
        summary: null,
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

      const { default: handler } = await import('../../sessions/create');
      const mockReq = {
        method: 'POST',
        body: requestBody,
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRequireAuth).toHaveBeenCalled();
      expect(mockSupabaseFrom).toHaveBeenCalledWith('sessions');
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        user_id: 'user-uuid-123',
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        audio_name: 'test-audio.mp3',
        file_size_bytes: 1024000,
        language: 'en',
        content_type: 'meeting',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: '550e8400-e29b-41d4-a716-446655440000',
          audioName: 'test-audio.mp3',
        })
      );
    });

    it('should create session with optional fields', async () => {
      // Arrange
      const requestBody = {
        sessionId: '550e8400-e29b-41d4-a716-446655440001',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 2048000,
        language: 'it',
        contentType: 'lecture',
        audioUrl: 'https://example.com/audio.mp3',
        durationSeconds: 120,
        processingMode: 'standard',
        transcript: 'Initial transcript',
      };

      mockSupabaseSingle.mockResolvedValue({
        data: { id: 'uuid-456', session_id: '550e8400-e29b-41d4-a716-446655440001' },
        error: null,
      });

      const { default: handler } = await import('../../sessions/create');
      const mockReq = {
        method: 'POST',
        body: requestBody,
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        user_id: 'user-uuid-123',
        session_id: '550e8400-e29b-41d4-a716-446655440001',
        audio_name: 'test-audio.mp3',
        file_size_bytes: 2048000,
        language: 'it',
        content_type: 'lecture',
        audio_url: 'https://example.com/audio.mp3',
        duration_seconds: 120,
        processing_mode: 'standard',
        transcript: 'Initial transcript',
      });
    });
  });

  describe('Validation', () => {
    it('should return 405 for non-POST requests', async () => {
      // Arrange
      const { default: handler } = await import('../../sessions/create');
      const mockReq = {
        method: 'GET',
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

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const requestBody = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        // Missing audioName, fileSizeBytes, language, contentType
      };

      const { default: handler } = await import('../../sessions/create');
      const mockReq = {
        method: 'POST',
        body: requestBody,
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Missing required fields'),
        })
      );
    });

    it('should return 400 for invalid sessionId format', async () => {
      // Arrange
      const requestBody = {
        sessionId: 'not-a-uuid',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 1024000,
        language: 'en',
        contentType: 'meeting',
      };

      const { default: handler } = await import('../../sessions/create');
      const mockReq = {
        method: 'POST',
        body: requestBody,
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'sessionId must be a valid UUID v4' });
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(new Error('Unauthorized'));

      const { default: handler } = await import('../../sessions/create');
      const mockReq = {
        method: 'POST',
        body: {
          sessionId: 'test-123',
          audioName: 'test.mp3',
          fileSizeBytes: 1024,
          language: 'en',
          contentType: 'meeting',
        },
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
      const requestBody = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 1024000,
        language: 'en',
        contentType: 'meeting',
      };

      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const { default: handler } = await import('../../sessions/create');
      const mockReq = {
        method: 'POST',
        body: requestBody,
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Failed to create session'),
        })
      );
    });
  });
});
