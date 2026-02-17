import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';
import { FREE_SUBSCRIPTION } from '../../src/context/subscription-tiers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = await requireAuth(req);

    // Query subscriptions table
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    // If no subscription found, return free tier
    if (!subscription) {
      return res.status(200).json(FREE_SUBSCRIPTION);
    }

    // Return subscription with calculated fields
    return res.status(200).json({
      id: subscription.id,
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      minutesUsed: subscription.minutes_used || 0,
      creditsBalance: subscription.credits_balance || 0,
    });
  } catch (error) {
    console.error('Error in subscriptions/current:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
