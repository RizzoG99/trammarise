import type { VercelRequest } from '@vercel/node';

/**
 * Rate Limiting Middleware
 *
 * Provides in-memory rate limiting for API endpoints.
 *
 * NOTE: This implementation uses in-memory storage which is suitable for development
 * and low-traffic production. For production at scale, consider migrating to
 * Upstash Redis for distributed rate limiting across serverless functions.
 */

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Optional function to generate rate limit key (defaults to IP-based) */
  keyGenerator?: (req: VercelRequest) => string;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store for request counts
const requestCounts = new Map<string, RateLimitRecord>();

export class RateLimitError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Apply rate limiting to a request
 *
 * @param req - Vercel request object
 * @param config - Rate limit configuration
 * @throws RateLimitError if rate limit is exceeded
 */
export async function rateLimit(req: VercelRequest, config: RateLimitConfig): Promise<void> {
  const key = config.keyGenerator ? config.keyGenerator(req) : getDefaultKey(req);
  const now = Date.now();

  // Clean up expired entries
  cleanupExpired(now);

  const record = requestCounts.get(key);

  if (!record || now > record.resetAt) {
    // First request or window expired - create new record
    requestCounts.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return;
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    throw new RateLimitError('Too many requests', 429, retryAfter);
  }

  // Increment request count
  record.count++;
}

/**
 * Get default rate limit key based on IP address
 */
function getDefaultKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket?.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

/**
 * Clean up expired rate limit records
 */
function cleanupExpired(now: number): void {
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetAt) {
      requestCounts.delete(key);
    }
  }
}

/**
 * Predefined rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  /** Strict rate limit for API key validation - prevents brute force attacks */
  VALIDATE_KEY: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  },

  /** Rate limit for transcription endpoint */
  TRANSCRIBE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
  },

  /** Rate limit for summarization endpoint */
  SUMMARIZE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
  },

  /** Rate limit for chat endpoint */
  CHAT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 messages per minute per user
  },
} as const;
