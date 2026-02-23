import { useTranslation } from 'react-i18next';
import { GlassCard, Heading, Text } from '@/lib';

/**
 * OnboardingPage - Placeholder implementation.
 * Full wizard (Step1UseCaseSelection, Step2ApiSetup, Step3PlanSelection)
 * will be implemented in Phase 3.3.
 */
export function OnboardingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <GlassCard variant="dark" className="w-full max-w-2xl p-12 text-center">
        <Heading level="h1" className="text-3xl font-bold mb-4">
          {t('onboarding.title')}
        </Heading>
        <Text variant="body" color="secondary">
          {t('onboarding.subtitle')}
        </Text>
      </GlassCard>
    </div>
  );
}
