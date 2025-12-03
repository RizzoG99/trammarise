import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ProviderFactory, type ProviderType } from './providers/factory';
import { API_VALIDATION, CONTENT_TYPES } from '../src/utils/constants';

const { MAX_TRANSCRIPT_LENGTH, MIN_TRANSCRIPT_LENGTH, MIN_API_KEY_LENGTH, MAX_API_KEY_LENGTH } = API_VALIDATION;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, contentType, provider, apiKey, model } = req.body;

    // Validate transcript
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required and must be a string' });
    }

    if (transcript.length < MIN_TRANSCRIPT_LENGTH) {
      return res.status(400).json({ error: `Transcript too short. Minimum ${MIN_TRANSCRIPT_LENGTH} characters required` });
    }

    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return res.status(400).json({ error: `Transcript too long. Maximum ${MAX_TRANSCRIPT_LENGTH} characters allowed` });
    }

    // Validate contentType
    if (contentType && !CONTENT_TYPES.includes(contentType)) {
      return res.status(400).json({
        error: `Invalid content type. Must be one of: ${CONTENT_TYPES.join(', ')}`
      });
    }

    // Validate provider and API key
    if (!provider || typeof provider !== 'string') {
      return res.status(400).json({ error: 'Provider is required and must be a string' });
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ error: 'API key is required and must be a string' });
    }

    if (apiKey.length < MIN_API_KEY_LENGTH || apiKey.length > MAX_API_KEY_LENGTH) {
      return res.status(400).json({ error: 'Invalid API key format' });
    }

    // Validate OpenRouter-specific requirements
    if (provider === 'openrouter' && (!model || typeof model !== 'string')) {
      return res.status(400).json({ error: 'Model is required for OpenRouter and must be a string' });
    }

    const aiProvider = ProviderFactory.getProvider(provider as ProviderType);

    const summary = await aiProvider.summarize({
      transcript,
      contentType,
      apiKey,
      model, // Optional: only required for OpenRouter
    });

    return res.status(200).json({ summary });
  } catch (error: any) {
    console.error('Summarization error:', error);
    return res.status(500).json({
      error: 'Summarization failed',
      message: error.message
    });
  }
}
