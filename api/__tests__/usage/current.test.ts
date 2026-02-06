import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock auth middleware
const mockRequireAuth = vi.fn();
vi.mock('../../middleware/auth', () => ({
  requireAuth: mockRequireAuth,
  AuthError: class AuthError extends Error {
    constructor(
      message: string,
      public statusCode: number
    ) {
      super(message);
      this.name = 'AuthError';
    }
  },
}));

// Mock Supabase admin
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSecondEq = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('GET /api/usage/current', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Set a fixed date for testing: January 15, 2024
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return usage statistics for current billing period', async () => {
    // Arrange
    const { default: handler } = await import('../../usage/current');
    const userId = 'user-uuid-123';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-123' });

    // Mock Supabase query chain: .from().select().eq().eq()
    mockSupabaseFrom.mockReturnValueOnce({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValueOnce({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValueOnce({
      eq: mockSupabaseSecondEq,
    });
    mockSupabaseSecondEq.mockResolvedValueOnce({
      data: [{ minutes_consumed: 10 }, { minutes_consumed: 15 }, { minutes_consumed: 5 }],
      error: null,
    });

    const req = {
      method: 'GET',
    } as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalMinutes: 30,
      eventCount: 3,
      billingPeriod: '2024-01-01T00:00:00.000Z',
    });

    // Verify correct billing period was queried (2024-01-01)
    expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', userId);
    expect(mockSupabaseSecondEq).toHaveBeenCalledWith('billing_period', '2024-01-01');
  });

  it('should return zero usage for users with no events', async () => {
    // Arrange
    const { default: handler } = await import('../../usage/current');
    const userId = 'user-uuid-123';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-123' });

    mockSupabaseFrom.mockReturnValueOnce({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValueOnce({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValueOnce({
      eq: mockSupabaseSecondEq,
    });
    mockSupabaseSecondEq.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const req = {
      method: 'GET',
    } as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalMinutes: 0,
      eventCount: 0,
      billingPeriod: '2024-01-01T00:00:00.000Z',
    });
  });

  it('should return 401 for unauthenticated requests', async () => {
    // Arrange
    const { default: handler } = await import('../../usage/current');

    const AuthError = (await import('../../middleware/auth')).AuthError;
    mockRequireAuth.mockRejectedValueOnce(new AuthError('Unauthorized', 401));

    const req = {
      method: 'GET',
    } as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should return 405 for non-GET methods', async () => {
    // Arrange
    const { default: handler } = await import('../../usage/current');

    const req = {
      method: 'POST',
    } as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    const { default: handler } = await import('../../usage/current');
    const userId = 'user-uuid-123';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-123' });

    mockSupabaseFrom.mockReturnValueOnce({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValueOnce({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValueOnce({
      eq: mockSupabaseSecondEq,
    });
    mockSupabaseSecondEq.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database connection error' },
    });

    const req = {
      method: 'GET',
    } as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch usage data' });
  });

  it('should calculate correct billing period for different months', async () => {
    // Test different dates to ensure billing period is always the 1st of the month
    const testCases = [
      { date: '2024-02-28T23:59:59Z', expectedPeriod: '2024-02-01' },
      { date: '2024-03-15T12:00:00Z', expectedPeriod: '2024-03-01' },
      { date: '2024-12-01T00:00:00Z', expectedPeriod: '2024-12-01' },
    ];

    for (const testCase of testCases) {
      vi.clearAllMocks();
      vi.setSystemTime(new Date(testCase.date));

      const { default: handler } = await import('../../usage/current');
      const userId = 'user-uuid-123';

      mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-123' });

      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });
      mockSupabaseSelect.mockReturnValueOnce({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockReturnValueOnce({
        eq: mockSupabaseSecondEq,
      });
      mockSupabaseSecondEq.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const req = { method: 'GET' } as VercelRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      await handler(req, res);

      // Verify correct billing period was queried
      expect(mockSupabaseSecondEq).toHaveBeenCalledWith('billing_period', testCase.expectedPeriod);
    }
  });
});
