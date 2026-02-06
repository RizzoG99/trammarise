import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions
const mockAuth = vi.fn();
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();

// Mock modules BEFORE importing the module under test
vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}));

vi.mock('../../../src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('requireAuth middleware', () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset modules to force re-import
    vi.resetModules();

    // Setup default mock chain behavior
    mockSupabaseFrom.mockReturnValue({ select: mockSupabaseSelect });
    mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
    mockSupabaseEq.mockReturnValue({ single: mockSupabaseSingle });
  });

  describe('Successful Authentication', () => {
    it('should extract userId from valid JWT and return user data', async () => {
      // Arrange
      mockAuth.mockReturnValue({ userId: 'user_clerk123' });
      mockSupabaseSingle.mockResolvedValue({
        data: { id: 'uuid-123', clerk_user_id: 'user_clerk123' },
        error: null,
      });

      // Import module AFTER mocks are set up
      const { requireAuth } = await import('../../middleware/auth');

      // Act
      const result = await requireAuth();

      // Assert
      expect(result).toEqual({
        userId: 'uuid-123',
        clerkId: 'user_clerk123',
      });
      expect(mockAuth).toHaveBeenCalled();
      expect(mockSupabaseFrom).toHaveBeenCalledWith('users');
      expect(mockSupabaseSelect).toHaveBeenCalledWith('id, clerk_user_id');
      expect(mockSupabaseEq).toHaveBeenCalledWith('clerk_user_id', 'user_clerk123');
      expect(mockSupabaseSingle).toHaveBeenCalled();
    });
  });

  describe('Authentication Errors', () => {
    it('should throw 401 error when no userId in JWT', async () => {
      // Arrange
      mockAuth.mockReturnValue({ userId: null });

      const { requireAuth } = await import('../../middleware/auth');

      // Act & Assert
      await expect(requireAuth()).rejects.toThrow('Unauthorized');
    });

    it('should throw 404 error when user not found in database', async () => {
      // Arrange
      mockAuth.mockReturnValue({ userId: 'user_clerk123' });
      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const { requireAuth } = await import('../../middleware/auth');

      // Act & Assert
      await expect(requireAuth()).rejects.toThrow('User not found in database');
    });
  });

  describe('Edge Cases', () => {
    it('should handle database connection errors', async () => {
      // Arrange
      mockAuth.mockReturnValue({ userId: 'user_clerk123' });
      // Supabase returns errors in the response, not as rejections
      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'DB connection failed', code: 'CONNECTION_ERROR' },
      });

      const { requireAuth } = await import('../../middleware/auth');

      // Act & Assert
      // This will be caught as "User not found" since Supabase returns error in response
      await expect(requireAuth()).rejects.toThrow('User not found in database');
    });
  });
});
