import type { LanguageCode } from './languages';

// Audio file interface
export interface AudioFile {
  name: string;
  blob: Blob;
  file: File;
  url?: string;
}

// Application state
export type AppState =
  | 'initial'
  | 'recording'
  | 'audio'
  | 'configuration'
  | 'processing'
  | 'results';

// AI Provider types
export type AIProvider = 'openai' | 'openrouter';
export type ConfigMode = 'simple' | 'advanced';

export interface AIConfiguration {
  mode: ConfigMode;
  provider: AIProvider;
  model: string; // For simple: 'standard' or 'advanced', for advanced: OpenRouter model ID
  openaiKey: string; // Always required for Whisper transcription
  openrouterKey?: string; // Only for advanced mode
  contentType: string; // ContentType value or custom string when 'other' is selected
  language: LanguageCode;
  contextFiles?: File[];
  noiseProfile?: string; // Audio environment: 'quiet', 'meeting_room', 'cafe', 'outdoor', 'phone'
  // Speaker diarization options
  enableSpeakerDiarization?: boolean;
  speakersExpected?: number;
  knownSpeakers?: string[]; // Optional speaker names for identification
}

// Recording state
export interface RecordingState {
  isRecording: boolean;
  duration: number;
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

// Button variant types
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'outline'
  | 'small'
  | 'large';

// WaveSurfer configuration
export interface WaveSurferConfig {
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  barWidth?: number;
  barRadius?: number;
  cursorWidth?: number;
  height?: number;
  barGap?: number;
  responsive?: boolean;
  normalize?: boolean;
}

// Chat message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Speaker utterance (for speaker diarization)
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
}

// Processing result
export interface ProcessingResult {
  transcript: string;
  summary: string;
  chatHistory: ChatMessage[];
  configuration: AIConfiguration;
  /** Speaker-labeled utterances (if speaker diarization was enabled) */
  utterances?: Utterance[];
  /** Whisper API segments with real timestamps (for accurate syncing) */
  segments?: Array<{
    text: string;
    start: number; // seconds
    end: number;
    id: number;
  }>;
}

// Processing state
export interface ProcessingStateData {
  step: 'loading' | 'compressing' | 'transcribing' | 'configuring' | 'summarizing' | 'complete';
  progress: number;
  transcript?: string;
}

// API response types
export interface TranscriptionResponse {
  transcript: string;
  /** Speaker-labeled utterances (if speaker diarization was enabled) */
  utterances?: Utterance[];
  /** Whisper API segments with real timestamps */
  segments?: Array<{
    text: string;
    start: number; // seconds
    end: number;
    id: number;
  }>;
}

export interface SummarizationResponse {
  summary: string;
}

export interface ChatResponse {
  response: string;
}
