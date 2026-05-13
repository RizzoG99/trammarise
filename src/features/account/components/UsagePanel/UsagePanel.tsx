import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/context/SubscriptionContext';
import { Alert } from '@/lib/components/ui/Alert/Alert';
import { FreePlanPanel } from './FreePlanPanel';
import { ProPlanPanel } from './ProPlanPanel';

export function UsagePanel() {
  const { t } = useTranslation();
  const { subscription, isLoading, error } = useSubscription();

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading usage data" className="space-y-3 animate-pulse">
        <div className="h-8 bg-bg-tertiary rounded-lg w-1/3" />
        <div className="h-24 bg-bg-tertiary rounded-xl" />
        <div className="h-16 bg-bg-tertiary rounded-xl" />
      </div>
    );
  }

  if (error || !subscription) {
    return <Alert variant="error">{t('usagePanel.error')}</Alert>;
  }

  if (subscription.tier === 'free') {
    return <FreePlanPanel />;
  }

  return <ProPlanPanel subscription={subscription} />;
}
