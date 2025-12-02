import { OpenAIProvider } from './openai';
import { OpenRouterProvider } from './openrouter';
import type { AIProvider } from './base';

export type ProviderType = 'openai' | 'openrouter';

export class ProviderFactory {
  static getProvider(type: ProviderType): AIProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider();
      case 'openrouter':
        return new OpenRouterProvider();
      default:
        throw new Error(`Unsupported provider: ${type}`);
    }
  }
}
