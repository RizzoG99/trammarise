import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSubscription, SubscriptionProvider, TIER_MINUTES } from './SubscriptionContext';

// Mock useUser hook
const mockUseUser = vi.fn();
vi.mock('@/hooks/useUser', () => ({
  useUser: () => mockUseUser(),
}));

// Mock Supabase client
const mockSupabaseFrom = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  },
}));

// Helper: build a Supabase chain that resolves maybeSingle() with { data, error }
function makeSubsChain(data: unknown, error: unknown = null) {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: () => Promise.resolve({ data, error }),
  };
  return chain;
}

// Helper: DB-format subscription row
function makeDbSub(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub_123',
    tier: 'pro',
    status: 'active',
    current_period_start: '2024-01-01',
    current_period_end: '2024-02-01',
    cancel_at_period_end: false,
    minutes_used: 100,
    credits_balance: 50,
    ...overrides,
  };
}

describe('SubscriptionContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSubscription Hook', () => {
    it('should throw error when used outside SubscriptionProvider', () => {
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useSubscription());
      }).toThrow('useSubscription must be used within SubscriptionProvider');

      console.error = originalError;
    });

    it('should fetch subscription on mount when user is signed in', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub()));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSupabaseFrom).toHaveBeenCalledWith('subscriptions');
      expect(result.current.subscription).toMatchObject({
        id: 'sub_123',
        tier: 'pro',
        status: 'active',
        cancelAtPeriodEnd: false,
        minutesIncluded: 500,
        minutesUsed: 100,
        creditsBalance: 50,
      });
    });

    it('should default to free tier when user is not signed in', async () => {
      mockUseUser.mockReturnValue({ user: null, isSignedIn: false, isLoaded: true });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSupabaseFrom).not.toHaveBeenCalled();
      expect(result.current.subscription?.tier).toBe('free');
      expect(result.current.subscription?.status).toBe('active');
    });

    it('should handle no subscription row and fallback to free tier', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(null));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subscription?.tier).toBe('free');
      expect(result.current.error).toBeNull();
    });

    it('should handle DB error and fallback to free tier with error message', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(null, new Error('DB error')));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subscription?.tier).toBe('free');
      expect(result.current.error).toBe('DB error');
    });

    it('should refetch subscription when refetch is called', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub()));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSupabaseFrom).toHaveBeenCalledTimes(1);

      await result.current.refetch();

      expect(mockSupabaseFrom).toHaveBeenCalledTimes(2);
    });
  });

  describe('Feature Flags', () => {
    it('should return true for free tier features', async () => {
      mockUseUser.mockReturnValue({ user: null, isSignedIn: false, isLoaded: true });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFeature('byok')).toBe(true);
      expect(result.current.hasFeature('basic-editing')).toBe(true);
      expect(result.current.hasFeature('export-pdf')).toBe(true);
      expect(result.current.hasFeature('local-storage')).toBe(true);
    });

    it('should return false for pro features on free tier', async () => {
      mockUseUser.mockReturnValue({ user: null, isSignedIn: false, isLoaded: true });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFeature('hosted-api')).toBe(false);
      expect(result.current.hasFeature('cloud-sync')).toBe(false);
      expect(result.current.hasFeature('chat')).toBe(false);
    });

    it('should return true for pro tier features', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub({ minutes_used: 0 })));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFeature('hosted-api')).toBe(true);
      expect(result.current.hasFeature('cloud-sync')).toBe(true);
      expect(result.current.hasFeature('priority-processing')).toBe(true);
      expect(result.current.hasFeature('chat')).toBe(true);
    });

    it('should return false for team-only features on pro tier', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub({ minutes_used: 0 })));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFeature('team-collaboration')).toBe(false);
      expect(result.current.hasFeature('shared-workspaces')).toBe(false);
      expect(result.current.hasFeature('admin-controls')).toBe(false);
    });
  });

  describe('Quota Checking', () => {
    it('should calculate remaining minutes correctly', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub({ minutes_used: 150 })));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Pro tier has 500 minutes, used 150, so 350 remaining
      expect(result.current.minutesRemaining).toBe(350);
    });

    it('should show 0 remaining minutes when quota is exhausted', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub({ minutes_used: 500 })));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.minutesRemaining).toBe(0);
    });

    it('should not show negative minutes when usage exceeds quota', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub({ minutes_used: 550 })));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.minutesRemaining).toBe(0);
    });

    it('should detect 80% quota usage threshold', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub({ minutes_used: 400 })));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const usagePercentage =
        (result.current.subscription!.minutesUsed / result.current.subscription!.minutesIncluded) *
        100;

      expect(usagePercentage).toBe(80);
      expect(result.current.minutesRemaining).toBe(100);
    });

    it('should correctly report subscription status for different tiers', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub({ minutes_used: 0 })));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSubscribed).toBe(true);
      expect(result.current.canUseHostedAPI).toBe(true);
    });

    it('should return false for isSubscribed on free tier', async () => {
      mockUseUser.mockReturnValue({ user: null, isSignedIn: false, isLoaded: true });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.canUseHostedAPI).toBe(false);
    });

    it('should respect TIER_MINUTES configuration for each tier', async () => {
      mockUseUser.mockReturnValue({ user: { id: 'user-123' }, isSignedIn: true, isLoaded: true });

      // Test free tier
      expect(TIER_MINUTES.free).toBe(60);

      // Test pro tier
      mockSupabaseFrom.mockReturnValue(makeSubsChain(makeDbSub({ minutes_used: 0 })));

      const { result: proResult } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(proResult.current.isLoading).toBe(false);
      });

      expect(proResult.current.subscription?.minutesIncluded).toBe(TIER_MINUTES.pro);
      expect(TIER_MINUTES.pro).toBe(500);
    });
  });
});
