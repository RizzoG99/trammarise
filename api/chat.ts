import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ProviderFactory, type ProviderType } from './providers/factory';
import { API_VALIDATION } from '../src/utils/constants';
import { getSummarizationModelForLevel, type PerformanceLevel } from '../src/types/performance-levels';

const { MAX_MESSAGE_LENGTH, MAX_HISTORY_ITEMS, MAX_TEXT_LENGTH, MIN_API_KEY_LENGTH, MAX_API_KEY_LENGTH } = API_VALIDATION;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, summary, message, history, provider, apiKey, model } = req.body;

    // Validate required fields with type checking
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required and must be a string' });
    }

    if (transcript.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: `Transcript too long. Maximum ${MAX_TEXT_LENGTH} characters allowed` });
    }

    if (!summary || typeof summary !== 'string') {
      return res.status(400).json({ error: 'Summary is required and must be a string' });
    }

    if (summary.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ error: `Summary too long. Maximum ${MAX_TEXT_LENGTH} characters allowed` });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed` });
    }

    // Validate history
    if (history && !Array.isArray(history)) {
      return res.status(400).json({ error: 'History must be an array' });
    }

    if (history && history.length > MAX_HISTORY_ITEMS) {
      return res.status(400).json({ error: `History too long. Maximum ${MAX_HISTORY_ITEMS} items allowed` });
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

    // Map performance level to actual model name
    const actualModel = model
      ? getSummarizationModelForLevel(model as PerformanceLevel)
      : undefined;

    const response = await aiProvider.chat({
      transcript,
      summary,
      message,
      history: Array.isArray(history) ? history : [],
      apiKey,
      model: actualModel, // Optional: only required for OpenRouter
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
