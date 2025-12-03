// Audio Processing Constants
export const AUDIO_CONSTANTS = {
  // FFmpeg transcoding
  TRANSCODE_BITRATE: '128k' as const,
  CHUNK_SIZE_LIMIT: 24 * 1024 * 1024, // 24MB (safe margin below 25MB API limit)
  SEGMENT_TIME_SECONDS: 20 * 60, // 20 minutes

  // Recording
  RECORDING_TIMER_INTERVAL: 100, // milliseconds

  // Trim validation
  MIN_TRIM_DURATION: 0.1, // 0.1 seconds minimum trim duration
} as const;

// API Validation Constants
export const API_VALIDATION = {
  // Transcript/Summary limits
  MAX_TRANSCRIPT_LENGTH: 500000, // 500KB text limit
  MIN_TRANSCRIPT_LENGTH: 10, // Minimum 10 characters
  MAX_MESSAGE_LENGTH: 10000, // 10KB message limit
  MAX_HISTORY_ITEMS: 50, // Limit conversation history
  MAX_TEXT_LENGTH: 500000, // 500KB for transcript/summary

  // API Key validation
  MIN_API_KEY_LENGTH: 10,
  MAX_API_KEY_LENGTH: 200,

  // File size limits
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB limit for uploads
  MAX_FIELDS: 10, // Max form fields in multipart
  MAX_FILES: 1, // Max files in multipart

  // Timeouts
  REQUEST_TIMEOUT: 60000, // 60 seconds
  VALIDATION_TIMEOUT: 30000, // 30 seconds
  API_DEFAULT_TIMEOUT: 120000, // 2 minutes
  TRANSCRIBE_TIMEOUT: 300000, // 5 minutes for large audio files
} as const;

// Content type options
export const CONTENT_TYPES = [
  'meeting',
  'lecture',
  'interview',
  'podcast',
  'general'
] as const;

export type ContentType = typeof CONTENT_TYPES[number];
