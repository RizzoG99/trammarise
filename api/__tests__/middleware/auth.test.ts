import { describe, it, expect, vi, beforeEach } from 'vitest';

// Unmock the auth module to test the real implementation
vi.unmock('../../middleware/auth');

// Create mock functions
const mockAuthenticateRequest = vi.fn();
const mockGetUser = vi.fn();
const mockCreateClerkClient = vi.fn(() => ({
  authenticateRequest: mockAuthenticateRequest,
  users: {
    getUser: mockGetUser,
  },
}));

const mockSupabaseFrom = vi.fn();

// Mock modules BEFORE importing the module under test
vi.mock('@clerk/backend', () => ({
  createClerkClient: mockCreateClerkClient,
}));

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('requireAuth middleware', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Setup default Supabase mock chain
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
    });
  });

  describe('Successful Authentication', () => {
    it('should extract userId from valid JWT and return user data', async () => {
      // Arrange - Mock successful Clerk authentication
      mockAuthenticateRequest.mockResolvedValue({
        isAuthenticated: true,
        toAuth: () => ({ userId: 'user_clerk123' }),
      });

      // Mock Supabase to return existing user
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: 'uuid-123', clerk_user_id: 'user_clerk123' },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle,
      });

      // Import module AFTER mocks are set up
      const { requireAuth } = await import('../../middleware/auth');

      // Create mock request
      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: {},
      } as unknown as Parameters<typeof requireAuth>[0];

      // Act
      const result = await requireAuth(mockReq);

      // Assert
      expect(result).toEqual({
        userId: 'uuid-123',
        clerkId: 'user_clerk123',
      });
      expect(mockAuthenticateRequest).toHaveBeenCalled();
      expect(mockSupabaseFrom).toHaveBeenCalledWith('users');
    });
  });

  describe('Authentication Errors', () => {
    it('should throw 401 error when not authenticated', async () => {
      // Arrange - Mock failed authentication
      mockAuthenticateRequest.mockResolvedValue({
        isAuthenticated: false,
        toAuth: () => ({ userId: null }),
      });

      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: {},
      } as unknown as Parameters<typeof requireAuth>[0];

      // Act & Assert
      await expect(requireAuth(mockReq)).rejects.toThrow('Unauthorized');
    });

    it('should create user when not found in database', async () => {
      // Arrange - Mock successful Clerk auth but user not in DB
      mockAuthenticateRequest.mockResolvedValue({
        isAuthenticated: true,
        toAuth: () => ({ userId: 'user_clerk123' }),
      });

      // First call: user not found, Second call after insert: return new user
      const mockSingle = vi
        .fn()
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Not found' },
        })
        .mockResolvedValueOnce({
          data: { id: 'uuid-new', clerk_user_id: 'user_clerk123' },
          error: null,
        });

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle,
        insert: vi.fn().mockReturnThis(),
      });

      // Mock Clerk user fetch for email
      mockGetUser.mockResolvedValue({
        emailAddresses: [{ emailAddress: 'test@example.com' }],
      });

      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: {},
      } as unknown as Parameters<typeof requireAuth>[0];

      // Act
      const result = await requireAuth(mockReq);

      // Assert - Should create user and return
      expect(result).toEqual({
        userId: 'uuid-new',
        clerkId: 'user_clerk123',
      });
      expect(mockGetUser).toHaveBeenCalledWith('user_clerk123');
    });
  });

  describe('Edge Cases', () => {
    it('should handle authentication errors gracefully', async () => {
      // Arrange - Mock Clerk throwing an error
      mockAuthenticateRequest.mockRejectedValue(new Error('Network error'));

      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: {},
      } as unknown as Parameters<typeof requireAuth>[0];

      // Act & Assert
      // Should catch and rethrow as generic auth error
      await expect(requireAuth(mockReq)).rejects.toThrow('Authentication failed');
    });
  });
});
