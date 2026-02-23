import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

// Define limits in minutes
const TIER_LIMITS = {
  free: 60,
  pro: 500,
  team: 2000,
};

/**
 * Get current month usage for authenticated user
 *
 * Returns total minutes consumed, event count, and limit status
 *
 * @returns {
 *   totalMinutes: number,
 *   eventCount: number,
 *   billingPeriod: string (ISO date),
 *   tier: 'free' | 'pro' | 'team',
 *   limit: number,
 *   remainingMinutes: number,
 *   isOverLimit: boolean
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = await requireAuth(req);

    // Get current billing period (first day of current month)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const billingPeriod = `${year}-${month}-01`;

    // 1. Get User's Subscription Tier
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('tier, status')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single();

    const tier = (subscription?.tier as 'free' | 'pro' | 'team') || 'free';
    const limit = TIER_LIMITS[tier] || TIER_LIMITS.free;

    // 2. Query usage events for current billing period
    const { data: events, error } = await supabaseAdmin
      .from('usage_events')
      .select('minutes_consumed')
      .eq('user_id', userId)
      .eq('billing_period', billingPeriod);

    if (error) {
      console.error('Failed to fetch usage events:', error);
      return res.status(500).json({ error: 'Failed to fetch usage data' });
    }

    // 3. Calculate totals & Limits
    const totalMinutes =
      events?.reduce((sum, event) => sum + (event.minutes_consumed || 0), 0) || 0;
    const eventCount = events?.length || 0;
    const remainingMinutes = Math.max(0, limit - totalMinutes);
    const isOverLimit = totalMinutes >= limit;

    return res.status(200).json({
      totalMinutes,
      eventCount,
      billingPeriod: `${billingPeriod}T00:00:00.000Z`,
      tier,
      limit,
      remainingMinutes,
      isOverLimit,
    });
  } catch (error) {
    console.error('Error in usage/current:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
