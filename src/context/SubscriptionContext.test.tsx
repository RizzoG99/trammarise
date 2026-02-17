import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSubscription, SubscriptionProvider, TIER_MINUTES } from './SubscriptionContext';
import type { Subscription } from './subscription-types';

// Mock Clerk
const mockGetToken = vi.fn();
const mockUseUser = vi.fn();
const mockUseAuth = vi.fn(() => ({ getToken: mockGetToken }));

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => mockUseUser(),
  useAuth: () => mockUseAuth(),
}));

// Mock fetch-with-auth
const mockFetchWithAuth = vi.fn();
vi.mock('@/utils/fetch-with-auth', () => ({
  fetchWithAuth: (...args: unknown[]) => mockFetchWithAuth(...args),
}));

describe('SubscriptionContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSubscription Hook', () => {
    it('should throw error when used outside SubscriptionProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useSubscription());
      }).toThrow('useSubscription must be used within SubscriptionProvider');

      console.error = originalError;
    });

    it('should fetch subscription on mount when user is signed in', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      const mockSubscription: Subscription = {
        id: 'sub_123',
        tier: 'pro',
        status: 'active',
        currentPeriodStart: '2024-01-01',
        currentPeriodEnd: '2024-02-01',
        cancelAtPeriodEnd: false,
        minutesIncluded: 500,
        minutesUsed: 100,
        creditsBalance: 50,
      };

      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscription,
      });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetchWithAuth).toHaveBeenCalledWith(mockGetToken, '/api/subscriptions/current');
      expect(result.current.subscription).toEqual({
        id: 'sub_123',
        tier: 'pro',
        status: 'active',
        currentPeriodStart: '2024-01-01',
        currentPeriodEnd: '2024-02-01',
        cancelAtPeriodEnd: false,
        minutesIncluded: 500,
        minutesUsed: 100,
        creditsBalance: 50,
      });
    });

    it('should default to free tier when user is not signed in', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: false, isLoaded: true });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetchWithAuth).not.toHaveBeenCalled();
      expect(result.current.subscription?.tier).toBe('free');
      expect(result.current.subscription?.status).toBe('active');
    });

    it('should handle API 404 error and fallback to free tier', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subscription?.tier).toBe('free');
      expect(result.current.error).toBeNull();
    });

    it('should handle API error and fallback to free tier with error message', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subscription?.tier).toBe('free');
      expect(result.current.error).toBe('Failed to fetch subscription');
    });

    it('should handle network error and fallback to free tier', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.subscription?.tier).toBe('free');
      expect(result.current.error).toBe('Network error');
    });

    it('should refetch subscription when refetch is called', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      const mockSubscription: Subscription = {
        id: 'sub_123',
        tier: 'pro',
        status: 'active',
        currentPeriodStart: '2024-01-01',
        currentPeriodEnd: '2024-02-01',
        cancelAtPeriodEnd: false,
        minutesIncluded: 500,
        minutesUsed: 100,
        creditsBalance: 50,
      };

      mockFetchWithAuth.mockResolvedValue({
        ok: true,
        json: async () => mockSubscription,
      });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initial fetch
      expect(mockFetchWithAuth).toHaveBeenCalledTimes(1);

      // Call refetch
      await result.current.refetch();

      // Should have been called again
      expect(mockFetchWithAuth).toHaveBeenCalledTimes(2);
    });
  });

  describe('Feature Flags', () => {
    it('should return true for free tier features', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: false, isLoaded: true });

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
      mockUseUser.mockReturnValue({ isSignedIn: false, isLoaded: true });

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
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 0,
          creditsBalance: 0,
        }),
      });

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
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 0,
          creditsBalance: 0,
        }),
      });

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

    it('should return true for all features on team tier', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'team',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 0,
          creditsBalance: 0,
        }),
      });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasFeature('team-collaboration')).toBe(true);
      expect(result.current.hasFeature('shared-workspaces')).toBe(true);
      expect(result.current.hasFeature('admin-controls')).toBe(true);
      expect(result.current.hasFeature('priority-support')).toBe(true);
    });
  });

  describe('Quota Checking', () => {
    it('should calculate remaining minutes correctly', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 150,
          creditsBalance: 0,
        }),
      });

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
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 500,
          creditsBalance: 0,
        }),
      });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.minutesRemaining).toBe(0);
    });

    it('should not show negative minutes when usage exceeds quota', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 550, // Exceeds 500 minute quota
          creditsBalance: 0,
        }),
      });

      const { result } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.minutesRemaining).toBe(0);
    });

    it('should detect 80% quota usage threshold', async () => {
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 400, // 80% of 500
          creditsBalance: 0,
        }),
      });

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
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 0,
          creditsBalance: 0,
        }),
      });

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
      mockUseUser.mockReturnValue({ isSignedIn: false, isLoaded: true });

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
      mockUseUser.mockReturnValue({ isSignedIn: true, isLoaded: true });

      // Test free tier
      expect(TIER_MINUTES.free).toBe(60);

      // Test pro tier
      mockFetchWithAuth.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'sub_123',
          tier: 'pro',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          minutesUsed: 0,
          creditsBalance: 0,
        }),
      });

      const { result: proResult } = renderHook(() => useSubscription(), {
        wrapper: SubscriptionProvider,
      });

      await waitFor(() => {
        expect(proResult.current.isLoading).toBe(false);
      });

      expect(proResult.current.subscription?.minutesIncluded).toBe(TIER_MINUTES.pro);
      expect(TIER_MINUTES.pro).toBe(500);

      // Test team tier
      expect(TIER_MINUTES.team).toBe(2000);
    });
  });
});
