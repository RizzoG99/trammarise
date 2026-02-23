import type { SubscriptionTier } from './subscription-types';

/**
 * Feature matrix by subscription tier
 */
export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ['byok', 'basic-editing', 'export-pdf', 'local-storage'],
  pro: [
    'basic-editing',
    'export-pdf',
    'local-storage',
    'hosted-api',
    'cloud-sync',
    'priority-processing',
    'advanced-audio',
    'chat',
    'custom-models',
    'email-support',
  ],
  team: [
    'basic-editing',
    'export-pdf',
    'local-storage',
    'hosted-api',
    'cloud-sync',
    'priority-processing',
    'advanced-audio',
    'chat',
    'custom-models',
    'email-support',
    'team-collaboration',
    'shared-workspaces',
    'admin-controls',
    'usage-analytics',
    'priority-support',
    'custom-integrations',
  ],
};

/**
 * Default free tier subscription
 */
export const FREE_SUBSCRIPTION = {
  id: 'free',
  tier: 'free' as SubscriptionTier,
  status: 'active' as const,
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
  minutesIncluded: 0,
  minutesUsed: 0,
  creditsBalance: 0,
};
