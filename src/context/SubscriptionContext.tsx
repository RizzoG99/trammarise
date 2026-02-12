/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { TIER_FEATURES, FREE_SUBSCRIPTION } from './subscription-tiers';
import type { SubscriptionTier, SubscriptionStatus, Subscription } from './subscription-types';

interface SubscriptionContextValue {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  // Helper functions
  hasFeature: (feature: string) => boolean;
  canUseHostedAPI: boolean;
  minutesRemaining: number;
  isSubscribed: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// Minutes included per tier
export const TIER_MINUTES: Record<SubscriptionTier, number> = {
  free: 60,
  pro: 500,
  team: 2000,
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    // If not signed in, use free tier
    if (!isSignedIn) {
      setSubscription(FREE_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/current');

      if (!response.ok) {
        if (response.status === 404) {
          // No subscription found, use free tier
          setSubscription(FREE_SUBSCRIPTION);
          return;
        }
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription({
        id: data.id,
        tier: data.tier as SubscriptionTier,
        status: data.status as SubscriptionStatus,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        minutesIncluded: TIER_MINUTES[data.tier as SubscriptionTier] || 0,
        minutesUsed: data.minutesUsed || 0,
        creditsBalance: data.creditsBalance || 0,
      });
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      // Fallback to free tier on error
      setSubscription(FREE_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchSubscription();
    }
  }, [isLoaded, fetchSubscription]);

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return TIER_FEATURES[subscription.tier]?.includes(feature) ?? false;
  };

  const canUseHostedAPI = subscription?.tier !== 'free';
  const minutesRemaining = subscription
    ? Math.max(0, subscription.minutesIncluded - subscription.minutesUsed)
    : 0;
  const isSubscribed = subscription?.tier !== 'free' && subscription?.status === 'active';

  const value: SubscriptionContextValue = {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription,
    hasFeature,
    canUseHostedAPI,
    minutesRemaining,
    isSubscribed,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

/**
 * Hook to access subscription context
 *
 * @example
 * const { subscription, hasFeature, canUseHostedAPI } = useSubscription();
 *
 * if (hasFeature('team-collaboration')) {
 *   // Show team features
 * }
 */
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
