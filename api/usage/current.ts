import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * Get current month usage for authenticated user
 *
 * Returns total minutes consumed and event count for the current billing period
 *
 * @returns {
 *   totalMinutes: number,
 *   eventCount: number,
 *   billingPeriod: string (ISO date)
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = await requireAuth();

    // Get current billing period (first day of current month)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const billingPeriod = `${year}-${month}-01`;

    // Query usage events for current billing period
    const { data: events, error } = await supabaseAdmin
      .from('usage_events')
      .select('minutes_consumed')
      .eq('user_id', userId)
      .eq('billing_period', billingPeriod);

    if (error) {
      console.error('Failed to fetch usage events:', error);
      return res.status(500).json({ error: 'Failed to fetch usage data' });
    }

    // Calculate totals
    const totalMinutes =
      events?.reduce((sum, event) => sum + (event.minutes_consumed || 0), 0) || 0;
    const eventCount = events?.length || 0;

    return res.status(200).json({
      totalMinutes,
      eventCount,
      billingPeriod: `${billingPeriod}T00:00:00.000Z`,
    });
  } catch (error) {
    console.error('Error in usage/current:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
