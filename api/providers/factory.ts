import type { TranscriptionProvider } from '../types/provider';
import { OpenAITranscriptionAdapter } from './openai-transcription-adapter';
import { AssemblyAIProvider } from './assemblyai';

/**
 * Transcription provider type
 */
export type ProviderType = 'openai' | 'assemblyai';

/**
 * Provider configuration options
 */
export interface ProviderConfig {
  /** Provider type */
  provider: ProviderType;
  /** API key (if using user's own key) */
  apiKey?: string;
  /** Enable speaker diarization (only for providers that support it) */
  enableSpeakerDiarization?: boolean;
}

/**
 * Provider Factory
 *
 * Creates transcription provider instances based on configuration.
 * Handles provider selection and initialization.
 *
 * @example
 * const provider = TranscriptionProviderFactory.create({
 *   provider: 'assemblyai',
 *   apiKey: userApiKey,
 *   enableSpeakerDiarization: true,
 * });
 *
 * const result = await provider.transcribe({
 *   audioFile: buffer,
 *   language: 'en',
 * });
 */
export class TranscriptionProviderFactory {
  /**
   * Create a transcription provider instance
   */
  static create(config: ProviderConfig): TranscriptionProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAITranscriptionAdapter(config.apiKey);

      case 'assemblyai':
        if (config.enableSpeakerDiarization) {
          return new AssemblyAIProvider({ apiKey: config.apiKey });
        }
        // If speaker diarization not needed, use OpenAI for cost efficiency
        return new OpenAITranscriptionAdapter(config.apiKey);

      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  /**
   * Get default provider based on requirements
   */
  static getDefaultProvider(enableSpeakerDiarization: boolean): ProviderType {
    // Use AssemblyAI if speaker diarization is needed, otherwise OpenAI
    return enableSpeakerDiarization ? 'assemblyai' : 'openai';
  }

  /**
   * Check if provider supports speaker diarization
   */
  static supportsSpeakerDiarization(provider: ProviderType): boolean {
    switch (provider) {
      case 'assemblyai':
        return true;
      case 'openai':
        return false;
      default:
        return false;
    }
  }

  /**
   * Get list of available providers
   */
  static getAvailableProviders(): Array<{
    type: ProviderType;
    name: string;
    supportsSpeakerDiarization: boolean;
  }> {
    return [
      {
        type: 'openai',
        name: 'OpenAI Whisper',
        supportsSpeakerDiarization: false,
      },
      {
        type: 'assemblyai',
        name: 'AssemblyAI',
        supportsSpeakerDiarization: true,
      },
    ];
  }
}
