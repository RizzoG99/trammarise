import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

const VALID_USE_CASES = [
  'meeting',
  'lecture',
  'interview',
  'podcast',
  'voice-memo',
  'other',
] as const;
type UseCase = (typeof VALID_USE_CASES)[number];

function isValidUseCase(value: unknown): value is UseCase {
  return typeof value === 'string' && (VALID_USE_CASES as readonly string[]).includes(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = await requireAuth(req);

    switch (req.method) {
      case 'GET':
        return await handleGet(userId, res);
      case 'PATCH':
        return await handlePatch(userId, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(userId: string, res: VercelResponse) {
  const { data, error } = await supabaseAdmin
    .from('user_settings')
    .select('onboarding_use_case')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch preferences:', error);
    return res.status(500).json({ error: 'Failed to retrieve preferences' });
  }

  return res.status(200).json({
    onboardingUseCase: data?.onboarding_use_case ?? null,
  });
}

async function handlePatch(userId: string, req: VercelRequest, res: VercelResponse) {
  const { onboardingUseCase } = req.body ?? {};

  if (!isValidUseCase(onboardingUseCase)) {
    return res
      .status(400)
      .json({ error: `Invalid use case. Must be one of: ${VALID_USE_CASES.join(', ')}` });
  }

  const { error } = await supabaseAdmin.from('user_settings').upsert(
    {
      user_id: userId,
      onboarding_use_case: onboardingUseCase,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Failed to save preference:', error);
    return res.status(500).json({ error: 'Failed to save preference' });
  }

  return res.status(200).json({ success: true });
}
