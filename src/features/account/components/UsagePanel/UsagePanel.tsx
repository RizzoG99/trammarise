// src/features/account/components/UsagePanel/UsagePanel.tsx
import { useSubscription } from '@/context/SubscriptionContext';
import { FreePlanPanel } from './FreePlanPanel';
import { ProPlanPanel } from './ProPlanPanel';

export function UsagePanel() {
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
    return (
      <div
        role="alert"
        className="p-4 rounded-xl border border-accent-error/25 bg-accent-error/10 text-accent-error text-sm"
      >
        Failed to load usage data. Please refresh the page.
      </div>
    );
  }

  if (subscription.tier === 'free') {
    return <FreePlanPanel />;
  }

  return <ProPlanPanel subscription={subscription} />;
}
