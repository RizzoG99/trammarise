import type { SubscriptionTier } from '@/context/subscription-types';

interface TierBadgeProps {
  tier: SubscriptionTier;
  className?: string;
}

const TIER_STYLES: Record<SubscriptionTier, string> = {
  free: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  pro: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
};

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'FREE',
  pro: 'PRO',
};

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold
        rounded-full border border-current flex-shrink-0
        ${TIER_STYLES[tier]} ${className}
      `}
      aria-label={`Subscription tier: ${TIER_LABELS[tier]}`}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
