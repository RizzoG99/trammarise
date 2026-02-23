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

// Mock Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseOrder = vi.fn();
const mockSupabaseLimit = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mockSupabaseFrom,
  },
}));

describe('GET /api/credits/balance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return current balance for authenticated user', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/balance');
    const userId = 'user-uuid-123';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-123' });

    // Mock subscription fetch
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
      data: { credits_balance: 150 },
      error: null,
    });

    const req = {
      method: 'GET',
      query: {},
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
      credits: 150,
      history: [],
    });

    expect(mockSupabaseFrom).toHaveBeenCalledWith('subscriptions');
    expect(mockSupabaseSelect).toHaveBeenCalledWith('credits_balance');
    expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', userId);
  });

  it('should return zero balance for users without credits', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/balance');
    const userId = 'user-uuid-456';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-456' });

    // Mock subscription not found (PGRST116 = no rows returned)
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
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });

    const req = {
      method: 'GET',
      query: {},
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
      credits: 0,
      history: [],
    });
  });

  it('should include recent transactions when requested', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/balance');
    const userId = 'user-uuid-789';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-789' });

    // Mock subscription fetch
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
      data: { credits_balance: 75 },
      error: null,
    });

    // Mock transactions fetch
    mockSupabaseFrom.mockReturnValueOnce({
      select: mockSupabaseSelect,
    });
    mockSupabaseSelect.mockReturnValueOnce({
      eq: mockSupabaseEq,
    });
    mockSupabaseEq.mockReturnValueOnce({
      order: mockSupabaseOrder,
    });
    mockSupabaseOrder.mockReturnValueOnce({
      limit: mockSupabaseLimit,
    });
    mockSupabaseLimit.mockResolvedValueOnce({
      data: [
        {
          id: 'tx-1',
          transaction_type: 'purchase',
          credits_amount: 50,
          description: 'Credit purchase',
          created_at: '2026-02-16T10:00:00Z',
        },
        {
          id: 'tx-2',
          transaction_type: 'usage',
          credits_amount: -25,
          description: 'Transcription usage',
          created_at: '2026-02-16T11:00:00Z',
        },
      ],
      error: null,
    });

    const req = {
      method: 'GET',
      query: { include_history: 'true' },
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
      credits: 75,
      history: [
        {
          id: 'tx-1',
          type: 'purchase',
          amount: 50,
          description: 'Credit purchase',
          created_at: '2026-02-16T10:00:00Z',
        },
        {
          id: 'tx-2',
          type: 'usage',
          amount: -25,
          description: 'Transcription usage',
          created_at: '2026-02-16T11:00:00Z',
        },
      ],
    });

    // Verify transactions query
    expect(mockSupabaseFrom).toHaveBeenCalledWith('credit_transactions');
    expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockSupabaseLimit).toHaveBeenCalledWith(10);
  });

  it('should return 401 for unauthenticated requests', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/balance');

    const AuthError = (await import('../../middleware/auth')).AuthError;
    mockRequireAuth.mockRejectedValueOnce(new AuthError('Unauthorized', 401));

    const req = {
      method: 'GET',
      query: {},
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

  it('should handle database errors gracefully', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/balance');
    const userId = 'user-uuid-error';

    mockRequireAuth.mockResolvedValueOnce({ userId, clerkId: 'clerk-error' });

    // Mock database error (not PGRST116)
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
      data: null,
      error: { code: 'PGRST500', message: 'Database connection failed' },
    });

    const req = {
      method: 'GET',
      query: {},
    } as unknown as VercelRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as VercelResponse;

    // Act
    await handler(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch credits balance' });
  });

  it('should return 405 for non-GET methods', async () => {
    // Arrange
    const { default: handler } = await import('../../credits/balance');

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
});
