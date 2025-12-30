import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ProviderFactory, type ProviderType } from './providers/factory';
import { API_VALIDATION } from '../src/utils/constants';

const { MIN_API_KEY_LENGTH, MAX_API_KEY_LENGTH } = API_VALIDATION;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, apiKey } = req.body;

    // Validate inputs
    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({ error: 'Provider is required and must be a string', valid: false });
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key is required and must be a string', valid: false });
    }

    if (apiKey.length < MIN_API_KEY_LENGTH || apiKey.length > MAX_API_KEY_LENGTH) {
      return res.status(400).json({ error: 'Invalid API key format', valid: false });
    }

    const aiProvider = ProviderFactory.getProvider(provider as ProviderType);
    const isValid = await aiProvider.validateApiKey(apiKey);

    if (isValid) {
      return res.status(200).json({ valid: true });
    } else {
      // Return 401 Unauthorized instead of 200 for invalid keys
      return res.status(401).json({ valid: false, error: 'Invalid API key' });
    }
  } catch (error) {
    const err = error as { message?: string };
    console.error('Validation error:', error);
    // Return 500 for server errors, not 200
    return res.status(500).json({
      valid: false,
      error: 'Validation failed',
      message: err.message
    });
  }
}
