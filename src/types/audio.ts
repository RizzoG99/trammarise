// Audio file interface
export interface AudioFile {
  name: string;
  blob: Blob;
  url?: string;
}

// Application state
export type AppState = 'initial' | 'recording' | 'audio' | 'configuration' | 'processing' | 'results';

// AI Provider types
export type AIProvider = 'openai' | 'claude' | 'deepseek';

export interface AIConfiguration {
  provider: AIProvider;
  apiKey: string;
  openaiKey: string; // For transcription (Whisper)
  contentType: string;
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
