import type { SubscriptionTier } from '@/context/subscription-types';

interface TierBadgeProps {
  tier: SubscriptionTier;
  className?: string;
}

const TIER_STYLES: Record<SubscriptionTier, string> = {
  free: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  pro: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  team: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'FREE',
  pro: 'PRO',
  team: 'TEAM',
};

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  return (
    <span
      className={`
        absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold
        rounded-full border border-current
        ${TIER_STYLES[tier]} ${className}
      `}
      aria-label={`Subscription tier: ${TIER_LABELS[tier]}`}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
