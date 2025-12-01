import { OpenAIProvider } from './openai';
import { ClaudeProvider } from './claude';
import { DeepseekProvider } from './deepseek';
import type { AIProvider } from './base';

export type ProviderType = 'openai' | 'claude' | 'deepseek';

export class ProviderFactory {
  static getProvider(type: ProviderType): AIProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider();
      case 'claude':
        return new ClaudeProvider();
      case 'deepseek':
        return new DeepseekProvider();
      default:
        throw new Error(`Unsupported provider: ${type}`);
    }
  }
}
