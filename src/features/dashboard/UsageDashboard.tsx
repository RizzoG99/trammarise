import { useEffect, useState } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { GlassCard } from '../../lib/components/ui/GlassCard/GlassCard';
import { Button } from '../../lib/components/ui/Button/Button';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '@/lib/components/ui/ProgressBar/ProgressBar';
import { Alert } from '@/lib/components/ui/Alert/Alert';

interface UsageStats {
  totalMinutes: number;
  eventCount: number;
  billingPeriod: string;
}

/**
 * Usage Dashboard Component
 *
 * Displays current usage statistics, quota limits, and upgrade prompts.
 * Shows usage progress bar and warnings when approaching limits.
 *
 * @example
 * <UsageDashboard />
 */
export function UsageDashboard() {
  const { subscription, minutesRemaining, isSubscribed } = useSubscription();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/usage/current');

        if (!response.ok) {
          if (response.status === 404) {
            // No usage yet - set to zero
            setUsage({ totalMinutes: 0, eventCount: 0, billingPeriod: new Date().toISOString() });
            return;
          }
          throw new Error('Failed to fetch usage data');
        }

        const data = await response.json();
        setUsage(data);
      } catch (err) {
        console.error('Failed to fetch usage:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
      } finally {
        setLoading(false);
      }
    }

    if (isSubscribed) {
      fetchUsage();
    } else {
      setLoading(false);
    }
  }, [isSubscribed]);

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <Alert variant="error">
          <p className="font-medium mb-2">Failed to load usage data</p>
          <p className="text-sm">{error}</p>
        </Alert>
      </GlassCard>
    );
  }

  // Free tier - show BYOK message
  if (!isSubscribed) {
    return (
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Usage</h2>
        <Alert variant="info">
          <p className="font-medium mb-2">Free Tier (BYOK Mode)</p>
          <p className="text-sm mb-4">
            You're using Bring Your Own Key mode with unlimited usage. Upgrade to Pro for hosted API
            access and cloud sync.
          </p>
          <Button variant="primary" onClick={() => navigate('/pricing')}>
            View Plans
          </Button>
        </Alert>
      </GlassCard>
    );
  }

  const minutesUsed = usage?.totalMinutes || 0;
  const minutesLimit = subscription?.minutesIncluded || 0;
  const percentage = minutesLimit > 0 ? (minutesUsed / minutesLimit) * 100 : 0;
  const isWarning = percentage >= 80;
  const isOverLimit = minutesUsed >= minutesLimit;

  return (
    <GlassCard className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Usage This Month</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Billing period:{' '}
          {new Date(usage?.billingPeriod || '').toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="mb-6">
        <ProgressBar value={minutesUsed} max={minutesLimit} warning={isWarning} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {minutesRemaining}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Minutes Remaining</p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {usage?.eventCount || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Transcriptions</p>
        </div>
      </div>

      {isOverLimit && (
        <Alert variant="error">
          <p className="font-medium mb-2">Quota Exceeded</p>
          <p className="text-sm mb-4">
            You've used all {minutesLimit} minutes this month. Upgrade to continue using hosted API
            features.
          </p>
          <Button variant="primary" onClick={() => navigate('/pricing')}>
            Upgrade Now
          </Button>
        </Alert>
      )}

      {isWarning && !isOverLimit && (
        <Alert variant="warning">
          <p className="font-medium mb-2">Approaching Limit</p>
          <p className="text-sm mb-4">
            You've used {percentage.toFixed(0)}% of your monthly quota. Consider upgrading to avoid
            interruption.
          </p>
          <Button variant="secondary" onClick={() => navigate('/pricing')}>
            View Upgrade Options
          </Button>
        </Alert>
      )}

      {subscription?.creditsBalance && subscription.creditsBalance > 0 && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            💎 Credits Balance: {subscription.creditsBalance} minutes
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Credits will be used automatically when quota is exceeded
          </p>
        </div>
      )}
    </GlassCard>
  );
}
