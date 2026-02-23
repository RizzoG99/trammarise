import { createConfigurationBuilder } from '../builders/ConfigurationBuilder';
import type { AIConfiguration } from '../types/audio';
import type { SessionData } from '../types/routing';

/**
 * Builds AIConfiguration from environment variables and session data.
 *
 * This is a temporary solution for Phase 1 (Quick Win) that uses environment variables
 * for API keys. In Phase 2, we'll add UI for users to input their own keys.
 *
 * @param session - Session data containing language, contentType, processingMode, and contextFiles
 * @returns AIConfiguration object ready for processing
 */
export function buildDefaultConfiguration(session: SessionData): AIConfiguration {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  const provider = (import.meta.env.VITE_DEFAULT_PROVIDER || 'openai') as 'openai' | 'openrouter';

  // Map processingMode to model for transcription
  // 'balanced' -> 'standard' (uses gpt-4o-mini-transcribe)
  // 'quality' -> 'advanced' (uses gpt-4o-transcribe)
  const model = session.processingMode === 'quality' ? 'advanced' : 'standard';

  // Build configuration using the Builder pattern
  const builder = createConfigurationBuilder()
    .withMode('simple')
    .withProvider(provider)
    .withModel(model)
    .withOpenAIKey(openaiKey)
    .withContentType(session.contentType);

  // Skip language when 'auto' or empty — Whisper auto-detects in that case
  if (session.language && (session.language as string) !== 'auto') {
    builder.withLanguage(session.language);
  }

  // Add context files if they exist
  if (session.contextFiles && session.contextFiles.length > 0) {
    builder.withContextFiles(session.contextFiles);
  }

  const config = builder.build();

  // Add OpenRouter key if using OpenRouter provider
  if (provider === 'openrouter' && openrouterKey) {
    config.openrouterKey = openrouterKey;
  }

  return config;
}

/**
 * Validates that required API keys are present in environment variables.
 * Throws an error with helpful message if keys are missing.
 */
export function validateEnvironmentConfiguration(): void {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const provider = import.meta.env.VITE_DEFAULT_PROVIDER || 'openai';

  if (!openaiKey || openaiKey === 'sk-YOUR_OPENAI_KEY_HERE') {
    throw new Error(
      'OpenAI API key not configured. Please add your API key to .env.local:\n' +
        'VITE_OPENAI_API_KEY=sk-...\n\n' +
        'Get your key at: https://platform.openai.com/api-keys'
    );
  }

  if (provider === 'openrouter') {
    const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!openrouterKey || openrouterKey === 'sk-or-YOUR_OPENROUTER_KEY_HERE') {
      throw new Error(
        'OpenRouter API key not configured. Please add your API key to .env.local:\n' +
          'VITE_OPENROUTER_API_KEY=sk-or-...\n\n' +
          'Get your key at: https://openrouter.ai/keys'
      );
    }
  }
}
