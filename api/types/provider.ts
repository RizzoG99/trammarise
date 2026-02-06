/**
 * Transcription Provider Types
 *
 * Type definitions for transcription service providers (OpenAI, AssemblyAI, etc.)
 */

/**
 * Speaker utterance in a transcript
 */
export interface Utterance {
  /** Speaker label (e.g., "A", "B", or custom name) */
  speaker: string;
  /** Transcribed text for this utterance */
  text: string;
  /** Start time in milliseconds */
  start: number;
  /** End time in milliseconds */
  end: number;
  /** Confidence score (0-1) */
  confidence: number;
  /** Optional word-level details */
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: string;
  }>;
}

/**
 * Transcription request parameters
 */
export interface TranscriptionRequest {
  /** Audio file buffer */
  audioFile: Buffer;
  /** Language code (e.g., 'en', 'es', 'fr') */
  language?: string;
  /** Enable speaker diarization */
  enableSpeakerDiarization?: boolean;
  /** Number of expected speakers (optional) */
  speakersExpected?: number;
  /** Range of possible speakers */
  speakerOptions?: {
    minSpeakers?: number;
    maxSpeakers?: number;
  };
  /** Known speaker names for identification */
  knownSpeakers?: string[];
  /** Custom prompt for transcription */
  prompt?: string;
  /** Model to use (if provider supports multiple) */
  model?: string;
}

/**
 * Transcription response
 */
export interface TranscriptionResponse {
  /** Full transcript text */
  text: string;
  /** Speaker-labeled utterances (if diarization enabled) */
  utterances?: Utterance[];
  /** Audio duration in seconds */
  duration?: number;
  /** Language detected */
  language?: string;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Base transcription provider interface
 */
export interface TranscriptionProvider {
  /**
   * Transcribe audio file
   */
  transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse>;

  /**
   * Get provider name
   */
  getProviderName(): string;

  /**
   * Check if provider supports speaker diarization
   */
  supportsSpeakerDiarization(): boolean;
}
