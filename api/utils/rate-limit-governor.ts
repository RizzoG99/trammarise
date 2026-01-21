/**
 * Rate Limit Governor
 *
 * Manages concurrent API requests with:
 * - Mode-aware concurrency limits (Balanced: 4, Best Quality: 1)
 * - HTTP 429 detection and retry with backoff
 * - Adaptive degraded mode when sustained rate limiting occurs
 * - Request queuing and priority management
 */

import type { QueuedRequest, RateLimitState, RateLimitStats } from '../types/rate-limiting';
import type { ProcessingMode } from '../types/chunking';
import { CHUNKING_CONFIGS } from '../types/chunking';
import { BACKOFF_CONFIGS, DEGRADED_MODE_CONFIG } from '../types/rate-limiting';
import { JobManager } from './job-manager';

export class RateLimitGovernor {
  private state: RateLimitState;

  constructor(mode: ProcessingMode) {
    const config = CHUNKING_CONFIGS[mode];

    this.state = {
      maxConcurrency: config.maxConcurrency,
      currentConcurrency: 0,
      queue: [],
      inFlight: new Map(),
      degradedMode: false,
      normalConcurrency: config.maxConcurrency,
      mode,
      recentOutcomes: [],
      stats: {
        totalRequests: 0,
        successfulRequests: 0,
        rateLimitedRequests: 0,
        failedRequests: 0,
        degradedModeTime: 0,
        degradedModeActivations: 0,
        averageRequestDuration: 0,
        peakConcurrency: 0,
      },
    };
  }

  /**
   * Enqueue a request for execution
   */
  async enqueue<T>(
    id: string,
    jobId: string,
    chunkIndex: number,
    execute: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id,
        jobId,
        chunkIndex,
        priority,
        execute,
        attemptCount: 0,
        queuedAt: new Date(),
        resolve,
        reject,
      };

      this.state.queue.push(request);
      this.sortQueue();
      this.processQueue();
    });
  }

  /**
   * Process queued requests respecting concurrency limits
   */
  private async processQueue(): Promise<void> {
    while (
      this.state.queue.length > 0 &&
      this.state.currentConcurrency < this.state.maxConcurrency
    ) {
      const request = this.state.queue.shift();
      if (!request) break;

      this.executeRequest(request);
    }
  }

  /**
   * Execute a single request with error handling
   */
  private async executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
    this.state.currentConcurrency++;
    this.state.inFlight.set(request.id, request);

    // Update peak concurrency
    if (this.state.currentConcurrency > this.state.stats.peakConcurrency) {
      this.state.stats.peakConcurrency = this.state.currentConcurrency;
    }

    request.attemptCount++;
    request.lastAttemptAt = new Date();

    const startTime = Date.now();

    try {
      // Check if job was cancelled before executing
      const job = JobManager.getJob(request.jobId);
      if (job?.status === 'cancelled') {
        console.log(
          `[Rate Governor] Job ${request.jobId} cancelled, aborting request ${request.id}`
        );
        this.state.currentConcurrency--;
        this.state.inFlight.delete(request.id);
        request.reject(new Error('Job was cancelled by user'));
        this.processQueue();
        return;
      }

      const result = await request.execute();
      const duration = Date.now() - startTime;

      // Success
      this.recordOutcome('success', duration);
      this.state.stats.successfulRequests++;

      this.state.currentConcurrency--;
      this.state.inFlight.delete(request.id);

      request.resolve(result);
      this.processQueue(); // Process next item
    } catch (error) {
      const duration = Date.now() - startTime;
      this.state.currentConcurrency--;
      this.state.inFlight.delete(request.id);

      // Check if it's a rate limit error
      if (this.isRateLimitError(error)) {
        this.recordOutcome('rate_limited', duration);
        this.state.stats.rateLimitedRequests++;

        const config = BACKOFF_CONFIGS[this.state.mode];

        console.warn(
          `[Rate Governor] Request ${request.id} rate limited (attempt ${request.attemptCount}/${config.maxRetries})`
        );

        // Check if max retries exceeded
        if (request.attemptCount >= config.maxRetries) {
          console.error(
            `[Rate Governor] Request ${request.id} exceeded max retries (${config.maxRetries}), failing`
          );
          request.reject(
            new Error(`Rate limit retry limit exceeded after ${request.attemptCount} attempts`)
          );
          this.checkDegradedMode();
          return; // Don't retry
        }

        // Calculate backoff and retry
        const backoff = this.calculateBackoff(request.attemptCount);
        console.log(`[Rate Governor] Retrying after ${backoff}ms`);

        // Re-enqueue with higher priority
        setTimeout(() => {
          request.priority += 10; // Increase priority
          this.state.queue.unshift(request); // Add to front
          this.sortQueue();
          this.processQueue();
        }, backoff);

        // Check if we should enter degraded mode
        this.checkDegradedMode();
      } else {
        // Other error
        this.recordOutcome('failed', duration);
        this.state.stats.failedRequests++;

        console.error(`[Rate Governor] Request ${request.id} failed:`, error);
        request.reject(error as Error);
      }

      this.processQueue(); // Process next item
    }
  }

  /**
   * Calculate backoff delay based on retry count and mode
   */
  calculateBackoff(retryCount: number): number {
    const config = BACKOFF_CONFIGS[this.state.mode];
    let delay: number;

    if (config.multiplier > 1) {
      // Exponential backoff
      delay = Math.min(
        config.baseDelay * Math.pow(config.multiplier, retryCount - 1),
        config.maxDelay
      );
    } else {
      // Linear backoff
      delay = Math.min(config.baseDelay * retryCount, config.maxDelay);
    }

    // Add jitter
    const jitter = delay * config.jitter * (Math.random() * 2 - 1);
    return Math.max(0, Math.floor(delay + jitter));
  }

  /**
   * Check if error is a rate limit error (HTTP 429)
   */
  private isRateLimitError(error: unknown): boolean {
    // Type guard for error objects
    if (!error || typeof error !== 'object') {
      return false;
    }

    const err = error as Record<string, unknown>;

    // Check error name property (for test objects)
    if (err.name === 'RateLimitError') {
      return true;
    }

    // Check HTTP status codes
    if (err.status === 429 || err.statusCode === 429) {
      return true;
    }

    // Check error message
    if (typeof err.message === 'string') {
      return err.message.includes('429') || err.message.toLowerCase().includes('rate limit');
    }

    return false;
  }

  /**
   * Record request outcome for degraded mode detection
   */
  private recordOutcome(outcome: 'success' | 'rate_limited' | 'failed', duration: number): void {
    this.state.recentOutcomes.push(outcome);

    // Keep only recent outcomes
    if (this.state.recentOutcomes.length > DEGRADED_MODE_CONFIG.SAMPLE_SIZE) {
      this.state.recentOutcomes.shift();
    }

    // Update stats
    this.state.stats.totalRequests++;
    const totalDuration =
      this.state.stats.averageRequestDuration * (this.state.stats.totalRequests - 1) + duration;
    this.state.stats.averageRequestDuration = totalDuration / this.state.stats.totalRequests;
  }

  /**
   * Check if degraded mode should be activated
   */
  private checkDegradedMode(): void {
    if (this.state.recentOutcomes.length < DEGRADED_MODE_CONFIG.SAMPLE_SIZE) {
      return; // Not enough data
    }

    const rateLimitedCount = this.state.recentOutcomes.filter((o) => o === 'rate_limited').length;
    const rateLimitedPercentage = rateLimitedCount / this.state.recentOutcomes.length;

    if (
      !this.state.degradedMode &&
      rateLimitedPercentage >= DEGRADED_MODE_CONFIG.ACTIVATION_THRESHOLD
    ) {
      this.enterDegradedMode();
    } else if (
      this.state.degradedMode &&
      rateLimitedPercentage < DEGRADED_MODE_CONFIG.EXIT_THRESHOLD
    ) {
      this.exitDegradedMode();
    }
  }

  /**
   * Enter degraded mode: reduce concurrency
   */
  private enterDegradedMode(): void {
    if (this.state.degradedMode) return;

    console.warn('[Rate Governor] Entering degraded mode (sustained rate limiting detected)');

    this.state.degradedMode = true;
    this.state.lastDegradedModeAt = new Date();
    this.state.stats.degradedModeActivations++;

    // Reduce concurrency
    this.state.maxConcurrency = Math.max(
      1,
      Math.floor(this.state.normalConcurrency / DEGRADED_MODE_CONFIG.CONCURRENCY_REDUCTION_FACTOR)
    );

    console.log(
      `[Rate Governor] Reduced concurrency from ${this.state.normalConcurrency} to ${this.state.maxConcurrency}`
    );
  }

  /**
   * Exit degraded mode: restore normal concurrency
   */
  private exitDegradedMode(): void {
    if (!this.state.degradedMode) return;

    // Check minimum degraded mode duration
    const degradedDuration = Date.now() - (this.state.lastDegradedModeAt?.getTime() || 0);
    if (degradedDuration < DEGRADED_MODE_CONFIG.MIN_DEGRADED_DURATION) {
      return; // Too soon to exit
    }

    console.log('[Rate Governor] Exiting degraded mode (rate limiting subsided)');

    this.state.stats.degradedModeTime += degradedDuration;
    this.state.degradedMode = false;
    this.state.maxConcurrency = this.state.normalConcurrency;

    console.log(`[Rate Governor] Restored concurrency to ${this.state.maxConcurrency}`);

    // Process queue with restored concurrency
    this.processQueue();
  }

  /**
   * Sort queue by priority (higher priority first)
   */
  private sortQueue(): void {
    this.state.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get current state (for debugging)
   */
  getState(): RateLimitState {
    return { ...this.state };
  }

  /**
   * Get statistics
   */
  getStats(): RateLimitStats {
    return { ...this.state.stats };
  }

  getMaxConcurrency(): number {
    return this.state.maxConcurrency;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.state.queue.length;
  }

  /**
   * Get current concurrency
   */
  getCurrentConcurrency(): number {
    return this.state.currentConcurrency;
  }

  /**
   * Check if in degraded mode
   */
  isInDegradedMode(): boolean {
    return this.state.degradedMode;
  }
}
