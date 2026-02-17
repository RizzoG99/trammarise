import { useTranslation } from 'react-i18next';
import { useSubscription } from '@/context/SubscriptionContext';
import { Button } from '@/lib';
import { Sparkles, TrendingUp, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/types/routing';

export function UsageTab() {
  const { t } = useTranslation();
  const { subscription, minutesRemaining } = useSubscription();

  if (!subscription) return null;

  const isFree = subscription.tier === 'free';

  // Free Tier: Upgrade CTA
  if (isFree) {
    return (
      <div className="space-y-6">
        {/* Free Tier Info */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Sparkles className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {t('userMenu.usage.freeTier')}
            </h3>
            <p className="text-sm text-text-secondary mt-2">
              {t('userMenu.usage.freeTierDescription')}
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">
            {t('userMenu.usage.upgradeTitle')}
          </p>
          {[
            t('userMenu.usage.benefit1'),
            t('userMenu.usage.benefit2'),
            t('userMenu.usage.benefit3'),
            t('userMenu.usage.benefit4'),
          ].map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span className="text-sm text-text-secondary">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Upgrade CTA */}
        <Link to={ROUTES.PRICING}>
          <Button variant="primary" className="w-full" icon={<TrendingUp className="w-4 h-4" />}>
            {t('userMenu.usage.upgradeToPro')}
          </Button>
        </Link>
      </div>
    );
  }

  // Paid Tier: Usage Stats & Billing
  const usagePercentage = (subscription.minutesUsed / subscription.minutesIncluded) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="p-4 bg-bg-secondary rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">{t('userMenu.usage.currentPlan')}</p>
            <p className="text-lg font-semibold text-text-primary capitalize">
              {subscription.tier}
            </p>
          </div>
          <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {subscription.status}
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{t('userMenu.usage.minutesUsed')}</span>
          <span className="font-medium text-text-primary">
            {subscription.minutesUsed} / {subscription.minutesIncluded}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>

        <p className="text-xs text-text-secondary">
          {minutesRemaining} {t('userMenu.usage.minutesRemaining')}
        </p>
      </div>

      {/* Billing Period */}
      {subscription.currentPeriodEnd && (
        <div className="p-3 bg-bg-secondary rounded-lg text-sm">
          <p className="text-text-secondary">
            {t('userMenu.usage.renewsOn')}{' '}
            <span className="font-medium text-text-primary">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </p>
        </div>
      )}

      {/* Manage Subscription */}
      <Button variant="outline" className="w-full" icon={<CreditCard className="w-4 h-4" />}>
        {t('userMenu.usage.manageSubscription')}
      </Button>
    </div>
  );
}
