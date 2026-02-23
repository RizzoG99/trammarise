import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock AuthError class
class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
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
const mockSupabaseMaybeSingle = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

// Mock FREE_SUBSCRIPTION constant
vi.mock('../../../src/context/subscription-tiers', () => ({
  FREE_SUBSCRIPTION: {
    id: 'free',
    tier: 'free',
    status: 'active',
    currentPeriodStart: '2024-01-01T00:00:00.000Z',
    currentPeriodEnd: '2024-01-31T00:00:00.000Z',
    cancelAtPeriodEnd: false,
    minutesIncluded: 0,
    minutesUsed: 0,
    creditsBalance: 0,
  },
}));

describe('GET /api/subscriptions/current', () => {
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
      maybeSingle: mockSupabaseMaybeSingle,
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(new AuthError('Unauthorized', 401));

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should return 405 for non-GET methods', async () => {
      // Arrange
      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'POST',
      } as VercelRequest;

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

  describe('Active Subscriptions', () => {
    it('should return active subscription for authenticated user', async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue({ userId: 'user-uuid-123', clerkId: 'clerk-123' });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: {
          id: 'sub-uuid-456',
          tier: 'pro',
          status: 'active',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          cancel_at_period_end: false,
          minutes_used: 125,
          credits_balance: 50,
        },
        error: null,
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRequireAuth).toHaveBeenCalledWith(mockReq);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', 'user-uuid-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 'sub-uuid-456',
        tier: 'pro',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        minutesUsed: 125,
        creditsBalance: 50,
      });
    });

    it('should include tier, status, quotas, and credits in response', async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue({ userId: 'user-uuid-456', clerkId: 'clerk-456' });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: {
          id: 'sub-uuid-789',
          tier: 'team',
          status: 'active',
          current_period_start: '2024-01-15T00:00:00Z',
          current_period_end: '2024-02-15T00:00:00Z',
          cancel_at_period_end: false,
          minutes_used: 850,
          credits_balance: 200,
        },
        error: null,
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

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
          tier: 'team',
          status: 'active',
          minutesUsed: 850,
          creditsBalance: 200,
        })
      );
    });
  });

  describe('Free Tier Default', () => {
    it('should return free tier for users without subscription', async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue({ userId: 'user-uuid-new', clerkId: 'clerk-new' });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 'free',
        tier: 'free',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00.000Z',
        currentPeriodEnd: '2024-01-31T00:00:00.000Z',
        cancelAtPeriodEnd: false,
        minutesIncluded: 0,
        minutesUsed: 0,
        creditsBalance: 0,
      });
    });
  });

  describe('Subscription Status Handling', () => {
    it('should handle canceled subscriptions', async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue({ userId: 'user-uuid-canceled', clerkId: 'clerk-c' });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: {
          id: 'sub-uuid-canceled',
          tier: 'pro',
          status: 'canceled',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          cancel_at_period_end: true,
          minutes_used: 50,
          credits_balance: 10,
        },
        error: null,
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

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
          status: 'canceled',
          cancelAtPeriodEnd: true,
        })
      );
    });

    it('should handle past_due subscriptions', async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue({ userId: 'user-uuid-past-due', clerkId: 'clerk-pd' });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: {
          id: 'sub-uuid-past-due',
          tier: 'pro',
          status: 'past_due',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          cancel_at_period_end: false,
          minutes_used: 300,
          credits_balance: 0,
        },
        error: null,
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

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
          status: 'past_due',
        })
      );
    });
  });

  describe('Missing Fields Handling', () => {
    it('should handle missing optional fields gracefully', async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue({ userId: 'user-uuid-minimal', clerkId: 'clerk-min' });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: {
          id: 'sub-uuid-minimal',
          tier: 'pro',
          status: 'active',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          // Missing: cancel_at_period_end, minutes_used, credits_balance
        },
        error: null,
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

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
          cancelAtPeriodEnd: false,
          minutesUsed: 0,
          creditsBalance: 0,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue({ userId: 'user-uuid-error', clerkId: 'clerk-err' });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch subscription' });
    });
  });

  describe('Renewal Boundary Cases', () => {
    it('should handle subscription at period boundary (renewal)', async () => {
      // Arrange
      const now = new Date('2024-02-01T00:00:00Z');
      mockRequireAuth.mockResolvedValue({ userId: 'user-uuid-renew', clerkId: 'clerk-renew' });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: {
          id: 'sub-uuid-renew',
          tier: 'pro',
          status: 'active',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: now.toISOString(), // Exactly at boundary
          cancel_at_period_end: false,
          minutes_used: 0, // Reset at renewal
          credits_balance: 100,
        },
        error: null,
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

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
          currentPeriodEnd: now.toISOString(),
          minutesUsed: 0,
        })
      );
    });

    it('should handle subscription scheduled for cancellation at period end', async () => {
      // Arrange
      mockRequireAuth.mockResolvedValue({
        userId: 'user-uuid-scheduled-cancel',
        clerkId: 'clerk-sc',
      });

      mockSupabaseMaybeSingle.mockResolvedValue({
        data: {
          id: 'sub-uuid-sc',
          tier: 'pro',
          status: 'active',
          current_period_start: '2024-01-01T00:00:00Z',
          current_period_end: '2024-02-01T00:00:00Z',
          cancel_at_period_end: true, // Scheduled for cancellation
          minutes_used: 400,
          credits_balance: 25,
        },
        error: null,
      });

      const { default: handler } = await import('../../subscriptions/current');
      const mockReq = {
        method: 'GET',
      } as VercelRequest;

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
          status: 'active',
          cancelAtPeriodEnd: true,
        })
      );
    });
  });
});
