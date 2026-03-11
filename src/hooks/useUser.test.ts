// src/hooks/useUser.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUser } from './useUser';

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

import { supabaseClient } from '@/lib/supabase/client';

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoaded=false initially', () => {
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    const { result } = renderHook(() => useUser());
    expect(result.current.isLoaded).toBe(false);
  });

  it('returns isSignedIn=false when no session', async () => {
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    const { result } = renderHook(() => useUser());
    await vi.waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('returns isSignedIn=true with user when session exists', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User', avatar_url: 'https://example.com/avatar.jpg' },
    };
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser, access_token: 'token' } },
      error: null,
    } as never);
    const { result } = renderHook(() => useUser());
    await vi.waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.user?.id).toBe('user-123');
  });
});
