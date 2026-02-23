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
const mockRequireAuth = vi.fn(async (req) => {
  if (!req.headers.authorization) {
    throw new AuthError('Unauthorized', 401);
  }
  return { userId: 'test-user-id', clerkId: 'clerk_123' };
});
vi.mock('../../middleware/auth', () => ({
  requireAuth: mockRequireAuth,
  AuthError,
}));

// Mock Supabase admin
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

// Mock Stripe - must be before any imports of the handler
const mockCheckoutSessionsCreate = vi.fn();

vi.mock('stripe', () => {
  // Create a proper class mock that can be used with 'new'
  class MockStripe {
    checkout = {
      sessions: {
        create: mockCheckoutSessionsCreate,
      },
    };
  }

  return {
    default: MockStripe,
  };
});

describe('POST /api/stripe/create-checkout-session', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly';
    process.env.STRIPE_PRICE_PRO_ANNUAL = 'price_pro_annual';
    process.env.STRIPE_PRICE_TEAM_MONTHLY = 'price_team_monthly';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:5173';

    mockRequireAuth.mockResolvedValue({
      userId: 'user-uuid-123',
      clerkId: 'user_clerk123',
    });

    // Mock user lookup
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValue({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValue({
      single: mockSupabaseSingle,
    });
    mockSupabaseSingle.mockResolvedValue({
      data: {
        id: 'user-uuid-123',
        email: 'test@example.com',
      },
      error: null,
    });
  });

  describe('Successful Checkout Session Creation', () => {
    it('should create checkout session for Pro monthly subscription', async () => {
      // Arrange
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { tier: 'pro', interval: 'month' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: 'test@example.com',
          mode: 'subscription',
          success_url: expect.stringContaining('/settings?success=true'),
          cancel_url: expect.stringContaining('/pricing'),
          metadata: {
            userId: 'user-uuid-123',
            clerkId: 'user_clerk123',
            tier: 'pro',
            interval: 'month',
          },
        })
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });
    });

    it('should create checkout session for Pro annual subscription', async () => {
      // Arrange
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
      });

      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { tier: 'pro', interval: 'year' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            tier: 'pro',
            interval: 'year',
          }),
        })
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should create checkout session for Team tier', async () => {
      // Arrange
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_789',
        url: 'https://checkout.stripe.com/pay/cs_test_789',
      });

      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { tier: 'team', interval: 'month' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Validation', () => {
    it('should return 405 for non-POST requests', async () => {
      // Arrange
      const { default: handler } = await import('../../stripe/create-checkout-session');
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

    it('should return 400 for invalid tier', async () => {
      // Arrange
      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { tier: 'invalid', interval: 'month' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid tier or interval' });
    });

    it('should return 400 for invalid interval', async () => {
      // Arrange
      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { tier: 'pro', interval: 'invalid' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid tier or interval' });
    });

    it('should return 400 if tier is missing', async () => {
      // Arrange
      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { interval: 'month' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid tier or interval' });
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      // Arrange
      mockRequireAuth.mockRejectedValue(new AuthError('Unauthorized', 401));

      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { tier: 'pro', interval: 'month' },
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
    it('should return 500 on Stripe API error', async () => {
      // Arrange
      mockCheckoutSessionsCreate.mockRejectedValue(new Error('API connection failed'));

      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { tier: 'pro', interval: 'month' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to create checkout session' });
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const { default: handler } = await import('../../stripe/create-checkout-session');
      const mockReq = {
        method: 'POST',
        body: { tier: 'pro', interval: 'month' },
      } as unknown as VercelRequest;

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});
