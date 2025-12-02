// Audio file interface
export interface AudioFile {
  name: string;
  blob: Blob;
  file: File;
  url?: string;
}

// Application state
export type AppState = 'initial' | 'recording' | 'audio' | 'configuration' | 'processing' | 'results';

// AI Provider types
export type AIProvider = 'openai' | 'openrouter';
export type ConfigMode = 'simple' | 'advanced';

export interface AIConfiguration {
  mode: ConfigMode;
  provider: AIProvider;
  model: string; // For simple: 'gpt-4o' or 'o3-mini', for advanced: OpenRouter model ID
  openaiKey: string; // Always required for Whisper transcription
  openrouterKey?: string; // Only for advanced mode
  contentType: string;
  language: string;
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
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'small' | 'large';

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

// Processing result
export interface ProcessingResult {
  transcript: string;
  summary: string;
  chatHistory: ChatMessage[];
  configuration: AIConfiguration;
}

// Processing state
export interface ProcessingStateData {
  step: 'compressing' | 'transcribing' | 'configuring' | 'summarizing' | 'complete';
  progress: number;
  transcript?: string;
}

// API response types
export interface TranscriptionResponse {
  transcript: string;
}

export interface SummarizationResponse {
  summary: string;
}

export interface ChatResponse {
  response: string;
}
