import { describe, it, expect, vi, beforeEach } from 'vitest';

// Unmock the auth module to test the real implementation
vi.unmock('../../middleware/auth');

// Create mock functions
const mockGetUser = vi.fn();

// Mock modules BEFORE importing the module under test
vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
  },
}));

describe('requireAuth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Authentication', () => {
    it('should extract userId from valid JWT and return user data', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'uuid-123' } },
        error: null,
      });

      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as Parameters<typeof requireAuth>[0];

      const result = await requireAuth(mockReq);

      expect(result).toEqual({ userId: 'uuid-123' });
      expect(mockGetUser).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('Authentication Errors', () => {
    it('should throw 401 when Authorization header is missing', async () => {
      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: {},
      } as unknown as Parameters<typeof requireAuth>[0];

      await expect(requireAuth(mockReq)).rejects.toThrow('Missing authorization token');
    });

    it('should throw 401 when token is invalid', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' },
      });

      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: { authorization: 'Bearer bad-token' },
      } as unknown as Parameters<typeof requireAuth>[0];

      await expect(requireAuth(mockReq)).rejects.toThrow('Invalid or expired token');
    });

    it('should throw 401 when scheme is not Bearer (e.g. Basic)', async () => {
      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: { authorization: 'Basic dXNlcjpwYXNz' },
      } as unknown as Parameters<typeof requireAuth>[0];

      await expect(requireAuth(mockReq)).rejects.toThrow('Missing authorization token');
    });

    it('should throw 401 when Bearer token is empty', async () => {
      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: { authorization: 'Bearer ' },
      } as unknown as Parameters<typeof requireAuth>[0];

      await expect(requireAuth(mockReq)).rejects.toThrow('Missing authorization token');
    });

    it('should use first element when authorization header is an array', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'uuid-array' } },
        error: null,
      });

      const { requireAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: { authorization: ['Bearer array-token', 'Bearer second-token'] },
      } as unknown as Parameters<typeof requireAuth>[0];

      const result = await requireAuth(mockReq);
      expect(result).toEqual({ userId: 'uuid-array' });
      expect(mockGetUser).toHaveBeenCalledWith('array-token');
    });
  });

  describe('optionalAuth', () => {
    it('should return null when no auth header is present', async () => {
      const { optionalAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: {},
      } as unknown as Parameters<typeof optionalAuth>[0];

      const result = await optionalAuth(mockReq);
      expect(result).toBeNull();
    });

    it('should return userId when token is valid', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'uuid-123' } },
        error: null,
      });

      const { optionalAuth } = await import('../../middleware/auth');

      const mockReq = {
        method: 'GET',
        url: '/api/test',
        headers: { authorization: 'Bearer valid-token' },
      } as unknown as Parameters<typeof optionalAuth>[0];

      const result = await optionalAuth(mockReq);
      expect(result).toEqual({ userId: 'uuid-123' });
    });
  });
});
