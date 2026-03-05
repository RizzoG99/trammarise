import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  GraduationCap,
  Mic,
  Headphones,
  FileText,
  MessageSquare,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard, Heading, Text, Button, StepIndicator, PricingCard } from '@/lib';
import type { PricingPlan } from '@/lib';
import { useOnboarding } from '@/context/OnboardingContext';
import { saveApiConfig } from '@/utils/session-storage';
import { validateApiKey } from '@/utils/api';
import { ROUTES } from '@/types/routing';

// ─── Constants ───────────────────────────────────────────────────────────────

type UseCase = { id: string; Icon: LucideIcon; labelKey: string };

const USE_CASES: UseCase[] = [
  { id: 'meeting', Icon: Users, labelKey: 'Meeting' },
  { id: 'lecture', Icon: GraduationCap, labelKey: 'Lecture' },
  { id: 'interview', Icon: Mic, labelKey: 'Interview' },
  { id: 'podcast', Icon: Headphones, labelKey: 'Podcast' },
  { id: 'voice-memo', Icon: FileText, labelKey: 'Voice Memo' },
  { id: 'other', Icon: MessageSquare, labelKey: 'Other' },
];

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
      navigate(ROUTES.PRICING);
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
      <div className="w-full max-w-2xl flex flex-col gap-10">
        {/* Header */}
        <div className="text-center">
          <Heading level="h1" className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {t('onboarding.title')}
          </Heading>
          <Text variant="body" color="secondary" className="text-base leading-relaxed">
            {t('onboarding.subtitle')}
          </Text>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={steps} currentStep={step} />

        {/* Card */}
        <GlassCard variant="dark" className="p-8">
          {/* Step content — keyed so fade-up runs on each step change */}
          <div key={step} className="animate-fade-up flex flex-col gap-6">
            <div>
              <Heading level="h2" className="mb-1">
                {stepTitle}
              </Heading>
              <Text variant="body" color="secondary" className="text-sm leading-relaxed">
                {stepSubtitle}
              </Text>
            </div>

            {step === 1 && (
              <UseCaseStep selectedUseCase={selectedUseCase} onSelect={setSelectedUseCase} />
            )}

            {step === 2 && (
              <PlanStep billingPeriod={billingPeriod} onSelectPlan={handleSelectPlan} />
            )}

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
          </div>

          {/* Navigation — outside animated area for stability */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-border/30">
            <div>
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack} className="cursor-pointer">
                  {t('onboarding.navigation.back')}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={completeOnboarding} className="cursor-pointer">
                {t('onboarding.navigation.skip')}
              </Button>
              {step === 1 && (
                <Button variant="primary" onClick={handleNext} className="cursor-pointer">
                  {t('onboarding.navigation.next')}
                </Button>
              )}
              {step === 3 && (
                <Button
                  variant="primary"
                  onClick={handleFinish}
                  disabled={isValidatingKey}
                  className="cursor-pointer"
                >
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
      {USE_CASES.map(({ id, Icon, labelKey }) => {
        const isSelected = selectedUseCase === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(id)}
            className={[
              'relative flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-colors duration-200 cursor-pointer text-left',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface',
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-bg-surface/30 hover:border-primary/40 hover:bg-primary/5',
            ].join(' ')}
          >
            {/* Icon in tinted container */}
            <span
              className={[
                'p-2 rounded-lg transition-colors duration-200',
                isSelected ? 'bg-primary/15' : 'bg-bg-surface/60',
              ].join(' ')}
            >
              <Icon
                className={[
                  'w-5 h-5 transition-colors duration-200',
                  isSelected ? 'text-primary' : 'text-text-tertiary',
                ].join(' ')}
                aria-hidden="true"
              />
            </span>

            {/* Label */}
            <span
              className={[
                'text-sm font-medium transition-colors duration-200',
                isSelected ? 'text-text-primary' : 'text-text-secondary',
              ].join(' ')}
            >
              {labelKey}
            </span>

            {/* Selected check */}
            {isSelected && (
              <span className="absolute top-2 right-2" aria-hidden="true">
                <Check className="w-3 h-3 text-primary" />
              </span>
            )}
          </button>
        );
      })}
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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="api-key-input" className="text-sm font-medium text-text-secondary">
          OpenAI API Key
        </label>
        <input
          id="api-key-input"
          type="text"
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-..."
          className={[
            'w-full px-4 py-3 rounded-xl bg-bg-surface/40 border font-mono text-sm text-text-primary placeholder-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200',
            error ? 'border-accent-error/70' : 'border-border',
          ].join(' ')}
        />
      </div>
      {error && (
        <p role="alert" className="text-accent-error text-sm">
          {error}
        </p>
      )}
      <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-text-secondary">
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
