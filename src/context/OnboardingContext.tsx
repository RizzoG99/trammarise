/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useSubscription } from './SubscriptionContext';
import { getApiConfig, saveApiConfig } from '@/utils/session-storage';
import { getSavedApiKey } from '@/utils/api';

interface OnboardingContextValue {
  needsOnboarding: boolean;
  isCheckingOnboarding: boolean;
  completeOnboarding: () => void;
  isViewingPricing: boolean;
  setIsViewingPricing: (viewing: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isViewingPricing, setIsViewingPricing] = useState(false);

  const checkOnboardingStatus = useCallback(async () => {
    // Not signed in - no onboarding needed (will see WelcomePage)
    if (!isSignedIn) {
      setNeedsOnboarding(false);
      setIsCheckingOnboarding(false);
      return;
    }

    // Paid user - no onboarding needed
    if (subscription && subscription.tier !== 'free') {
      setNeedsOnboarding(false);
      setIsCheckingOnboarding(false);
      return;
    }

    // Free user - check if they have API key
    // Check session storage first
    const sessionConfig = getApiConfig();
    if (sessionConfig?.openaiKey) {
      setNeedsOnboarding(false);
      setIsCheckingOnboarding(false);
      return;
    }

    // Check database
    try {
      const savedKey = await getSavedApiKey();
      if (savedKey.hasKey && savedKey.apiKey) {
        // Restore API key to session storage
        saveApiConfig('openai', savedKey.apiKey, savedKey.apiKey);
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
    } catch {
      // If fetch fails, assume needs onboarding
      setNeedsOnboarding(true);
    } finally {
      setIsCheckingOnboarding(false);
    }
  }, [isSignedIn, subscription]);

  useEffect(() => {
    if (userLoaded && !subscriptionLoading) {
      checkOnboardingStatus();
    }
  }, [userLoaded, subscriptionLoading, checkOnboardingStatus]);

  // When subscription tier changes from 'free' to 'pro'/'team', complete onboarding
  useEffect(() => {
    if (subscription && subscription.tier !== 'free') {
      setNeedsOnboarding(false);
      setIsViewingPricing(false);
    }
  }, [subscription]);

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        needsOnboarding,
        isCheckingOnboarding,
        completeOnboarding,
        isViewingPricing,
        setIsViewingPricing,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
