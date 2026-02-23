import { describe, it, expect, vi, beforeEach } from 'vitest';
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

// Mock Stripe
const mockStripePaymentIntentsCreate = vi.fn();
class MockStripe {
  paymentIntents = {
    create: mockStripePaymentIntentsCreate,
  };
}

vi.mock('stripe', () => ({
  default: MockStripe,
}));

// Mock Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseRpc = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
    rpc: mockSupabaseRpc,
  },
}));

describe('POST /api/credits/purchase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  });

  it('should create payment intent for 50 credits ($5)', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/purchase');
    const userId = 'user-uuid-123';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-123' });

    // Mock user fetch
    mockSupabaseFrom.mockReturnValueOnce({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValueOnce({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValueOnce({
      single: mockSupabaseSingle,
    });
    mockSupabaseSingle.mockResolvedValueOnce({
      data: { email: 'user@example.com' },
      error: null,
    });

    // Mock Stripe payment intent creation
    mockStripePaymentIntentsCreate.mockResolvedValueOnce({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret_456',
      amount: 500, // $5.00 in cents
      currency: 'usd',
      status: 'requires_payment_method',
    });

    const req = {
      method: 'POST',
      body: {
        credits: 50,
      },
    } as unknown as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      paymentIntentId: 'pi_test_123',
      clientSecret: 'pi_test_123_secret_456',
      amount: 500,
      credits: 50,
    });

    expect(mockStripePaymentIntentsCreate).toHaveBeenCalledWith({
      amount: 500,
      currency: 'usd',
      metadata: {
        userId,
        clerkId: 'clerk-123',
        credits: '50',
        type: 'credit_purchase',
      },
      description: 'Purchase 50 minutes of transcription credits',
    });
  });

  it('should apply volume discount for 175 credits ($15)', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/purchase');
    const userId = 'user-uuid-123';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-123' });

    mockSupabaseFrom.mockReturnValueOnce({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValueOnce({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValueOnce({
      single: mockSupabaseSingle,
    });
    mockSupabaseSingle.mockResolvedValueOnce({
      data: { email: 'user@example.com' },
      error: null,
    });

    mockStripePaymentIntentsCreate.mockResolvedValueOnce({
      id: 'pi_test_456',
      client_secret: 'pi_test_456_secret_789',
      amount: 1500,
      currency: 'usd',
      status: 'requires_payment_method',
    });

    const req = {
      method: 'POST',
      body: {
        credits: 175,
      },
    } as unknown as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(mockStripePaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1500, // $15.00
        metadata: expect.objectContaining({
          credits: '175',
        }),
      })
    );
  });

  it('should reject invalid credit amounts', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/purchase');

    mockRequireAuth.mockResolvedValueOnce({ userId: 'user-123', clerkId: 'clerk-123' });

    const req = {
      method: 'POST',
      body: {
        credits: 25, // Not a valid tier
      },
    } as unknown as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid credit amount. Choose from: 50, 175, 400, 750',
    });
  });

  it('should return 401 for unauthenticated requests', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/purchase');

    const AuthError = (await import('../../middleware/auth')).AuthError;
    mockRequireAuth.mockRejectedValueOnce(new AuthError('Unauthorized', 401));

    const req = {
      method: 'POST',
      body: { credits: 50 },
    } as unknown as VercelRequest;

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

  it('should return 405 for non-POST methods', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/purchase');

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
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should handle Stripe errors gracefully', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/purchase');
    const userId = 'user-uuid-123';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-123' });

    mockSupabaseFrom.mockReturnValueOnce({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValueOnce({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValueOnce({
      single: mockSupabaseSingle,
    });
    mockSupabaseSingle.mockResolvedValueOnce({
      data: { email: 'user@example.com' },
      error: null,
    });

    mockStripePaymentIntentsCreate.mockRejectedValueOnce(new Error('Card declined'));

    const req = {
      method: 'POST',
      body: { credits: 50 },
    } as unknown as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to create payment intent',
    });
  });
});
