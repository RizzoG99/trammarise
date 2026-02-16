import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * Get current credits balance for authenticated user
 *
 * @returns {
 *   credits: number,
 *   history: Array<{
 *     id: string,
 *     type: string,
 *     amount: number,
 *     description: string,
 *     created_at: string
 *   }>
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = await requireAuth(req);

    // Fetch subscription with credits balance
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('credits_balance')
      .eq('user_id', userId)
      .single();

    if (subError && subError.code === 'PGRST116') {
      // No subscription found - return zero balance
      return res.status(200).json({
        credits: 0,
        history: [],
      });
    }

    if (subError) {
      console.error('Failed to fetch subscription:', subError);
      return res.status(500).json({ error: 'Failed to fetch credits balance' });
    }

    // Optionally fetch transaction history
    const includeHistory = req.query.include_history === 'true';
    let history = [];

    if (includeHistory) {
      const { data: transactions, error: txError } = await supabaseAdmin
        .from('credit_transactions')
        .select('id, transaction_type, credits_amount, description, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!txError && transactions) {
        history = transactions.map((tx) => ({
          id: tx.id,
          type: tx.transaction_type,
          amount: tx.credits_amount,
          description: tx.description,
          created_at: tx.created_at,
        }));
      }
    }

    return res.status(200).json({
      credits: subscription?.credits_balance || 0,
      history,
    });
  } catch (error) {
    console.error('Error in credits/balance:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
