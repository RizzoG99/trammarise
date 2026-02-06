/**
 * Subscription type definitions
 */

export type SubscriptionTier = 'free' | 'pro' | 'team';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  minutesIncluded: number;
  minutesUsed: number;
  creditsBalance: number;
}
