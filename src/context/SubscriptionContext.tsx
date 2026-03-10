// src/context/SubscriptionContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { TIER_FEATURES, FREE_SUBSCRIPTION } from './subscription-tiers';
import type { SubscriptionTier, SubscriptionStatus, Subscription } from './subscription-types';

interface SubscriptionContextValue {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  canUseHostedAPI: boolean;
  minutesRemaining: number;
  isSubscribed: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const TIER_MINUTES: Record<SubscriptionTier, number> = {
  free: 60,
  pro: 500,
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isSignedIn || !user) {
      setSubscription(FREE_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setSubscription(FREE_SUBSCRIPTION);
        return;
      }

      setSubscription({
        id: data.id,
        tier: data.tier as SubscriptionTier,
        status: data.status as SubscriptionStatus,
        currentPeriodStart: data.current_period_start ?? new Date().toISOString(),
        currentPeriodEnd: data.current_period_end ?? new Date().toISOString(),
        cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
        minutesIncluded: TIER_MINUTES[data.tier as SubscriptionTier] ?? 0,
        minutesUsed: data.minutes_used ?? 0,
        creditsBalance: data.credits_balance ?? 0,
      });
    } catch (err) {
      console.debug('Subscription fetch failed, falling back to free tier:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      setSubscription(FREE_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (isLoaded) {
      fetchSubscription();
    }
  }, [isLoaded, fetchSubscription]);

  useEffect(() => {
    if (subscription && subscription.tier !== 'free') {
      // Pro user — no further action needed
    }
  }, [subscription]);

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return TIER_FEATURES[subscription.tier]?.includes(feature) ?? false;
  };

  const canUseHostedAPI = subscription?.tier !== 'free';
  const minutesRemaining = subscription
    ? Math.max(0, subscription.minutesIncluded - subscription.minutesUsed)
    : 0;
  const isSubscribed = subscription?.tier !== 'free' && subscription?.status === 'active';

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        error,
        refetch: fetchSubscription,
        hasFeature,
        canUseHostedAPI,
        minutesRemaining,
        isSubscribed,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
