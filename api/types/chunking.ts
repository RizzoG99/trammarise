/**
 * Audio Chunking Type Definitions
 *
 * Defines types and constants for mode-aware audio chunking with FFmpeg.
 */

/**
 * Processing modes with different chunking strategies
 */
export type ProcessingMode = 'balanced' | 'best_quality';

/**
 * Metadata for a single audio chunk
 */
export interface ChunkMetadata {
  /** Chunk index (0-based) */
  index: number;

  /** Start time in seconds */
  startTime: number;

  /** End time in seconds */
  endTime: number;

  /** Duration in seconds */
  duration: number;

  /** SHA-256 hash of chunk file for idempotency */
  hash: string;

  /** Whether this chunk has overlap with next chunk (Best Quality mode only) */
  hasOverlap: boolean;

  /** Start time of overlap region in seconds (if hasOverlap is true) */
  overlapStartTime?: number;

  /** File path to the chunk audio file */
  filePath: string;
}

/**
 * Result of audio chunking operation
 */
export interface ChunkingResult {
  /** Array of chunk metadata */
  chunks: ChunkMetadata[];

  /** Total duration of original audio in seconds */
  totalDuration: number;

  /** Processing mode used for chunking */
  mode: ProcessingMode;

  /** Total number of chunks created */
  totalChunks: number;
}

/**
 * Mode-specific chunking configuration
 */
export interface ChunkingConfig {
  /** Chunk duration in seconds */
  chunkDuration: number;

  /** Overlap duration in seconds */
  overlapDuration: number;

  /** Maximum concurrent transcriptions */
  maxConcurrency: number;

  /** Maximum retry attempts per chunk */
  maxRetries: number;

  /** Backoff strategy */
  backoffStrategy: 'exponential' | 'linear';
}

/**
 * Chunking configurations by processing mode
 */
export const CHUNKING_CONFIGS: Record<ProcessingMode, ChunkingConfig> = {
  balanced: {
    chunkDuration: 180, // 3 minutes
    overlapDuration: 0,
    maxConcurrency: 4,
    maxRetries: 3,
    backoffStrategy: 'exponential',
  },
  best_quality: {
    chunkDuration: 600, // 10 minutes
    overlapDuration: 15, // 15 seconds
    maxConcurrency: 1,
    maxRetries: 2,
    backoffStrategy: 'linear',
  },
};

/**
 * Audio processing constants
 */
export const AUDIO_CONSTANTS = {
  /** FFmpeg output codec */
  CODEC: 'libmp3lame',

  /** Output bitrate */
  BITRATE: '128k',

  /** Audio channels (mono) */
  CHANNELS: 1,

  /** Sample rate in Hz */
  SAMPLE_RATE: 16000,

  /** Maximum file size for OpenAI Whisper (25MB, using 24MB to be safe) */
  MAX_WHISPER_SIZE: 24 * 1024 * 1024,
} as const;

/**
 * Auto-split configuration when chunks fail
 */
export const AUTO_SPLIT_CONFIG = {
  /** Sub-chunk duration for Balanced mode (90 seconds) */
  BALANCED_SUBCHUNK_DURATION: 90,

  /** Sub-chunk duration for Best Quality mode (5 minutes) */
  BEST_QUALITY_SUBCHUNK_DURATION: 300,
} as const;
