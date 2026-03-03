import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlassCard, Heading, Text, Button, StepIndicator, PricingCard } from '@/lib';
import type { PricingPlan } from '@/lib';
import { useOnboarding } from '@/context/OnboardingContext';
import { saveApiConfig } from '@/utils/session-storage';
import { validateApiKey } from '@/utils/api';
import { ROUTES } from '@/types/routing';

// ─── Constants ───────────────────────────────────────────────────────────────

const USE_CASES = [
  { id: 'meeting', icon: '🤝', labelKey: 'Meeting' },
  { id: 'lecture', icon: '🎓', labelKey: 'Lecture' },
  { id: 'interview', icon: '🎙️', labelKey: 'Interview' },
  { id: 'podcast', icon: '🎧', labelKey: 'Podcast' },
  { id: 'voice-memo', icon: '📝', labelKey: 'Voice Memo' },
  { id: 'other', icon: '💬', labelKey: 'Other' },
] as const;

const FREE_PLAN: PricingPlan = {
  id: 'free',
  name: 'Free',
  description: 'Bring your own API key',
  monthlyPrice: '$0',
  annualPrice: '$0',
  features: ['Unlimited transcriptions', 'Your own OpenAI key', 'All content types'],
  cta: 'Continue Free',
};

const PRO_PLAN: PricingPlan = {
  id: 'pro',
  name: 'Pro',
  description: 'Hosted API, no key needed',
  monthlyPrice: '$12',
  annualPrice: '$99',
  features: ['500 min / month', 'No API key required', 'Cloud sync', 'Priority support'],
  cta: 'Upgrade to Pro',
  popular: true,
  badge: 'Most Popular',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function OnboardingPage() {
  const { t } = useTranslation();
  const { completeOnboarding } = useOnboarding();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [rememberKey, setRememberKey] = useState(false);
  const [billingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const steps = [
    { id: 1, label: t('onboarding.steps.useCase') },
    { id: 2, label: t('onboarding.steps.plan') },
    { id: 3, label: t('onboarding.steps.apiSetup') },
  ];

  const handleNext = () => setStep((s) => s + 1);

  const handleBack = () => setStep((s) => s - 1);

  const handleSelectPlan = (planId: 'free' | 'pro') => {
    if (planId === 'pro') {
      completeOnboarding();
      navigate(ROUTES.ACCOUNT);
    } else {
      setStep(3);
    }
  };

  const handleFinish = async () => {
    if (!apiKey.startsWith('sk-')) {
      setApiKeyError(t('onboarding.step3.errorFormat'));
      return;
    }
    setIsValidatingKey(true);
    setApiKeyError('');
    const isValid = await validateApiKey('openai', apiKey);
    setIsValidatingKey(false);
    if (!isValid) {
      setApiKeyError(t('onboarding.step3.errorInvalid'));
      return;
    }
    saveApiConfig('openai', apiKey, apiKey, rememberKey);
    completeOnboarding();
  };

  const stepTitle = t(`onboarding.step${step}.title`);
  const stepSubtitle = t(`onboarding.step${step}.subtitle`);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <Heading level="h1">{t('onboarding.title')}</Heading>
          <Text variant="body" color="secondary">
            {t('onboarding.subtitle')}
          </Text>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={steps} currentStep={step} />

        {/* Card */}
        <GlassCard variant="dark" className="p-8 flex flex-col gap-6">
          <div>
            <Heading level="h2">{stepTitle}</Heading>
            <Text variant="body" color="secondary">
              {stepSubtitle}
            </Text>
          </div>

          {/* Step content */}
          {step === 1 && (
            <UseCaseStep selectedUseCase={selectedUseCase} onSelect={setSelectedUseCase} />
          )}

          {step === 2 && <PlanStep billingPeriod={billingPeriod} onSelectPlan={handleSelectPlan} />}

          {step === 3 && (
            <ApiKeyStep
              apiKey={apiKey}
              error={apiKeyError}
              rememberKey={rememberKey}
              onChange={(v) => {
                setApiKey(v);
                if (apiKeyError) setApiKeyError('');
              }}
              onRememberKeyChange={setRememberKey}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack}>
                  {t('onboarding.navigation.back')}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={completeOnboarding}>
                {t('onboarding.navigation.skip')}
              </Button>
              {step === 1 && (
                <Button variant="primary" onClick={handleNext}>
                  {t('onboarding.navigation.next')}
                </Button>
              )}
              {step === 3 && (
                <Button variant="primary" onClick={handleFinish} disabled={isValidatingKey}>
                  {isValidatingKey
                    ? t('onboarding.step3.validating')
                    : t('onboarding.navigation.finish')}
                </Button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Step sub-components ─────────────────────────────────────────────────────

function UseCaseStep({
  selectedUseCase,
  onSelect,
}: {
  selectedUseCase: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {USE_CASES.map(({ id, icon, labelKey }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={[
            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer',
            selectedUseCase === id
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-text-primary)]'
              : 'border-[var(--color-border)] bg-white/[0.02] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-text-primary)]',
          ].join(' ')}
        >
          <span className="text-2xl">{icon}</span>
          <span className="text-sm font-medium">{labelKey}</span>
        </button>
      ))}
    </div>
  );
}

function ApiKeyStep({
  apiKey,
  error,
  rememberKey,
  onChange,
  onRememberKeyChange,
}: {
  apiKey: string;
  error: string;
  rememberKey: boolean;
  onChange: (v: string) => void;
  onRememberKeyChange: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={apiKey}
        onChange={(e) => onChange(e.target.value)}
        placeholder="sk-..."
        className={[
          'w-full px-4 py-3 rounded-xl bg-white/[0.05] border text-[var(--color-text-primary)] placeholder-text-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all',
          error ? 'border-red-500/70' : 'border-[var(--color-border)]',
        ].join(' ')}
      />
      {error && (
        <p role="alert" className="text-red-400 text-sm">
          {error}
        </p>
      )}
      <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-[var(--color-text-secondary)]">
        <input
          type="checkbox"
          checked={rememberKey}
          onChange={(e) => onRememberKeyChange(e.target.checked)}
          className="w-4 h-4 rounded accent-[var(--color-primary)] cursor-pointer"
        />
        {t('onboarding.step3.rememberKey')}
      </label>
    </div>
  );
}

function PlanStep({
  billingPeriod,
  onSelectPlan,
}: {
  billingPeriod: 'monthly' | 'annual';
  onSelectPlan: (plan: 'free' | 'pro') => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <PricingCard
        plan={FREE_PLAN}
        isCurrentPlan={false}
        billingPeriod={billingPeriod}
        onSelect={() => onSelectPlan('free')}
      />
      <PricingCard
        plan={PRO_PLAN}
        isCurrentPlan={false}
        billingPeriod={billingPeriod}
        onSelect={() => onSelectPlan('pro')}
      />
    </div>
  );
}
