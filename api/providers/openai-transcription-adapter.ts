import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { OpenAI } from 'openai';
import type {
  TranscriptionProvider,
  TranscriptionRequest,
  TranscriptionResponse,
} from '../types/provider';

/**
 * OpenAI Transcription Provider Adapter
 *
 * Adapts OpenAI Whisper API to the TranscriptionProvider interface.
 * Provides high-quality transcription using OpenAI's Whisper model.
 *
 * Note: OpenAI Whisper does NOT support speaker diarization.
 * For speaker diarization, use AssemblyAIProvider instead.
 *
 * @example
 * const provider = new OpenAIProvider('your-api-key');
 * const result = await provider.transcribe({
 *   audioFile: buffer,
 *   language: 'en',
 * });
 */
export class OpenAIProvider implements TranscriptionProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    // Write buffer to temporary file (OpenAI SDK requires file path)
    const tempFilePath = path.join(
      os.tmpdir(),
      `audio-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`
    );

    try {
      await fs.promises.writeFile(tempFilePath, request.audioFile);

      const openai = new OpenAI({
        baseURL: 'https://api.openai.com/v1',
        apiKey: this.apiKey,
      });

      const completion = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: request.model || 'whisper-1',
        language: request.language,
        prompt: request.prompt,
        response_format: 'verbose_json', // Get duration and language
      });

      // Clean up temp file
      await fs.promises.unlink(tempFilePath);

      // OpenAI Whisper doesn't support speaker diarization
      // If requested, log a warning
      if (request.enableSpeakerDiarization) {
        console.warn(
          'Speaker diarization requested but OpenAI Whisper does not support it. ' +
            'Use AssemblyAI provider for speaker diarization.'
        );
      }

      return {
        text: completion.text,
        duration: completion.duration,
        language: completion.language,
        metadata: {
          provider: 'OpenAI',
          model: 'whisper-1',
        },
      };
    } catch (error) {
      // Clean up temp file on error
      try {
        await fs.promises.unlink(tempFilePath);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'OpenAI';
  }

  /**
   * Check if provider supports speaker diarization
   */
  supportsSpeakerDiarization(): boolean {
    return false;
  }
}
