import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ProviderFactory, type ProviderType } from './providers/factory';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    const aiProvider = ProviderFactory.getProvider(provider as ProviderType);
    const isValid = await aiProvider.validateApiKey(apiKey);

    return res.status(200).json({ valid: isValid });
  } catch (error: any) {
    console.error('Validation error:', error);
    return res.status(200).json({ valid: false });
  }
}
