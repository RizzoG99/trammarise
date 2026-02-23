import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/lib/components/ui/Button';
import { GlassCard } from '@/lib';
import { LoadingSpinner } from '@/lib/components/ui/LoadingSpinner';
import { Check, Zap, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '@/context/OnboardingContext';
import { OnboardingBanner } from '@/components/OnboardingBanner';
import { fetchWithAuth } from '@/utils/fetch-with-auth';
import { useSubscription } from '@/context/SubscriptionContext';

type BillingInterval = 'month' | 'year';
type Tier = 'pro' | 'team';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  cta: string;
  popular?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Bring Your Own API Key',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Unlimited transcriptions (BYOK)',
      'Use your own OpenAI API key',
      'Pay-as-you-go pricing from OpenAI',
      'Basic audio editing',
      'Export to PDF',
      'Local storage only',
    ],
    cta: 'Get Started Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for individuals and professionals',
    monthlyPrice: 19,
    annualPrice: 190, // ~$15.83/month, 2 months free
    features: [
      '500 minutes/month included',
      'No API keys needed',
      'Cross-device sync',
      'Priority processing',
      'Advanced audio features',
      'Chat with transcripts',
      'Custom AI models',
      'Email support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams and organizations',
    monthlyPrice: 49,
    annualPrice: 490, // ~$40.83/month, 2 months free
    features: [
      '2000 minutes/month included',
      'Everything in Pro',
      'Team collaboration',
      'Shared workspaces',
      'Admin controls',
      'Usage analytics',
      'Priority support',
      'Custom integrations',
    ],
    cta: 'Upgrade to Team',
  },
];

export function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { needsOnboarding, isViewingPricing, setIsViewingPricing } = useOnboarding();
  const { subscription } = useSubscription();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('month');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const showBanner = needsOnboarding && isViewingPricing;

  // Get user's current tier (default to 'free' if no subscription)
  const userTier = subscription?.tier || 'free';

  // Check if navigated from results page
  const referrer = location.state?.from;
  const showBackButton = referrer === 'results';

  const handleBackToResults = () => {
    navigate(-1);
  };

  const handleSubscribe = async (tierId: string) => {
    // Free tier - just redirect to home
    if (tierId === 'free') {
      // If in onboarding mode, return to setup modal
      if (showBanner) {
        setIsViewingPricing(false);
      }
      navigate('/');
      return;
    }

    // Require authentication for paid tiers
    if (!isSignedIn) {
      // Store intended tier in localStorage for after sign-in
      localStorage.setItem('pending_subscription', JSON.stringify({ tierId, billingInterval }));
      // Redirect to sign-in (Clerk will handle this)
      return;
    }

    setLoadingTier(tierId);

    try {
      // Call Stripe checkout endpoint
      const response = await fetchWithAuth(getToken, '/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierId as Tier,
          interval: billingInterval,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoadingTier(null);
    }
  };

  const getPrice = (tier: PricingTier) => {
    const price = billingInterval === 'month' ? tier.monthlyPrice : tier.annualPrice;
    const interval = billingInterval === 'month' ? '/mo' : '/yr';
    return { price, interval };
  };

  const getSavings = (tier: PricingTier) => {
    if (billingInterval === 'year' && tier.annualPrice > 0) {
      const monthlyCost = tier.monthlyPrice * 12;
      const savings = monthlyCost - tier.annualPrice;
      return savings;
    }
    return 0;
  };

  if (!isLoaded) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      {/* Back Navigation Banner (from results page) */}
      {showBackButton && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-white font-medium">
              {t('pricing.banner.message', 'Reviewing plans')}
            </span>
            <Button
              variant="outline"
              onClick={handleBackToResults}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('pricing.banner.back', 'Back to Results')}
            </Button>
          </div>
        </div>
      )}
      {showBanner && <OnboardingBanner />}
      <PageLayout>
        <div
          className={`max-w-7xl mx-auto px-4 md:px-8 py-12 ${showBackButton || showBanner ? 'pt-20' : ''}`}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('pricing.title', 'Choose Your Plan')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t(
                'pricing.subtitle',
                'Start for free with your own API key, or upgrade for hosted AI and premium features'
              )}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={`text-sm font-medium ${billingInterval === 'month' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {t('pricing.monthly', 'Monthly')}
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              role="switch"
              aria-checked={billingInterval === 'year'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <span
              className={`text-sm font-medium ${billingInterval === 'year' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {t('pricing.annual', 'Annual')}
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                {t('pricing.save2Months', 'Save 2 months')}
              </span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING_TIERS.map((tier) => {
              const { price, interval } = getPrice(tier);
              const savings = getSavings(tier);
              const isLoading = loadingTier === tier.id;
              const isCurrentTier = tier.id === userTier;

              return (
                <GlassCard
                  key={tier.id}
                  variant={tier.popular ? 'glow' : 'light'}
                  className={`relative p-8 transition-all hover:shadow-glass hover:-translate-y-1 ${
                    tier.popular ? 'border-primary/50 scale-105 z-10' : ''
                  }`}
                >
                  {/* Current Plan Badge */}
                  {isCurrentTier && (
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                        <Check className="w-4 h-4" />
                        {t('pricing.currentPlan', 'Your Current Plan')}
                      </span>
                    </div>
                  )}

                  {/* Popular Badge (only show if not current plan) */}
                  {tier.popular && !isCurrentTier && (
                    <div className="absolute -top-5 left-0 right-0 flex justify-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                        <Zap className="w-4 h-4" />
                        {t('pricing.popular', 'Most Popular')}
                      </span>
                    </div>
                  )}

                  {/* Tier Name */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-text-primary">{tier.name}</h3>
                    <p className="text-sm text-text-secondary mt-1">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-text-primary">${price}</span>
                      {price > 0 && <span className="text-text-secondary ml-2">{interval}</span>}
                    </div>
                    {savings > 0 && (
                      <p className="text-sm text-accent-success mt-1">
                        {t('pricing.saveAmount', 'Save ${{amount}}/year', { amount: savings })}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={tier.popular && !isCurrentTier ? 'primary' : 'outline'}
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={isLoading || isCurrentTier}
                    className="w-full mb-6"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" className="p-0" />
                        {t('pricing.loading', 'Loading...')}
                      </span>
                    ) : isCurrentTier ? (
                      t('pricing.currentPlanButton', 'Current Plan')
                    ) : (
                      tier.cta
                    )}
                  </Button>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              {t('pricing.faq.title', 'Frequently Asked Questions')}
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pricing.faq.freeTrial.question', 'How does the free trial work?')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    'pricing.faq.freeTrial.answer',
                    'Sign up for free and get 60 minutes of transcription per month. No credit card required. Upgrade anytime for more minutes and advanced features.'
                  )}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pricing.faq.cancel.question', 'Can I cancel anytime?')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    'pricing.faq.cancel.answer',
                    'Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period, and you can always downgrade to the free tier.'
                  )}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('pricing.faq.minutes.question', 'What happens if I exceed my minutes?')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    'pricing.faq.minutes.answer',
                    "You can purchase additional credits at any time. Unused minutes don't roll over, so choose a plan that fits your needs."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}
