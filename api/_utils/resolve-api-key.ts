import { supabaseAdmin } from '../_lib/supabase-admin';
import { checkQuota } from '../_middleware/usage-tracking';

export interface ResolvedApiKey {
  apiKey: string;
  shouldTrackQuota: boolean;
  subscriptionTier: string;
}

export class FreeUserNoKeyError extends Error {
  readonly requiresApiKey = true;
  constructor() {
    super('API key required');
  }
}

export class QuotaExceededError extends Error {
  constructor(
    public readonly minutesRemaining: number,
    public readonly minutesRequired?: number
  ) {
    super('Quota exceeded');
  }
}

/**
 * Resolves which OpenAI API key to use for a given request.
 *
 * BYOK users: returns their key with no quota deduction.
 * Pro/Team users: returns the platform key and sets shouldTrackQuota = true.
 * Free users without a key: throws FreeUserNoKeyError.
 * Users over quota: throws QuotaExceededError.
 */
export async function resolveApiKey(
  userId: string,
  userKey: string | null,
  estimatedMinutes: number,
  callerLabel: string
): Promise<ResolvedApiKey> {
  if (userKey) {
    console.log(`[${callerLabel}] User ${userId} using BYOK mode`);
    return { apiKey: userKey, shouldTrackQuota: false, subscriptionTier: 'byok' };
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('tier')
    .eq('user_id', userId)
    .single();

  if (!subscription || subscription.tier === 'free') {
    throw new FreeUserNoKeyError();
  }

  const quotaCheck = await checkQuota(userId, estimatedMinutes);
  if (!quotaCheck.allowed) {
    throw new QuotaExceededError(quotaCheck.minutesRemaining, quotaCheck.minutesRequired);
  }

  console.log(
    `[${callerLabel}] User ${userId} (${subscription.tier}) using platform key with quota tracking`
  );
  return {
    apiKey: process.env.OPENAI_API_KEY!,
    shouldTrackQuota: true,
    subscriptionTier: subscription.tier,
  };
}
