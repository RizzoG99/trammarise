import axios from 'axios';
import type {
  TranscriptionProvider,
  TranscriptionRequest,
  TranscriptionResponse,
  Utterance,
} from '../types/provider';

interface AssemblyAIProviderOptions {
  apiKey?: string;
  maxPollingAttempts?: number;
  pollingInterval?: number;
}

/**
 * AssemblyAI Transcription Provider
 *
 * Provides audio transcription with optional speaker diarization using AssemblyAI API.
 *
 * Features:
 * - High-quality transcription
 * - Speaker diarization (labels speakers as A, B, C, etc.)
 * - Speaker identification (map labels to real names)
 * - Utterance-based results with timestamps
 * - 99+ language support
 *
 * @example
 * const provider = new AssemblyAIProvider();
 * const result = await provider.transcribe({
 *   audioFile: buffer,
 *   language: 'en',
 *   enableSpeakerDiarization: true,
 *   speakersExpected: 2,
 * });
 */
export class AssemblyAIProvider implements TranscriptionProvider {
  private apiKey: string;
  private baseUrl = 'https://api.assemblyai.com/v2';
  private maxPollingAttempts: number;
  private pollingInterval: number;

  constructor(options?: AssemblyAIProviderOptions) {
    this.apiKey = options?.apiKey || process.env.ASSEMBLYAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('AssemblyAI API key is required');
    }
    this.maxPollingAttempts = options?.maxPollingAttempts || 60; // 5 minutes with 5s intervals
    this.pollingInterval = options?.pollingInterval || 5000; // 5 seconds
  }

  /**
   * Upload audio file to AssemblyAI
   */
  private async uploadAudio(audioBuffer: Buffer): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/upload`, audioBuffer, {
      headers: {
        authorization: this.apiKey,
        'content-type': 'application/octet-stream',
      },
    });

    return response.data.upload_url;
  }

  /**
   * Submit transcription job
   */
  private async submitTranscription(
    audioUrl: string,
    options: TranscriptionRequest
  ): Promise<string> {
    const requestBody: Record<string, unknown> = {
      audio_url: audioUrl,
      speaker_labels: options.enableSpeakerDiarization || false,
    };

    // Add language if specified
    if (options.language) {
      requestBody.language_code = options.language;
    }

    // Add speaker count if specified
    if (options.speakersExpected) {
      requestBody.speakers_expected = options.speakersExpected;
    } else if (options.speakerOptions) {
      requestBody.speaker_options = {
        min_speakers_expected: options.speakerOptions.minSpeakers,
        max_speakers_expected: options.speakerOptions.maxSpeakers,
      };
    }

    // Add known speakers for identification (if provided)
    if (options.knownSpeakers && options.knownSpeakers.length > 0) {
      requestBody.speech_understanding = {
        request: {
          speaker_identification: {
            speaker_type: 'name',
            known_values: options.knownSpeakers,
          },
        },
      };
    }

    const response = await axios.post(`${this.baseUrl}/transcript`, requestBody, {
      headers: {
        authorization: this.apiKey,
        'content-type': 'application/json',
      },
    });

    return response.data.id;
  }

  /**
   * Poll for transcription completion
   */
  private async pollTranscription(transcriptId: string): Promise<TranscriptionResponse> {
    let attempts = 0;

    while (attempts < this.maxPollingAttempts) {
      const response = await axios.get(`${this.baseUrl}/transcript/${transcriptId}`, {
        headers: {
          authorization: this.apiKey,
        },
      });

      const result = response.data;

      if (result.status === 'completed') {
        // Map AssemblyAI response to our format
        const transcriptionResponse: TranscriptionResponse = {
          text: result.text,
          duration: result.audio_duration,
          language: result.language_code,
          metadata: {
            transcriptId: result.id,
            provider: 'AssemblyAI',
          },
        };

        // Add utterances if speaker labels were enabled
        if (result.utterances && result.utterances.length > 0) {
          transcriptionResponse.utterances = result.utterances.map(
            (utterance: {
              speaker: string;
              text: string;
              start: number;
              end: number;
              confidence: number;
              words?: Array<{
                text: string;
                start: number;
                end: number;
                confidence: number;
                speaker?: string;
              }>;
            }): Utterance => ({
              speaker: utterance.speaker,
              text: utterance.text,
              start: utterance.start,
              end: utterance.end,
              confidence: utterance.confidence,
              words: utterance.words,
            })
          );
        }

        return transcriptionResponse;
      } else if (result.status === 'error') {
        throw new Error(result.error || 'Transcription failed');
      }

      // Still processing, wait and try again
      await new Promise((resolve) => setTimeout(resolve, this.pollingInterval));
      attempts++;
    }

    throw new Error('Transcription timeout after ' + this.maxPollingAttempts + ' attempts');
  }

  /**
   * Transcribe audio with optional speaker diarization
   */
  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      // Step 1: Upload audio
      const audioUrl = await this.uploadAudio(request.audioFile);

      // Step 2: Submit transcription job
      const transcriptId = await this.submitTranscription(audioUrl, request);

      // Step 3: Poll for completion
      const result = await this.pollTranscription(transcriptId);

      return result;
    } catch (error) {
      console.error('AssemblyAI transcription error:', error);
      throw error;
    }
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'AssemblyAI';
  }

  /**
   * Check if provider supports speaker diarization
   */
  supportsSpeakerDiarization(): boolean {
    return true;
  }
}
