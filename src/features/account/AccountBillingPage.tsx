import { useTranslation } from 'react-i18next';
import { GlassCard, Heading, Text } from '@/lib';

/**
 * AccountBillingPage - Placeholder implementation.
 * Full layout (NavigationSidebar + sections) will be implemented in Phase 3.2.
 */
export function AccountBillingPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <GlassCard variant="dark" className="p-12 text-center">
        <Heading level="h1" className="text-3xl font-bold mb-4">
          {t('account.title')}
        </Heading>
        <Text variant="body" color="secondary">
          {t('account.navigation.profile')} · {t('account.navigation.billing')} ·{' '}
          {t('account.navigation.apiKeys')}
        </Text>
      </GlassCard>
    </div>
  );
}
