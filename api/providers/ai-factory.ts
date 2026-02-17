import { OpenAIProvider } from './openai';
import { OpenRouterProvider } from './openrouter';
import type { AIProvider } from './base';

/**
 * AI Provider types for summarization and chat operations
 * (Separate from transcription providers)
 */
export type AIProviderType = 'openai' | 'openrouter';

/**
 * Factory for creating AI providers (summarization, chat, validation)
 *
 * @example
 * const provider = AIProviderFactory.getProvider('openai');
 * const summary = await provider.summarize({ transcript, contentType, apiKey });
 */
export class AIProviderFactory {
  /**
   * Get an AI provider instance by type
   *
   * @param providerType - The type of AI provider ('openai' or 'openrouter')
   * @returns An instance of the requested AI provider
   * @throws Error if provider type is unknown
   */
  static getProvider(providerType: AIProviderType): AIProvider {
    switch (providerType) {
      case 'openai':
        return new OpenAIProvider();
      case 'openrouter':
        return new OpenRouterProvider();
      default:
        throw new Error(`Unknown AI provider: ${providerType}`);
    }
  }
}
