import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AIProviderFactory, type AIProviderType } from './providers/ai-factory';
import { API_VALIDATION } from '../src/utils/constants';
import { rateLimit, RateLimitError, RATE_LIMITS } from './middleware/rate-limit';

const { MIN_API_KEY_LENGTH, MAX_API_KEY_LENGTH } = API_VALIDATION;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply strict rate limiting to prevent brute-force attacks
    await rateLimit(req, RATE_LIMITS.VALIDATE_KEY);

    const { provider, apiKey } = req.body;

    // Validate inputs
    if (!provider || typeof provider !== 'string') {
      return res
        .status(400)
        .json({ error: 'Provider is required and must be a string', valid: false });
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return res
        .status(400)
        .json({ error: 'API key is required and must be a string', valid: false });
    }

    if (apiKey.length < MIN_API_KEY_LENGTH || apiKey.length > MAX_API_KEY_LENGTH) {
      return res.status(400).json({ error: 'Invalid API key format', valid: false });
    }

    const aiProvider = AIProviderFactory.getProvider(provider as AIProviderType);
    const isValid = await aiProvider.validateApiKey(apiKey);

    if (isValid) {
      return res.status(200).json({ valid: true });
    } else {
      // Return 401 Unauthorized instead of 200 for invalid keys
      return res.status(401).json({ valid: false, error: 'Invalid API key' });
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.setHeader('Retry-After', error.retryAfter.toString());
      return res.status(429).json({
        error: 'Too many validation attempts',
        message: 'Please wait before trying again',
        retryAfter: error.retryAfter,
        valid: false,
      });
    }

    const err = error as { message?: string };
    console.error('Validation error:', error);
    // Return 500 for server errors, not 200
    return res.status(500).json({
      valid: false,
      error: 'Validation failed',
      message: err.message,
    });
  }
}
