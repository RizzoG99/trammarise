/**
 * Rate Limiting Type Definitions
 *
 * Defines types for the adaptive rate limit governor that handles
 * concurrent requests, HTTP 429 errors, and degraded mode.
 */

import type { ProcessingMode } from './chunking';

/**
 * A queued transcription request
 */
export interface QueuedRequest<T = unknown> {
  /** Unique request identifier */
  id: string;

  /** Associated job ID */
  jobId: string;

  /** Chunk index being processed */
  chunkIndex: number;

  /** Priority (higher = more urgent) */
  priority: number;

  /** Execution function that returns a promise */
  execute: () => Promise<T>;

  /** Number of times this request has been attempted */
  attemptCount: number;

  /** Timestamp when request was queued */
  queuedAt: Date;

  /** Timestamp of last attempt */
  lastAttemptAt?: Date;

  /** Resolve callback */
  resolve: (value: T) => void;

  /** Reject callback */
  reject: (error: Error) => void;
}

/**
 * Statistics for rate limiting behavior
 */
export interface RateLimitStats {
  /** Total requests processed */
  totalRequests: number;

  /** Number of successful requests */
  successfulRequests: number;

  /** Number of requests that hit rate limits (HTTP 429) */
  rateLimitedRequests: number;

  /** Number of failed requests (non-429 errors) */
  failedRequests: number;

  /** Total time spent in degraded mode (ms) */
  degradedModeTime: number;

  /** Number of times degraded mode was activated */
  degradedModeActivations: number;

  /** Average request duration in milliseconds */
  averageRequestDuration: number;

  /** Peak concurrent requests */
  peakConcurrency: number;
}

/**
 * Rate limit governor state
 */
export interface RateLimitState {
  /** Maximum concurrent requests allowed */
  maxConcurrency: number;

  /** Current number of in-flight requests */
  currentConcurrency: number;

  /** Request queue */
  queue: QueuedRequest[];

  /** Currently executing requests */
  inFlight: Map<string, QueuedRequest>;

  /** Whether in degraded mode */
  degradedMode: boolean;

  /** Normal mode concurrency (to restore after degraded mode) */
  normalConcurrency: number;

  /** Statistics */
  stats: RateLimitStats;

  /** Processing mode */
  mode: ProcessingMode;

  /** Recent request outcomes (for degraded mode detection) */
  recentOutcomes: Array<'success' | 'rate_limited' | 'failed'>;

  /** Last time degraded mode was entered */
  lastDegradedModeAt?: Date;
}

/**
 * Backoff configuration
 */
export interface BackoffConfig {
  /** Base delay in milliseconds */
  baseDelay: number;

  /** Maximum delay in milliseconds */
  maxDelay: number;

  /** Backoff multiplier for exponential strategy */
  multiplier: number;

  /** Random jitter range (0-1, proportion of delay) */
  jitter: number;
}

/**
 * Backoff configurations by processing mode
 */
export const BACKOFF_CONFIGS: Record<ProcessingMode, BackoffConfig> = {
  balanced: {
    baseDelay: 2000, // Start at 2 seconds
    maxDelay: 10000, // Cap at 10 seconds
    multiplier: 2.5, // Exponential: 2s -> 5s -> 10s
    jitter: 0.3, // ±30% randomization
  },
  best_quality: {
    baseDelay: 5000, // Start at 5 seconds
    maxDelay: 10000, // Cap at 10 seconds
    multiplier: 1, // Linear: 5s -> 10s
    jitter: 0.2, // ±20% randomization
  },
};

/**
 * Degraded mode configuration
 */
export const DEGRADED_MODE_CONFIG = {
  /** Threshold: activate if >30% of recent requests are rate limited */
  ACTIVATION_THRESHOLD: 0.3,

  /** Sample size for calculating rate limit percentage */
  SAMPLE_SIZE: 20,

  /** Exit threshold: deactivate if <10% rate limited */
  EXIT_THRESHOLD: 0.1,

  /** Concurrency reduction: divide by this factor */
  CONCURRENCY_REDUCTION_FACTOR: 2,

  /** Minimum time to stay in degraded mode (ms) */
  MIN_DEGRADED_DURATION: 30000, // 30 seconds
} as const;

/**
 * HTTP 429 rate limit error
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number, // Seconds to wait
    public requestId?: string
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Request execution result
 */
export interface RequestResult<T> {
  /** Whether the request succeeded */
  success: boolean;

  /** Result data (if successful) */
  data?: T;

  /** Error (if failed) */
  error?: Error;

  /** Request duration in milliseconds */
  duration: number;

  /** Whether this was a rate limit error */
  wasRateLimited: boolean;
}
