import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../user-settings/api-key';
import * as auth from '../../middleware/auth';
import { supabaseAdmin } from '../../lib/supabase-admin';
import * as encryption from '../../utils/encryption';

// Mock dependencies
vi.mock('../../middleware/auth');
vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));
vi.mock('../../utils/encryption');

describe('POST /api/user-settings/api-key', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    req = {
      method: 'POST',
      body: {},
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Default mocks
    vi.mocked(auth.requireAuth).mockResolvedValue({
      userId: 'user-123',
      clerkId: 'clerk-123',
    });

    vi.mocked(encryption.encrypt).mockReturnValue('encrypted-key-data');
  });

  it('should save encrypted API key successfully', async () => {
    req.body = {
      apiKey: 'sk-proj-test-key',
    };

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      upsert: mockUpsert,
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(encryption.encrypt).toHaveBeenCalledWith('sk-proj-test-key');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        openai_api_key_encrypted: 'encrypted-key-data',
      }),
      { onConflict: 'user_id' }
    );
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: 'API key saved successfully',
    });
  });

  it('should validate API key is required', async () => {
    req.body = {};

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'API key is required',
    });
  });

  it('should validate API key is not empty', async () => {
    req.body = { apiKey: '   ' };

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'API key cannot be empty',
    });
  });

  it('should validate OpenAI API key format', async () => {
    req.body = { apiKey: 'invalid-key' };

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid OpenAI API key format (must start with sk-)',
    });
  });

  it('should handle database errors', async () => {
    req.body = { apiKey: 'sk-proj-test' };

    const mockUpsert = vi.fn().mockResolvedValue({
      error: { message: 'Database error' },
    });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      upsert: mockUpsert,
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to save API key',
    });
  });

  it('should handle encryption errors', async () => {
    req.body = { apiKey: 'sk-proj-test' };

    vi.mocked(encryption.encrypt).mockImplementation(() => {
      throw new Error('Encryption failed');
    });

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to encrypt API key',
    });
  });

  it('should handle authentication errors', async () => {
    const authError = new Error('Unauthorized');
    authError.name = 'AuthError';
    vi.mocked(auth.requireAuth).mockRejectedValue(authError);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Unauthorized',
    });
  });
});

describe('GET /api/user-settings/api-key', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    req = {
      method: 'GET',
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };

    vi.mocked(auth.requireAuth).mockResolvedValue({
      userId: 'user-123',
      clerkId: 'clerk-123',
    });

    vi.mocked(encryption.decrypt).mockReturnValue('sk-proj-decrypted-key');
  });

  it('should retrieve and decrypt API key successfully', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { openai_api_key_encrypted: 'encrypted-data' },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: mockSelect,
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(mockSelect).toHaveBeenCalledWith('openai_api_key_encrypted');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    expect(encryption.decrypt).toHaveBeenCalledWith('encrypted-data');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      hasKey: true,
      apiKey: 'sk-proj-decrypted-key',
    });
  });

  it('should return hasKey: false when no API key exists', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: mockSelect,
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      hasKey: false,
      apiKey: null,
    });
  });

  it('should return hasKey: false when API key is null', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { openai_api_key_encrypted: null },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: mockSelect,
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      hasKey: false,
      apiKey: null,
    });
  });

  it('should handle database errors', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: mockSelect,
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to retrieve API key',
    });
  });

  it('should handle decryption errors', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { openai_api_key_encrypted: 'encrypted-data' },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: mockSelect,
    } as never);

    vi.mocked(encryption.decrypt).mockImplementation(() => {
      throw new Error('Decryption failed');
    });

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to decrypt API key',
    });
  });
});

describe('DELETE /api/user-settings/api-key', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    req = {
      method: 'DELETE',
    };

    res = {
      status: statusMock,
      json: jsonMock,
    };

    vi.mocked(auth.requireAuth).mockResolvedValue({
      userId: 'user-123',
      clerkId: 'clerk-123',
    });
  });

  it('should delete API key successfully', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      update: mockUpdate,
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        openai_api_key_encrypted: null,
      })
    );
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      message: 'API key deleted successfully',
    });
  });

  it('should handle database errors', async () => {
    const mockEq = vi.fn().mockResolvedValue({
      error: { message: 'Database error' },
    });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      update: mockUpdate,
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Failed to delete API key',
    });
  });
});

describe('Method validation', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));

    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };

    vi.mocked(auth.requireAuth).mockResolvedValue({
      userId: 'user-123',
      clerkId: 'clerk-123',
    });
  });

  it('should reject unsupported methods', async () => {
    req.method = 'PUT';

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Method not allowed',
    });
  });
});
