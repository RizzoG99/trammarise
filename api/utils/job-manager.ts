/**
 * Job Manager
 *
 * Singleton manager for transcription jobs with:
 * - Job creation and tracking
 * - In-memory storage (MVP, migrate to Vercel KV later)
 * - Job cleanup (remove old jobs)
 * - Status updates
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  TranscriptionJob,
  JobConfiguration,
  JobMetadata,
  ChunkStatus,
  JobStatus,
  JobStatusResponse,
} from '../types/job';
import type { ChunkMetadata } from '../types/chunking';
import type { Utterance } from '../types/provider';
import { JOB_SAFEGUARDS } from '../types/job';

/**
 * Singleton Job Manager
 */
class JobManagerClass {
  private jobs: Map<string, TranscriptionJob> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Create a new transcription job
   */
  createJob(config: JobConfiguration, metadata: Omit<JobMetadata, 'createdAt'>): TranscriptionJob {
    const jobId = uuidv4();

    const job: TranscriptionJob = {
      jobId,
      status: 'pending',
      config,
      metadata: {
        ...metadata,
        createdAt: new Date(),
      },
      chunks: [],
      chunkStatuses: [],
      progress: 0,
      completedChunks: 0,
      totalRetries: 0,
      chunkingSplits: 0,
      lastUpdated: new Date(),
    };

    this.jobs.set(jobId, job);

    console.log(
      `[Job Manager] Created job ${jobId} (mode: ${config.mode}, duration: ${metadata.duration.toFixed(2)}s)`
    );

    return job;
  }

  /**
   * Initialize chunks for a job
   */
  initializeChunks(jobId: string, chunks: ChunkMetadata[]): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.chunks = chunks;
    job.metadata.totalChunks = chunks.length;

    // Initialize chunk statuses
    job.chunkStatuses = chunks.map(() => ({
      status: 'pending',
      retryCount: 0,
      wasSplit: false,
      lastUpdated: new Date(),
    }));

    job.lastUpdated = new Date();

    console.log(`[Job Manager] Initialized ${chunks.length} chunks for job ${jobId}`);
  }

  /**
   * Get a job by ID
   */
  getJob(jobId: string): TranscriptionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Update job status
   */
  updateJobStatus(jobId: string, status: JobStatus, error?: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.status = status;
    job.lastUpdated = new Date();

    if (error) {
      job.error = error;
    }

    if (status === 'completed' || status === 'failed') {
      job.metadata.completedAt = new Date();
      job.metadata.processingTime =
        job.metadata.completedAt.getTime() - job.metadata.createdAt.getTime();

      console.log(
        `[Job Manager] Job ${jobId} ${status} (processing time: ${(job.metadata.processingTime / 1000).toFixed(2)}s)`
      );
    }
  }

  /**
   * Update chunk status
   */
  updateChunkStatus(jobId: string, chunkIndex: number, updates: Partial<ChunkStatus>): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (chunkIndex < 0 || chunkIndex >= job.chunkStatuses.length) {
      throw new Error(`Invalid chunk index ${chunkIndex} for job ${jobId}`);
    }

    const chunkStatus = job.chunkStatuses[chunkIndex];
    Object.assign(chunkStatus, updates);
    chunkStatus.lastUpdated = new Date();

    // Update overall progress
    job.completedChunks = job.chunkStatuses.filter((cs) => cs.status === 'completed').length;
    job.progress = Math.floor((job.completedChunks / job.metadata.totalChunks) * 100);

    job.lastUpdated = new Date();
  }

  /**
   * Set job transcript
   */
  setJobTranscript(jobId: string, transcript: string): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.transcript = transcript;
    job.lastUpdated = new Date();
  }

  /**
   * Set job utterances (for speaker diarization)
   */
  setJobUtterances(jobId: string, utterances: Utterance[]): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.utterances = utterances;
    job.lastUpdated = new Date();
  }

  /**
   * Delete a job
   */
  deleteJob(jobId: string): void {
    this.jobs.delete(jobId);
    console.log(`[Job Manager] Deleted job ${jobId}`);
  }

  /**
   * Get all jobs (for debugging)
   */
  getAllJobs(): TranscriptionJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get job status response for API
   */
  getJobStatusResponse(jobId: string): JobStatusResponse | null {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }

    const response: JobStatusResponse = {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      completedChunks: job.completedChunks,
      totalChunks: job.metadata.totalChunks,
      metadata: {
        filename: job.metadata.filename,
        duration: job.metadata.duration,
        mode: job.config.mode,
        createdAt: job.metadata.createdAt,
        completedAt: job.metadata.completedAt,
      },
    };

    if (job.transcript) {
      response.transcript = job.transcript;
    }

    if (job.utterances) {
      response.utterances = job.utterances;
    }

    if (job.error) {
      response.error = job.error;
    }

    // Estimate time remaining (rough estimate)
    if (job.status === 'transcribing' && job.completedChunks > 0) {
      const elapsed = Date.now() - job.metadata.createdAt.getTime();
      const avgTimePerChunk = elapsed / job.completedChunks;
      const remainingChunks = job.metadata.totalChunks - job.completedChunks;
      response.estimatedTimeRemaining = Math.ceil((avgTimePerChunk * remainingChunks) / 1000);
    }

    return response;
  }

  /**
   * Start cleanup interval to remove old jobs
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, JOB_SAFEGUARDS.CLEANUP_INTERVAL);
  }

  /**
   * Clean up old jobs
   */
  private cleanup(): void {
    const now = Date.now();
    const jobsToDelete: string[] = [];

    for (const [jobId, job] of this.jobs.entries()) {
      const age = now - job.metadata.createdAt.getTime();

      // Delete jobs older than MAX_JOB_AGE
      if (age > JOB_SAFEGUARDS.MAX_JOB_AGE) {
        jobsToDelete.push(jobId);
      }
    }

    if (jobsToDelete.length > 0) {
      console.log(`[Job Manager] Cleaning up ${jobsToDelete.length} old jobs`);

      for (const jobId of jobsToDelete) {
        this.deleteJob(jobId);
      }
    }
  }

  /**
   * Stop cleanup interval (for testing)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Restart cleanup interval (for testing - needed when switching timer modes)
   */
  restartCleanup(): void {
    this.stopCleanup();
    this.startCleanup();
  }

  /**
   * Clear all jobs (for testing)
   */
  clearAllJobs(): void {
    this.jobs.clear();
  }

  /**
   * Get job count
   */
  getJobCount(): number {
    return this.jobs.size;
  }
}

// Export singleton instance
export const JobManager = new JobManagerClass();
