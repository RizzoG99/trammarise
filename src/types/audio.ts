// Audio file interface
export interface AudioFile {
  name: string;
  blob: Blob;
  url?: string;
}

// Application state
export type AppState = 'initial' | 'recording' | 'audio';

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
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'small';

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
