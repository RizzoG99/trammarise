/**
 * Transcription Job Type Definitions
 *
 * Defines types for asynchronous transcription job management.
 */

import type { ChunkMetadata, ProcessingMode } from './chunking';
import type { Utterance } from './provider';

/**
 * Job status states
 */
export type JobStatus =
  | 'pending' // Job created, not started
  | 'chunking' // Creating audio chunks
  | 'transcribing' // Transcribing chunks
  | 'assembling' // Assembling final transcript
  | 'completed' // Successfully completed
  | 'failed' // Failed with error
  | 'cancelled'; // Cancelled by user

/**
 * Individual chunk processing status
 */
export type ChunkProcessingStatus =
  | 'pending' // Not started
  | 'in_progress' // Currently transcribing
  | 'completed' // Successfully transcribed
  | 'failed' // Failed after retries
  | 'retrying' // Retrying after failure
  | 'splitting'; // Auto-splitting into sub-chunks

/**
 * Status information for a single chunk
 */
export interface ChunkStatus {
  /** Current processing status */
  status: ChunkProcessingStatus;

  /** Transcribed text (if completed) */
  transcript?: string;

  /** Number of retry attempts */
  retryCount: number;

  /** Whether this chunk was auto-split due to failures */
  wasSplit: boolean;

  /** Error message (if failed) */
  error?: string;

  /** Timestamp of last status update */
  lastUpdated: Date;
}

/**
 * Transcription job configuration
 */
export interface JobConfiguration {
  /** OpenAI API key */
  apiKey: string;

  /** Processing mode */
  mode: ProcessingMode;

  /** Whisper model */
  model: string;

  /** Language code (optional) */
  language?: string;

  /** Temperature for transcription */
  temperature?: number;

  /** Custom prompt for Whisper */
  prompt?: string;

  /** Enable speaker diarization (requires AssemblyAI) */
  enableSpeakerDiarization?: boolean;

  /** Expected number of speakers (2-10, optional) */
  speakersExpected?: number;
}

/**
 * Job metadata
 */
export interface JobMetadata {
  /** Original filename */
  filename: string;

  /** File size in bytes */
  fileSize: number;

  /** Audio duration in seconds */
  duration: number;

  /** Total number of chunks */
  totalChunks: number;

  /** Job creation timestamp */
  createdAt: Date;

  /** Job completion timestamp */
  completedAt?: Date;

  /** Total processing time in milliseconds */
  processingTime?: number;
}

/**
 * Complete transcription job
 */
export interface TranscriptionJob {
  /** Unique job identifier */
  jobId: string;

  /** Current job status */
  status: JobStatus;

  /** Job configuration */
  config: JobConfiguration;

  /** Job metadata */
  metadata: JobMetadata;

  /** Chunk metadata */
  chunks: ChunkMetadata[];

  /** Chunk processing statuses */
  chunkStatuses: ChunkStatus[];

  /** Overall progress (0-100) */
  progress: number;

  /** Number of completed chunks */
  completedChunks: number;

  /** Final assembled transcript (if completed) */
  transcript?: string;

  /** Speaker-labeled utterances (if speaker diarization enabled) */
  utterances?: Utterance[];

  /** Error message (if failed) */
  error?: string;

  /** Total retry count across all chunks */
  totalRetries: number;

  /** Number of chunks that were auto-split */
  chunkingSplits: number;

  /** Last update timestamp */
  lastUpdated: Date;
}

/**
 * Job safeguard limits to prevent infinite loops
 */
export const JOB_SAFEGUARDS = {
  /** Maximum total retries across all chunks */
  MAX_TOTAL_RETRIES: 20,

  /** Maximum number of auto-splits allowed */
  MAX_SPLITS: 2,

  /** Maximum job age in milliseconds (2 hours) */
  MAX_JOB_AGE: 2 * 60 * 60 * 1000,

  /** Job cleanup interval in milliseconds (5 minutes) */
  CLEANUP_INTERVAL: 5 * 60 * 1000,
} as const;

/**
 * Job creation request
 */
export interface CreateJobRequest {
  /** Audio file buffer */
  audioBuffer: Buffer;

  /** Original filename */
  filename: string;

  /** Job configuration */
  config: JobConfiguration;
}

/**
 * Job status response for API
 */
export interface JobStatusResponse {
  /** Job ID */
  jobId: string;

  /** Current status */
  status: JobStatus;

  /** Progress percentage (0-100) */
  progress: number;

  /** Number of completed chunks */
  completedChunks: number;

  /** Total number of chunks */
  totalChunks: number;

  /** Final transcript (if completed) */
  transcript?: string;

  /** Speaker-labeled utterances (if speaker diarization enabled) */
  utterances?: Utterance[];

  /** Error message (if failed) */
  error?: string;

  /** Estimated time remaining in seconds (optional) */
  estimatedTimeRemaining?: number;

  /** Metadata about the job */
  metadata: {
    filename: string;
    duration: number;
    mode: ProcessingMode;
    createdAt: Date;
    completedAt?: Date;
  };
}
