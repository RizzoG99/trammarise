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
    const { transcript, contentType, provider, apiKey, model } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    if (provider === 'openrouter' && !model) {
      return res.status(400).json({ error: 'Model is required for OpenRouter' });
    }

    const aiProvider = ProviderFactory.getProvider(provider as ProviderType);

    const summary = await aiProvider.summarize({
      transcript,
      contentType,
      apiKey,
      model, // Pass model for OpenRouter
    } as any); // Type assertion needed due to optional model param

    return res.status(200).json({ summary });
  } catch (error: any) {
    console.error('Summarization error:', error);
    return res.status(500).json({
      error: 'Summarization failed',
      message: error.message
    });
  }
}
