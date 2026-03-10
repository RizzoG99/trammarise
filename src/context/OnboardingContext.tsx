/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useUser } from '@clerk/react';
import { useSubscription } from './SubscriptionContext';
import { getApiConfig, saveApiConfig } from '@/utils/session-storage';
import { getSavedApiKey, getOnboardingUseCaseFromDb } from '@/utils/api';

interface OnboardingContextValue {
  needsOnboarding: boolean;
  isCheckingOnboarding: boolean;
  completeOnboarding: () => void;
  isViewingPricing: boolean;
  setIsViewingPricing: (viewing: boolean) => void;
  onboardingUseCase: string | null;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isViewingPricing, setIsViewingPricing] = useState(false);
  const [onboardingUseCase, setOnboardingUseCase] = useState<string | null>(null);

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

    // Check database — use allSettled so a use-case fetch failure doesn't
    // discard a successfully retrieved API key (and vice versa).
    try {
      const [keyResult, useCaseResult] = await Promise.allSettled([
        getSavedApiKey(),
        getOnboardingUseCaseFromDb(),
      ]);

      if (useCaseResult.status === 'fulfilled' && useCaseResult.value) {
        setOnboardingUseCase(useCaseResult.value);
      }

      if (keyResult.status === 'fulfilled' && keyResult.value.hasKey && keyResult.value.apiKey) {
        saveApiConfig('openai', keyResult.value.apiKey, keyResult.value.apiKey);
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
    } catch {
      // Unexpected error (allSettled itself shouldn't reject)
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
        onboardingUseCase,
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
