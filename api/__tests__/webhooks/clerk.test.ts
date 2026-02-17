import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock Svix webhook verification
const mockVerify = vi.fn((payload) => {
  return JSON.parse(payload); // Return the parsed webhook event
});

// Create a proper mock constructor for Webhook
class MockWebhook {
  verify = mockVerify;
}

vi.mock('svix', () => ({
  Webhook: MockWebhook,
}));

// Mock Supabase admin
const mockSupabaseFrom = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseDelete = vi.fn();
const mockSupabaseEq = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set required environment variable
    process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret_123';

    // Setup default mock chains
    mockSupabaseFrom.mockImplementation(() => ({
      insert: mockSupabaseInsert,
      update: mockSupabaseUpdate,
      delete: mockSupabaseDelete,
    }));
    mockSupabaseInsert.mockResolvedValue({ data: null, error: null });
    mockSupabaseUpdate.mockReturnValue({ eq: mockSupabaseEq });
    mockSupabaseDelete.mockReturnValue({ eq: mockSupabaseEq });
    mockSupabaseEq.mockResolvedValue({ data: null, error: null });
  });

  describe('user.created event', () => {
    it('should create user in Supabase on valid webhook', async () => {
      // Arrange
      const webhookPayload = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'John',
          last_name: 'Doe',
          image_url: 'https://example.com/avatar.jpg',
        },
      };

      mockVerify.mockReturnValue(webhookPayload);

      const { default: handler } = await import('../../webhooks/clerk');
      const mockReq = {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'valid-signature',
        },
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Act
      await handler(
        mockReq as unknown as VercelRequest | VercelResponse,
        mockRes as unknown as VercelRequest | VercelResponse
      );

      // Assert
      expect(mockVerify).toHaveBeenCalled();
      expect(mockSupabaseFrom).toHaveBeenCalledWith('users');
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        clerk_user_id: 'user_123',
        email: 'test@example.com',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });

    it('should handle missing name fields gracefully', async () => {
      // Arrange
      const webhookPayload = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: null,
          last_name: null,
        },
      };

      mockVerify.mockReturnValue(webhookPayload);

      const { default: handler } = await import('../../webhooks/clerk');
      const mockReq = {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'valid-signature',
        },
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Act
      await handler(
        mockReq as unknown as VercelRequest | VercelResponse,
        mockRes as unknown as VercelRequest | VercelResponse
      );

      // Assert
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        clerk_user_id: 'user_123',
        email: 'test@example.com',
        full_name: null,
        avatar_url: undefined,
      });
    });
  });

  describe('user.updated event', () => {
    it('should update user in Supabase', async () => {
      // Arrange
      const webhookPayload = {
        type: 'user.updated',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'updated@example.com' }],
          first_name: 'Jane',
          last_name: 'Smith',
        },
      };

      mockVerify.mockReturnValue(webhookPayload);

      const { default: handler } = await import('../../webhooks/clerk');
      const mockReq = {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'valid-signature',
        },
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Act
      await handler(
        mockReq as unknown as VercelRequest | VercelResponse,
        mockRes as unknown as VercelRequest | VercelResponse
      );

      // Assert
      expect(mockSupabaseUpdate).toHaveBeenCalledWith({
        email: 'updated@example.com',
        full_name: 'Jane Smith',
        avatar_url: undefined,
        updated_at: expect.any(String),
      });
      expect(mockSupabaseEq).toHaveBeenCalledWith('clerk_user_id', 'user_123');
    });
  });

  describe('user.deleted event', () => {
    it('should delete user from Supabase', async () => {
      // Arrange
      const webhookPayload = {
        type: 'user.deleted',
        data: {
          id: 'user_123',
        },
      };

      mockVerify.mockReturnValue(webhookPayload);

      const { default: handler } = await import('../../webhooks/clerk');
      const mockReq = {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'valid-signature',
        },
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Act
      await handler(
        mockReq as unknown as VercelRequest | VercelResponse,
        mockRes as unknown as VercelRequest | VercelResponse
      );

      // Assert
      expect(mockSupabaseDelete).toHaveBeenCalled();
      expect(mockSupabaseEq).toHaveBeenCalledWith('clerk_user_id', 'user_123');
    });
  });

  describe('Security', () => {
    it('should reject invalid webhook signature', async () => {
      // Arrange
      mockVerify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const { default: handler } = await import('../../webhooks/clerk');
      const mockReq = {
        method: 'POST',
        body: {},
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'invalid-signature',
        },
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      // Act
      await handler(
        mockReq as unknown as VercelRequest | VercelResponse,
        mockRes as unknown as VercelRequest | VercelResponse
      );

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith(expect.stringContaining('Webhook Error'));
    });

    it('should reject non-POST requests', async () => {
      // Arrange
      const { default: handler } = await import('../../webhooks/clerk');
      const mockReq = {
        method: 'GET',
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Act
      await handler(
        mockReq as unknown as VercelRequest | VercelResponse,
        mockRes as unknown as VercelRequest | VercelResponse
      );

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(405);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      const webhookPayload = {
        type: 'user.created',
        data: {
          id: 'user_123',
          email_addresses: [{ email_address: 'test@example.com' }],
        },
      };

      mockVerify.mockReturnValue(webhookPayload);
      mockSupabaseInsert.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { default: handler } = await import('../../webhooks/clerk');
      const mockReq = {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'svix-id': 'msg_123',
          'svix-timestamp': '1234567890',
          'svix-signature': 'valid-signature',
        },
      };
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Act
      await handler(
        mockReq as unknown as VercelRequest | VercelResponse,
        mockRes as unknown as VercelRequest | VercelResponse
      );

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to sync user',
      });
    });
  });
});
