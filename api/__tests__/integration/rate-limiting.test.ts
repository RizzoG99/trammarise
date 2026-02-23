/**
 * Integration tests for rate limiting middleware
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, RateLimitError, RATE_LIMITS } from '../../middleware/rate-limit';

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    // Note: In-memory rate limit store is shared between tests
    // In a real test environment, you'd want to clear the store between tests
  });

  describe('IP-based Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const { req } = createMocks<VercelRequest, VercelResponse>({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
      });

      // Should not throw for first request
      await expect(
        rateLimit(req, {
          windowMs: 60000,
          maxRequests: 5,
        })
      ).resolves.toBeUndefined();
    });

    it('should block requests exceeding rate limit', async () => {
      const { req } = createMocks<VercelRequest, VercelResponse>({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.101', // Different IP to avoid conflicts
        },
      });

      const config = {
        windowMs: 60000,
        maxRequests: 3,
      };

      // Make 3 requests (should all succeed)
      await rateLimit(req, config);
      await rateLimit(req, config);
      await rateLimit(req, config);

      // 4th request should be rate limited
      await expect(rateLimit(req, config)).rejects.toThrow(RateLimitError);
    });

    it('should include retry-after in error', async () => {
      const { req } = createMocks<VercelRequest, VercelResponse>({
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.102',
        },
      });

      const config = {
        windowMs: 60000,
        maxRequests: 2,
      };

      await rateLimit(req, config);
      await rateLimit(req, config);

      try {
        await rateLimit(req, config);
        expect.fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBeGreaterThan(0);
        expect((error as RateLimitError).statusCode).toBe(429);
      }
    });
  });

  describe('User-based Rate Limiting', () => {
    it('should use custom key generator', async () => {
      const { req } = createMocks<VercelRequest, VercelResponse>({
        method: 'POST',
      });

      const config = {
        windowMs: 60000,
        maxRequests: 5,
        keyGenerator: () => 'user:custom-user-123',
      };

      // Should not throw with custom key generator
      await expect(rateLimit(req, config)).resolves.toBeUndefined();
    });
  });

  describe('Predefined Rate Limits', () => {
    it('should have strict limit for validate-key endpoint', () => {
      expect(RATE_LIMITS.VALIDATE_KEY).toEqual({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10,
      });
    });

    it('should have limit for transcribe endpoint', () => {
      expect(RATE_LIMITS.TRANSCRIBE).toEqual({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 20,
      });
    });

    it('should have limit for summarize endpoint', () => {
      expect(RATE_LIMITS.SUMMARIZE).toEqual({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 100,
      });
    });

    it('should have limit for chat endpoint', () => {
      expect(RATE_LIMITS.CHAT).toEqual({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
      });
    });
  });
});
