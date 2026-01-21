/**
 * Test Fixtures
 *
 * Shared test data, helper functions, and utilities for testing.
 */

import type { TranscriptionJob, JobConfiguration, JobMetadata } from '../../types/job';
import type { ChunkMetadata, ProcessingMode } from '../../types/chunking';

/**
 * Create a test job with sensible defaults
 */
export function createTestJob(overrides?: {
  config?: Partial<JobConfiguration>;
  metadata?: Partial<Omit<JobMetadata, 'createdAt'>>;
  status?: TranscriptionJob['status'];
  chunks?: ChunkMetadata[];
  transcript?: string;
  error?: string;
}): TranscriptionJob {
  const now = new Date();

  const config: JobConfiguration = {
    apiKey: overrides?.config?.apiKey || 'test-api-key-12345',
    mode: overrides?.config?.mode || 'balanced',
    model: overrides?.config?.model || 'whisper-1',
    language: overrides?.config?.language,
    temperature: overrides?.config?.temperature,
    prompt: overrides?.config?.prompt,
  };

  const chunks = overrides?.chunks || [];
  const totalChunks = chunks.length;

  const metadata: JobMetadata = {
    filename: overrides?.metadata?.filename || 'test-audio.mp3',
    fileSize: overrides?.metadata?.fileSize || 1024 * 1024, // 1MB default
    duration: overrides?.metadata?.duration || 180, // 3 minutes default
    totalChunks,
    createdAt: now,
    completedAt: overrides?.metadata?.completedAt,
    processingTime: overrides?.metadata?.processingTime,
  };

  return {
    jobId: `test-job-${now.getTime()}`,
    status: overrides?.status || 'pending',
    config,
    metadata,
    chunks,
    chunkStatuses: chunks.map(() => ({
      status: 'pending',
      retryCount: 0,
      wasSplit: false,
      lastUpdated: now,
    })),
    progress: 0,
    completedChunks: 0,
    transcript: overrides?.transcript,
    error: overrides?.error,
    totalRetries: 0,
    chunkingSplits: 0,
    lastUpdated: now,
  };
}

/**
 * Create mock chunk metadata
 */
export function createTestChunk(index: number, overrides?: Partial<ChunkMetadata>): ChunkMetadata {
  const startTime = overrides?.startTime ?? index * 180;
  const duration = overrides?.duration ?? 180;
  const hasOverlap = overrides?.hasOverlap ?? false;
  const overlapDuration = overrides?.overlapDuration ?? (hasOverlap ? 15 : 0);

  return {
    index,
    startTime,
    duration,
    endTime: overrides?.endTime ?? startTime + duration,
    filePath: overrides?.filePath ?? `/tmp/chunk_${String(index).padStart(2, '0')}.mp3`,
    hash: overrides?.hash ?? `hash_${index}`,
    hasOverlap,
    overlapStartTime: hasOverlap ? startTime + duration - overlapDuration : undefined,
    ...(overrides?.status && { status: overrides.status }),
    ...(overrides?.retryCount !== undefined && { retryCount: overrides.retryCount }),
    ...(overrides?.transcript !== undefined && { transcript: overrides.transcript }),
    ...(overrides?.error && { error: overrides.error }),
  };
}

/**
 * Setup mock chunks for a job
 */
export function setupMockChunks(count: number, mode: ProcessingMode = 'balanced'): ChunkMetadata[] {
  const chunkDuration = mode === 'balanced' ? 180 : 600; // 3min or 10min
  const overlapDuration = mode === 'best_quality' ? 15 : 0;

  return Array.from({ length: count }, (_, i) =>
    createTestChunk(i, {
      duration: chunkDuration,
      hasOverlap: mode === 'best_quality',
      overlapDuration,
    })
  );
}

/**
 * Create overlapping chunks for best quality mode testing
 */
export function createOverlappingChunks(count: number): ChunkMetadata[] {
  return Array.from({ length: count }, (_, i) =>
    createTestChunk(i, {
      startTime: i * 600 - (i > 0 ? 15 : 0), // 10min chunks with 15s overlap
      duration: 600,
      hasOverlap: true,
      overlapDuration: 15,
      transcript: `End of chunk ${i - 1} overlapping text. Start of chunk ${i} unique content.`,
    })
  );
}

/**
 * Mock transcript data for testing
 */
export const MOCK_TRANSCRIPTS = {
  simple: 'This is a simple transcript.',
  withPunctuation: 'Hello, world! How are you doing today? Great, thanks.',
  multiSentence: 'First sentence here. Second sentence follows. Third sentence concludes.',
  overlapping: {
    chunk0: 'This is the beginning of the audio. The speaker discusses topic one in detail.',
    chunk1: 'The speaker discusses topic one in detail. Moving on to topic two now.',
    chunk2: 'Moving on to topic two now. The conclusion wraps everything up nicely.',
  },
  withNumbers: 'There are 42 items in the list, and the total cost is $1,234.56.',
  withSpecialChars: 'Email me at test@example.com or call (555) 123-4567!',
};

/**
 * Concurrency Tracker
 *
 * Tracks concurrent operations for testing rate limiting
 */
export class ConcurrencyTracker {
  private currentConcurrency = 0;
  private maxConcurrency = 0;
  private operations: Array<{ start: number; end: number | null }> = [];

  start(): void {
    this.currentConcurrency++;
    if (this.currentConcurrency > this.maxConcurrency) {
      this.maxConcurrency = this.currentConcurrency;
    }
    this.operations.push({ start: Date.now(), end: null });
  }

  end(): void {
    this.currentConcurrency = Math.max(0, this.currentConcurrency - 1);
    const lastOp = this.operations.find((op) => op.end === null);
    if (lastOp) {
      lastOp.end = Date.now();
    }
  }

  getMaxConcurrency(): number {
    return this.maxConcurrency;
  }

  getCurrentConcurrency(): number {
    return this.currentConcurrency;
  }

  reset(): void {
    this.currentConcurrency = 0;
    this.maxConcurrency = 0;
    this.operations = [];
  }

  getOperations(): Array<{ start: number; end: number | null }> {
    return [...this.operations];
  }

  /**
   * Get average operation duration in ms
   */
  getAverageDuration(): number {
    const completed = this.operations.filter((op) => op.end !== null);
    if (completed.length === 0) return 0;

    const totalDuration = completed.reduce((sum, op) => sum + (op.end! - op.start), 0);
    return totalDuration / completed.length;
  }
}

/**
 * Retry Counter
 *
 * Tracks retry attempts for specific items
 */
export class RetryCounter {
  private retries = new Map<string | number, number>();

  increment(key: string | number): number {
    const current = this.retries.get(key) || 0;
    const newCount = current + 1;
    this.retries.set(key, newCount);
    return newCount;
  }

  get(key: string | number): number {
    return this.retries.get(key) || 0;
  }

  reset(key?: string | number): void {
    if (key !== undefined) {
      this.retries.delete(key);
    } else {
      this.retries.clear();
    }
  }

  getTotalRetries(): number {
    return Array.from(this.retries.values()).reduce((sum, count) => sum + count, 0);
  }

  getKeys(): Array<string | number> {
    return Array.from(this.retries.keys());
  }
}

/**
 * Backoff Tracker
 *
 * Tracks backoff delays for testing exponential/linear backoff
 */
export class BackoffTracker {
  private delays: number[] = [];

  record(delayMs: number): void {
    this.delays.push(delayMs);
  }

  getDelays(): number[] {
    return [...this.delays];
  }

  getLastDelay(): number | undefined {
    return this.delays[this.delays.length - 1];
  }

  /**
   * Check if delays follow exponential pattern
   */
  isExponential(tolerance = 0.3): boolean {
    if (this.delays.length < 2) return true;

    for (let i = 1; i < this.delays.length; i++) {
      const ratio = this.delays[i] / this.delays[i - 1];
      // Exponential should roughly double (accounting for jitter)
      if (ratio < 1.5 - tolerance || ratio > 2.5 + tolerance) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if delays follow linear pattern
   */
  isLinear(tolerance = 0.3): boolean {
    if (this.delays.length < 2) return true;

    const firstDiff = this.delays[1] - this.delays[0];

    for (let i = 2; i < this.delays.length; i++) {
      const diff = this.delays[i] - this.delays[i - 1];
      const ratio = Math.abs(diff - firstDiff) / firstDiff;
      if (ratio > tolerance) {
        return false;
      }
    }

    return true;
  }

  reset(): void {
    this.delays = [];
  }

  getAverageDelay(): number {
    if (this.delays.length === 0) return 0;
    return this.delays.reduce((sum, d) => sum + d, 0) / this.delays.length;
  }
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(
  condition: () => boolean,
  timeoutMs = 5000,
  pollIntervalMs = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

/**
 * Create a deferred promise for manual resolution
 */
export function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (error: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
}

/**
 * Sleep for specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a range of numbers
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i);
}
