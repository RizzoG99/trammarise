import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase-admin';

/**
 * Usage Tracking Middleware
 *
 * Tracks API usage for billing and quota enforcement.
 * Supports minute-based billing with credits as fallback.
 */

interface QuotaCheckResult {
  allowed: boolean;
  minutesRemaining: number;
  minutesRequired: number;
  reason?: string;
  isByok?: boolean;
  usingCredits?: boolean;
  creditsRemaining?: number;
}

interface CheckQuotaOptions {
  allowByok?: boolean;
}

const TIER_MINUTES: Record<string, number> = {
  free: 0,
  pro: 500,
  team: 2000,
};

/**
 * Track usage for a user
 *
 * @param userId - User UUID
 * @param operationType - Type of operation (transcription, summarization, chat)
 * @param durationSeconds - Duration in seconds (for transcription)
 */
export async function trackUsage(
  userId: string,
  operationType: 'transcription' | 'summarization' | 'chat',
  durationSeconds: number
): Promise<void> {
  try {
    // Fetch user subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, tier, minutes_used')
      .eq('user_id', userId)
      .single();

    // If no subscription (free tier), don't track usage
    if (subError && subError.code === 'PGRST116') {
      return;
    }

    if (!subscription) {
      return;
    }

    // Calculate minutes (round up)
    const minutesUsed = Math.ceil(durationSeconds / 60);

    // Insert usage event
    const { error: insertError } = await supabaseAdmin.from('usage_events').insert({
      user_id: userId,
      operation_type: operationType,
      duration_seconds: durationSeconds,
      minutes_used: minutesUsed,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Failed to insert usage event:', insertError);
      return; // Don't throw - usage tracking failures shouldn't block operations
    }

    // Increment subscription minutes_used via RPC
    const { error: rpcError } = await supabaseAdmin.rpc('increment_minutes_used', {
      sub_id: subscription.id,
      minutes: minutesUsed,
    });

    if (rpcError) {
      console.error('Failed to increment minutes_used:', rpcError);
    }
  } catch (error) {
    console.error('Error tracking usage:', error);
    // Don't throw - usage tracking failures shouldn't block operations
  }
}

/**
 * Check if user has sufficient quota
 *
 * @param userId - User UUID
 * @param requiredMinutes - Minutes required for operation
 * @param options - Additional options (allowByok for free tier)
 * @returns Quota check result
 */
export async function checkQuota(
  userId: string,
  requiredMinutes: number,
  options: CheckQuotaOptions = {}
): Promise<QuotaCheckResult> {
  try {
    // Fetch user subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('tier, minutes_used, credits_balance')
      .eq('user_id', userId)
      .single();

    // If no subscription (free tier)
    if (subError && subError.code === 'PGRST116') {
      // Allow BYOK mode for free tier
      if (options.allowByok) {
        return {
          allowed: true,
          minutesRemaining: Infinity,
          minutesRequired: requiredMinutes,
          isByok: true,
        };
      }

      return {
        allowed: false,
        minutesRemaining: 0,
        minutesRequired: requiredMinutes,
        reason: 'No subscription',
      };
    }

    if (!subscription) {
      return {
        allowed: false,
        minutesRemaining: 0,
        minutesRequired: requiredMinutes,
        reason: 'Subscription not found',
      };
    }

    // Calculate remaining minutes
    const minutesIncluded = TIER_MINUTES[subscription.tier] || 0;
    const minutesRemaining = minutesIncluded - (subscription.minutes_used || 0);

    // Check if quota allows operation
    if (minutesRemaining >= requiredMinutes) {
      return {
        allowed: true,
        minutesRemaining,
        minutesRequired: requiredMinutes,
      };
    }

    // Check credits balance as fallback
    const creditsBalance = subscription.credits_balance || 0;
    if (creditsBalance >= requiredMinutes) {
      return {
        allowed: true,
        minutesRemaining,
        minutesRequired: requiredMinutes,
        usingCredits: true,
        creditsRemaining: creditsBalance,
      };
    }

    // Quota exceeded
    return {
      allowed: false,
      minutesRemaining,
      minutesRequired: requiredMinutes,
      reason: 'Quota exceeded',
    };
  } catch (error) {
    console.error('Error checking quota:', error);
    // On error, deny access
    return {
      allowed: false,
      minutesRemaining: 0,
      minutesRequired: requiredMinutes,
      reason: 'Error checking quota',
    };
  }
}

/**
 * Middleware wrapper to track usage after successful handler execution
 *
 * @param handler - API route handler
 * @param operationType - Type of operation to track
 * @returns Wrapped handler with usage tracking
 */
export function withUsageTracking(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
  operationType: 'transcription' | 'summarization' | 'chat'
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    // Execute handler first
    await handler(req, res);

    // Track usage after successful execution
    // Note: This is a simplified version - in production, you'd extract
    // userId from auth middleware and duration from request body
    const userId = req.body?.userId;
    const durationSeconds = req.body?.durationSeconds || 0;

    if (userId && durationSeconds) {
      await trackUsage(userId, operationType, durationSeconds);
    }
  };
}
