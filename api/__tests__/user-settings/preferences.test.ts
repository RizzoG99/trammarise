import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../user-settings/preferences';
import * as auth from '../../middleware/auth';
import { supabaseAdmin } from '../../lib/supabase-admin';

vi.mock('../../middleware/auth');
vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: { from: vi.fn() },
}));

describe('GET /api/user-settings/preferences', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    req = { method: 'GET', body: {} };
    res = { status: statusMock, json: jsonMock };
    vi.mocked(auth.requireAuth).mockResolvedValue({ userId: 'user-123', clerkId: 'clerk-123' });
  });

  it('returns onboarding_use_case when row exists', async () => {
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { onboarding_use_case: 'meeting' },
            error: null,
          }),
        }),
      }),
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ onboardingUseCase: 'meeting' });
  });

  it('returns null when no row exists', async () => {
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(jsonMock).toHaveBeenCalledWith({ onboardingUseCase: null });
  });

  it('returns 500 on DB error', async () => {
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('db fail') }),
        }),
      }),
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
  });
});

describe('PATCH /api/user-settings/preferences', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    req = { method: 'PATCH', body: {} };
    res = { status: statusMock, json: jsonMock };
    vi.mocked(auth.requireAuth).mockResolvedValue({ userId: 'user-123', clerkId: 'clerk-123' });
  });

  it('saves valid use case', async () => {
    req.body = { onboardingUseCase: 'lecture' };
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabaseAdmin.from).mockReturnValue({ upsert: mockUpsert } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123', onboarding_use_case: 'lecture' }),
      { onConflict: 'user_id' }
    );
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true });
  });

  it('rejects invalid use case value', async () => {
    req.body = { onboardingUseCase: 'invalid-value' };

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
  });

  it('returns 400 when req.body is null', async () => {
    req.body = null;
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusMock).toHaveBeenCalledWith(400);
  });

  it('returns 405 for unsupported methods', async () => {
    req.method = 'DELETE';
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusMock).toHaveBeenCalledWith(405);
  });
});
