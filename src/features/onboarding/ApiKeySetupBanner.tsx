import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { ROUTES } from '@/types/routing';
import { getApiConfig } from '@/utils/session-storage';

export function ApiKeySetupBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSubscribed } = useSubscription();
  const { needsOnboarding, isCheckingOnboarding } = useOnboarding();
  const [dismissed, setDismissed] = useState(false);

  // Use session-storage directly — same source of truth as OnboardingContext
  const hasKey = !!getApiConfig()?.openaiKey;

  // Show only when: onboarding done, no api key, free tier, not dismissed
  if (dismissed || isCheckingOnboarding || needsOnboarding || hasKey || isSubscribed) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 mb-6 bg-bg-surface border border-accent-warning/40 rounded-xl"
    >
      <AlertTriangle className="w-4 h-4 text-accent-warning flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">{t('onboarding.setupBanner.message')}</p>
        <button
          type="button"
          onClick={() => navigate(`${ROUTES.ACCOUNT}?section=apiKeys`)}
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline transition-colors cursor-pointer"
        >
          {t('onboarding.setupBanner.cta')}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 text-text-tertiary hover:text-text-secondary transition-colors"
        aria-label={t('onboarding.setupBanner.dismiss')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
