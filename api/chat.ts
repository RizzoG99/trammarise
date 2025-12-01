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
    const { transcript, summary, message, history, provider, apiKey } = req.body;

    if (!transcript || !summary || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    const aiProvider = ProviderFactory.getProvider(provider as ProviderType);

    const response = await aiProvider.chat({
      transcript,
      summary,
      message,
      history: Array.isArray(history) ? history : [],
      apiKey,
    });

    return res.status(200).json({ response });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Chat failed',
      message: error.message
    });
  }
}
