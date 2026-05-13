import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth, AuthError } from '../_middleware/auth';
import {
  rateLimit,
  RateLimitError,
  RATE_LIMITS,
  type RateLimitConfig,
} from '../_middleware/rate-limit';

export type { AuthError, RateLimitError };

type RateLimitKey = keyof typeof RATE_LIMITS;

interface ApiMiddlewareOptions {
  rateLimitKey: RateLimitKey;
}

interface ApiMiddlewareResult {
  userId: string;
}

/**
 * Runs auth + rate-limit for an API route.
 * Returns { userId } on success; throws AuthError or RateLimitError on failure.
 */
export async function withApiMiddleware(
  req: VercelRequest,
  options: ApiMiddlewareOptions
): Promise<ApiMiddlewareResult> {
  const { userId } = await requireAuth(req);

  const rateLimitConfig: RateLimitConfig = {
    ...RATE_LIMITS[options.rateLimitKey],
    keyGenerator: () => `user:${userId}`,
  };
  await rateLimit(req, rateLimitConfig);

  return { userId };
}

/**
 * Sends a standardized error response for auth/rate-limit errors.
 * Returns true if the error was handled, false otherwise.
 */
export function handleMiddlewareError(error: unknown, res: VercelResponse): boolean {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({ error: error.message });
    return true;
  }

  if (error instanceof RateLimitError) {
    res.setHeader('Retry-After', error.retryAfter.toString());
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please wait before trying again',
      retryAfter: error.retryAfter,
    });
    return true;
  }

  return false;
}
