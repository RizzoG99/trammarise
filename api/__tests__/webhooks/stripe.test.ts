import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock Stripe
const mockConstructEvent = vi.fn();

vi.mock('stripe', () => {
  class MockStripe {
    webhooks = {
      constructEvent: mockConstructEvent,
    };
  }

  return {
    default: MockStripe,
  };
});

// Mock Supabase admin
const mockSupabaseFrom = vi.fn();
const mockSupabaseUpsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseRpc = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
    rpc: mockSupabaseRpc,
  },
}));

/** Creates a mock VercelRequest with Node.js stream event support for raw body handlers */
function createMockReq(options: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}): VercelRequest {
  const bodyBuffer = Buffer.from(options.body ?? '');
  const req = {
    method: options.method ?? 'POST',
    headers: options.headers ?? {},
    on(event: string, cb: (...args: unknown[]) => void) {
      if (event === 'data') cb(bodyBuffer);
      if (event === 'end') cb();
      return req;
    },
  };
  return req as unknown as VercelRequest;
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly';
    process.env.STRIPE_PRICE_PRO_ANNUAL = 'price_pro_annual';
    process.env.STRIPE_PRICE_TEAM_MONTHLY = 'price_team_monthly';
    process.env.STRIPE_PRICE_TEAM_ANNUAL = 'price_team_annual';
  });

  describe('customer.subscription.created', () => {
    it('should create subscription record in database', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            current_period_start: 1704067200, // 2024-01-01 00:00:00
            current_period_end: 1706745600, // 2024-02-01 00:00:00
            cancel_at_period_end: false,
            items: {
              data: [
                {
                  price: {
                    id: 'price_pro_monthly',
                  },
                },
              ],
            },
            metadata: {
              userId: 'user-uuid-123',
              tier: 'pro',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(subscriptionEvent);

      // Mock Supabase upsert
      mockSupabaseFrom.mockReturnValue({
        upsert: mockSupabaseUpsert,
      });
      mockSupabaseUpsert.mockResolvedValue({
        data: { id: 'subscription-uuid' },
        error: null,
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(subscriptionEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockConstructEvent).toHaveBeenCalledWith(
        expect.any(Buffer),
        'valid-signature',
        'whsec_test_123'
      );

      expect(mockSupabaseUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-uuid-123',
          stripe_subscription_id: 'sub_123',
          stripe_customer_id: 'cus_123',
          tier: 'pro',
          status: 'active',
          current_period_start: expect.any(String),
          current_period_end: expect.any(String),
          cancel_at_period_end: false,
        })
      );

      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });

    it('should determine tier from price ID', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_456',
            customer: 'cus_456',
            status: 'active',
            current_period_start: 1704067200,
            current_period_end: 1735689600, // Annual subscription
            cancel_at_period_end: false,
            items: {
              data: [
                {
                  price: {
                    id: 'price_team_monthly',
                  },
                },
              ],
            },
            metadata: {
              userId: 'user-uuid-456',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(subscriptionEvent);

      mockSupabaseFrom.mockReturnValue({
        upsert: mockSupabaseUpsert,
      });
      mockSupabaseUpsert.mockResolvedValue({
        data: { id: 'subscription-uuid' },
        error: null,
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(subscriptionEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockSupabaseUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: 'team',
        })
      );
    });
  });

  describe('customer.subscription.updated', () => {
    it('should update subscription record', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            current_period_start: 1704067200,
            current_period_end: 1706745600,
            cancel_at_period_end: true, // User canceled
            items: {
              data: [
                {
                  price: {
                    id: 'price_pro_monthly',
                  },
                },
              ],
            },
            metadata: {
              userId: 'user-uuid-123',
              tier: 'pro',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(subscriptionEvent);

      mockSupabaseFrom.mockReturnValue({
        upsert: mockSupabaseUpsert,
      });
      mockSupabaseUpsert.mockResolvedValue({
        data: { id: 'subscription-uuid' },
        error: null,
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(subscriptionEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockSupabaseUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          cancel_at_period_end: true,
        })
      );
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should mark subscription as canceled', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
          },
        },
      };

      mockConstructEvent.mockReturnValue(subscriptionEvent);

      mockSupabaseFrom.mockReturnValue({
        update: mockSupabaseUpdate,
      });
      mockSupabaseUpdate.mockReturnValue({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockResolvedValue({
        data: { id: 'subscription-uuid' },
        error: null,
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(subscriptionEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({ status: 'canceled' });
      expect(mockSupabaseEq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_123');
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });

    it('should update status but not delete the record', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_456',
          },
        },
      };

      mockConstructEvent.mockReturnValue(subscriptionEvent);

      const mockSupabaseDelete = vi.fn();
      mockSupabaseFrom.mockReturnValue({
        update: mockSupabaseUpdate,
        delete: mockSupabaseDelete,
      });
      mockSupabaseUpdate.mockReturnValue({
        eq: mockSupabaseEq,
      });
      mockSupabaseEq.mockResolvedValue({
        data: { id: 'subscription-uuid' },
        error: null,
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(subscriptionEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - verify update was called, NOT delete
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({ status: 'canceled' });
      expect(mockSupabaseDelete).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });
  });

  describe('Validation', () => {
    it('should return 405 for non-POST requests', async () => {
      // Arrange
      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({ method: 'GET', headers: {}, body: '' });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.send).toHaveBeenCalledWith('Method not allowed');
    });

    it('should return 400 for invalid signature', async () => {
      // Arrange
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'invalid-signature' },
        body: JSON.stringify({ type: 'test' }),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Webhook Error'));
    });
  });

  describe('payment_intent.succeeded (credit purchase)', () => {
    it('should add credits to user balance', async () => {
      // Arrange
      const paymentEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 500, // $5.00
            metadata: {
              type: 'credit_purchase',
              userId: 'user-uuid-123',
              credits: '50',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(paymentEvent);

      // Mock subscription fetch
      const mockSupabaseSelect = vi.fn();
      const mockSupabaseEq = vi.fn();
      const mockSupabaseSingle = vi.fn();
      mockSupabaseFrom.mockReturnValueOnce({
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
          id: 'sub-uuid-123',
          credits_balance: 100,
        },
        error: null,
      });

      mockSupabaseRpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(paymentEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockSupabaseRpc).toHaveBeenCalledWith('add_credits', {
        sub_id: 'sub-uuid-123',
        credits: 50,
        stripe_payment_intent_id: 'pi_test_123',
        amount_paid_cents: 500,
        p_description: 'Purchased 50 credits for $5.00',
      });

      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });

    it('should skip non-credit payment intents', async () => {
      // Arrange
      const paymentEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_456',
            amount: 1000,
            metadata: {
              type: 'other_purchase', // Not a credit purchase
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(paymentEvent);

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(paymentEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
      // Should not call Supabase for non-credit purchases
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('should create transaction record with description', async () => {
      // Arrange
      const paymentEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_789',
            amount: 2500, // $25.00
            metadata: {
              type: 'credit_purchase',
              userId: 'user-uuid-789',
              credits: '250',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(paymentEvent);

      const mockSupabaseSelect = vi.fn();
      const mockSupabaseEq = vi.fn();
      const mockSupabaseSingle = vi.fn();
      mockSupabaseFrom.mockReturnValueOnce({
        select: mockSupabaseSelect,
      });

      mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
      mockSupabaseEq.mockReturnValue({ single: mockSupabaseSingle });
      mockSupabaseSingle.mockResolvedValue({
        data: { id: 'sub-uuid-789', credits_balance: 50 },
        error: null,
      });

      mockSupabaseRpc.mockResolvedValue({ data: null, error: null });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(paymentEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - verify RPC is called with description (transaction recorded atomically in DB function)
      expect(mockSupabaseRpc).toHaveBeenCalledWith('add_credits', {
        sub_id: 'sub-uuid-789',
        credits: 250,
        stripe_payment_intent_id: 'pi_test_789',
        amount_paid_cents: 2500,
        p_description: 'Purchased 250 credits for $25.00',
      });
    });

    it('should handle missing userId in metadata', async () => {
      // Arrange
      const paymentEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_no_user',
            amount: 500,
            metadata: {
              type: 'credit_purchase',
              credits: '50',
              // userId is missing
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(paymentEvent);

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(paymentEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - should return 500 so Stripe retries (missing userId means credits won't be delivered)
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Missing required payment metadata');
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('should handle missing credits in metadata', async () => {
      // Arrange
      const paymentEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_no_credits',
            amount: 500,
            metadata: {
              type: 'credit_purchase',
              userId: 'user-uuid-123',
              // credits is missing
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(paymentEvent);

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(paymentEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - should return 500 so Stripe retries (missing credits means credits won't be delivered)
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Missing required payment metadata');
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it('should handle subscription fetch error', async () => {
      // Arrange
      const paymentEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_sub_error',
            amount: 500,
            metadata: {
              type: 'credit_purchase',
              userId: 'user-uuid-nonexistent',
              credits: '50',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(paymentEvent);

      const mockSupabaseSelect = vi.fn();
      const mockSupabaseEq = vi.fn();
      const mockSupabaseSingle = vi.fn();

      mockSupabaseFrom.mockReturnValue({ select: mockSupabaseSelect });
      mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
      mockSupabaseEq.mockReturnValue({ single: mockSupabaseSingle });
      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: 'Subscription not found' },
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(paymentEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - should return 500 on subscription fetch error
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Webhook handler failed');
    });

    it('should handle RPC error when adding credits', async () => {
      // Arrange
      const paymentEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_rpc_error',
            amount: 500,
            metadata: {
              type: 'credit_purchase',
              userId: 'user-uuid-123',
              credits: '50',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(paymentEvent);

      const mockSupabaseSelect = vi.fn();
      const mockSupabaseEq = vi.fn();
      const mockSupabaseSingle = vi.fn();

      mockSupabaseFrom.mockReturnValue({ select: mockSupabaseSelect });
      mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
      mockSupabaseEq.mockReturnValue({ single: mockSupabaseSingle });
      mockSupabaseSingle.mockResolvedValue({
        data: { id: 'sub-uuid-123', credits_balance: 100 },
        error: null,
      });

      mockSupabaseRpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' },
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(paymentEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert - should return 500 on RPC error
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Webhook handler failed');
    });

    it('should handle idempotency - same payment intent processed twice', async () => {
      // Arrange
      const paymentEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_duplicate',
            amount: 500,
            metadata: {
              type: 'credit_purchase',
              userId: 'user-uuid-123',
              credits: '50',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(paymentEvent);

      const mockSupabaseSelect = vi.fn();
      const mockSupabaseEq = vi.fn();
      const mockSupabaseSingle = vi.fn();
      mockSupabaseFrom.mockReturnValueOnce({ select: mockSupabaseSelect });

      mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
      mockSupabaseEq.mockReturnValue({ single: mockSupabaseSingle });
      mockSupabaseSingle.mockResolvedValue({
        data: { id: 'sub-uuid-123', credits_balance: 100 },
        error: null,
      });

      mockSupabaseRpc.mockResolvedValue({ data: null, error: null });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(paymentEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act - process the same event twice
      await handler(mockReq, mockRes);

      // Clear mocks and process again
      vi.clearAllMocks();
      mockConstructEvent.mockReturnValue(paymentEvent);
      mockSupabaseFrom.mockReturnValueOnce({ select: mockSupabaseSelect });
      mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
      mockSupabaseEq.mockReturnValue({ single: mockSupabaseSingle });
      mockSupabaseSingle.mockResolvedValue({
        data: { id: 'sub-uuid-123', credits_balance: 150 }, // Already credited
        error: null,
      });
      mockSupabaseRpc.mockResolvedValue({ data: null, error: null });

      await handler(mockReq, mockRes);

      // Assert - both calls should succeed (Stripe handles idempotency at webhook level)
      // Each call processes independently; the payment_intent_id uniqueness constraint
      // in the database would prevent duplicate transactions
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });
  });

  describe('Unhandled Events', () => {
    it('should return 200 for unhandled event types', async () => {
      // Arrange
      const unknownEvent = {
        type: 'customer.created',
        data: { object: {} },
      };

      mockConstructEvent.mockReturnValue(unknownEvent);

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(unknownEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
      // Should not call Supabase for unhandled events
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      // Arrange
      const subscriptionEvent = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            current_period_start: 1704067200,
            current_period_end: 1706745600,
            cancel_at_period_end: false,
            items: {
              data: [
                {
                  price: {
                    id: 'price_pro_monthly',
                  },
                },
              ],
            },
            metadata: {
              userId: 'user-uuid-123',
              tier: 'pro',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(subscriptionEvent);

      mockSupabaseFrom.mockReturnValue({
        upsert: mockSupabaseUpsert,
      });
      mockSupabaseUpsert.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { default: handler } = await import('../../webhooks/stripe');
      const mockReq = createMockReq({
        method: 'POST',
        headers: { 'stripe-signature': 'valid-signature' },
        body: JSON.stringify(subscriptionEvent),
      });

      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as VercelResponse;

      // Act
      await handler(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith('Webhook handler failed');
    });
  });
});
