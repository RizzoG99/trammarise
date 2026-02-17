/**
 * Unit Tests: Job Manager
 *
 * Tests for transcription job lifecycle management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JobManager } from '../job-manager';
import { setupMockChunks } from '../__test-helpers__/test-fixtures';
import type { JobConfiguration } from '../../types/job';
import { JOB_SAFEGUARDS } from '../../types/job';

describe('Job Manager', () => {
  beforeEach(() => {
    // Clear all jobs before each test
    JobManager.clearAllJobs();
  });

  afterEach(() => {
    JobManager.clearAllJobs();
  });

  describe('createJob()', () => {
    it('should create a job with correct initial state', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024 * 1024,
        duration: 600,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);

      expect(job.jobId).toBeDefined();
      expect(job.jobId).toMatch(/^[a-f0-9-]{36}$/); // UUID format
      expect(job.status).toBe('pending');
      expect(job.config).toEqual(config);
      expect(job.metadata.filename).toBe('test.mp3');
      expect(job.metadata.duration).toBe(600);
      expect(job.metadata.createdAt).toBeInstanceOf(Date);
      expect(job.chunks).toEqual([]);
      expect(job.chunkStatuses).toEqual([]);
      expect(job.progress).toBe(0);
      expect(job.completedChunks).toBe(0);
      expect(job.totalRetries).toBe(0);
      expect(job.chunkingSplits).toBe(0);
    });

    it('should generate unique job IDs', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job1 = JobManager.createJob(config, metadata);
      const job2 = JobManager.createJob(config, metadata);

      expect(job1.jobId).not.toBe(job2.jobId);
    });

    it('should store job in memory', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);

      const retrieved = JobManager.getJob(job.jobId);
      expect(retrieved).toEqual(job);
    });
  });

  describe('initializeChunks()', () => {
    it('should initialize chunks and statuses', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 600,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      const chunks = setupMockChunks(4, 'balanced');

      JobManager.initializeChunks(job.jobId, chunks);

      const updated = JobManager.getJob(job.jobId)!;
      expect(updated.chunks).toHaveLength(4);
      expect(updated.chunkStatuses).toHaveLength(4);
      expect(updated.metadata.totalChunks).toBe(4);

      // All statuses should be pending initially
      updated.chunkStatuses.forEach((status) => {
        expect(status.status).toBe('pending');
        expect(status.retryCount).toBe(0);
        expect(status.wasSplit).toBe(false);
      });
    });

    it('should throw if job not found', () => {
      const chunks = setupMockChunks(2, 'balanced');

      expect(() => {
        JobManager.initializeChunks('non-existent-id', chunks);
      }).toThrow('Job non-existent-id not found');
    });
  });

  describe('updateJobStatus()', () => {
    it('should update job status', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      const originalTime = job.lastUpdated.getTime();

      // Advance system time by 100ms
      vi.setSystemTime(Date.now() + 100);

      JobManager.updateJobStatus(job.jobId, 'transcribing');

      const updated = JobManager.getJob(job.jobId)!;
      expect(updated.status).toBe('transcribing');
      expect(updated.lastUpdated.getTime()).toBeGreaterThan(originalTime);
    });

    it('should set error message when provided', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);

      JobManager.updateJobStatus(job.jobId, 'failed', 'Test error');

      const updated = JobManager.getJob(job.jobId)!;
      expect(updated.status).toBe('failed');
      expect(updated.error).toBe('Test error');
    });

    it('should set completedAt for terminal states', () => {
      vi.useFakeTimers();
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);

      // Advance time to simulate processing
      vi.advanceTimersByTime(1000);

      JobManager.updateJobStatus(job.jobId, 'completed');

      const updated = JobManager.getJob(job.jobId)!;
      expect(updated.metadata.completedAt).toBeInstanceOf(Date);
      expect(updated.metadata.processingTime).toBeGreaterThan(0);
    });

    it('should calculate processing time for terminal states', () => {
      vi.useFakeTimers();
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);

      // Advance time
      vi.advanceTimersByTime(5000);

      JobManager.updateJobStatus(job.jobId, 'completed');

      const updated = JobManager.getJob(job.jobId)!;
      expect(updated.metadata.processingTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updateChunkStatus()', () => {
    it('should update chunk status', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 600,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      const chunks = setupMockChunks(3, 'balanced');
      JobManager.initializeChunks(job.jobId, chunks);

      JobManager.updateChunkStatus(job.jobId, 1, {
        status: 'completed',
        transcript: 'Test transcript',
      });

      const updated = JobManager.getJob(job.jobId)!;
      expect(updated.chunkStatuses[1].status).toBe('completed');
      expect(updated.chunkStatuses[1].transcript).toBe('Test transcript');
    });

    it('should update progress when chunks complete', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 600,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      const chunks = setupMockChunks(4, 'balanced');
      JobManager.initializeChunks(job.jobId, chunks);

      // Complete 2 out of 4 chunks
      JobManager.updateChunkStatus(job.jobId, 0, { status: 'completed' });
      JobManager.updateChunkStatus(job.jobId, 2, { status: 'completed' });

      const updated = JobManager.getJob(job.jobId)!;
      expect(updated.completedChunks).toBe(2);
      expect(updated.progress).toBe(50); // 2/4 = 50%
    });

    it('should throw for invalid chunk index', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 600,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      const chunks = setupMockChunks(2, 'balanced');
      JobManager.initializeChunks(job.jobId, chunks);

      expect(() => {
        JobManager.updateChunkStatus(job.jobId, 5, { status: 'completed' });
      }).toThrow('Invalid chunk index 5');
    });
  });

  describe('getJobStatusResponse()', () => {
    it('should return formatted status response', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 600,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      const chunks = setupMockChunks(4, 'balanced');
      JobManager.initializeChunks(job.jobId, chunks);

      JobManager.updateChunkStatus(job.jobId, 0, { status: 'completed' });
      JobManager.updateChunkStatus(job.jobId, 1, { status: 'completed' });

      const response = JobManager.getJobStatusResponse(job.jobId);

      expect(response).toBeDefined();
      expect(response!.jobId).toBe(job.jobId);
      expect(response!.status).toBe('pending');
      expect(response!.progress).toBe(50);
      expect(response!.completedChunks).toBe(2);
      expect(response!.totalChunks).toBe(4);
      expect(response!.metadata.filename).toBe('test.mp3');
      expect(response!.metadata.mode).toBe('balanced');
    });

    it('should include transcript when available', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      JobManager.setJobTranscript(job.jobId, 'Final transcript');

      const response = JobManager.getJobStatusResponse(job.jobId);

      expect(response!.transcript).toBe('Final transcript');
    });

    it('should include error when job failed', () => {
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      JobManager.updateJobStatus(job.jobId, 'failed', 'Test error');

      const response = JobManager.getJobStatusResponse(job.jobId);

      expect(response!.error).toBe('Test error');
    });

    it('should calculate estimated time remaining', () => {
      vi.useFakeTimers();
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 600,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);
      const chunks = setupMockChunks(4, 'balanced');
      JobManager.initializeChunks(job.jobId, chunks);

      // Set status to transcribing
      JobManager.updateJobStatus(job.jobId, 'transcribing');

      // Advance time by 10 seconds
      vi.advanceTimersByTime(10000);

      // Complete 1 chunk
      JobManager.updateChunkStatus(job.jobId, 0, { status: 'completed' });

      const response = JobManager.getJobStatusResponse(job.jobId);

      // Should have estimated time remaining
      // 1 chunk took ~10s, 3 remaining = ~30s
      expect(response!.estimatedTimeRemaining).toBeGreaterThan(0);
    });

    it('should return null for non-existent job', () => {
      const response = JobManager.getJobStatusResponse('non-existent-id');
      expect(response).toBeNull();
    });
  });

  describe('cleanup()', () => {
    it('should remove jobs older than MAX_JOB_AGE', () => {
      vi.useFakeTimers();
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);

      // Manually update the job's creation time to be old
      const oldJob = JobManager.getJob(job.jobId)!;
      oldJob.metadata.createdAt = new Date(Date.now() - JOB_SAFEGUARDS.MAX_JOB_AGE - 1000);

      // Restart cleanup interval with fake timers
      JobManager.restartCleanup();

      // Advance time to trigger cleanup interval
      vi.advanceTimersByTime(JOB_SAFEGUARDS.CLEANUP_INTERVAL);

      // Run only the pending timers (not all timers recursively)
      vi.runOnlyPendingTimers();

      // Job should be deleted
      const retrieved = JobManager.getJob(job.jobId);
      expect(retrieved).toBeUndefined();
    });

    it('should not remove recent jobs', () => {
      vi.useFakeTimers();
      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job = JobManager.createJob(config, metadata);

      // Advance time but stay within MAX_JOB_AGE
      vi.advanceTimersByTime(60 * 60 * 1000); // 1 hour

      // Trigger cleanup
      vi.advanceTimersByTime(JOB_SAFEGUARDS.CLEANUP_INTERVAL);

      // Job should still exist
      const retrieved = JobManager.getJob(job.jobId);
      expect(retrieved).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle getting non-existent job', () => {
      const job = JobManager.getJob('non-existent-id');
      expect(job).toBeUndefined();
    });

    it('should handle deleting non-existent job', () => {
      // Should not throw
      expect(() => {
        JobManager.deleteJob('non-existent-id');
      }).not.toThrow();
    });

    it('should track job count correctly', () => {
      expect(JobManager.getJobCount()).toBe(0);

      const config: JobConfiguration = {
        apiKey: 'test-key',
        mode: 'balanced',
        model: 'whisper-1',
      };

      const metadata = {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 100,
        totalChunks: 0,
      };

      const job1 = JobManager.createJob(config, metadata);
      expect(JobManager.getJobCount()).toBe(1);

      JobManager.createJob(config, metadata);
      expect(JobManager.getJobCount()).toBe(2);

      JobManager.deleteJob(job1.jobId);
      expect(JobManager.getJobCount()).toBe(1);
    });
  });
});
