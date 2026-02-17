/**
 * Integration tests for job ownership validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JobManager } from '../../utils/job-manager';
import type { JobConfiguration } from '../../types/job';

describe('Job Ownership Validation', () => {
  beforeEach(() => {
    JobManager.clearAllJobs();
  });

  describe('Job Creation with userId', () => {
    it('should create job with userId attached', () => {
      const jobConfig: JobConfiguration = {
        apiKey: 'sk-test-key',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
        userId: 'user-123',
        shouldTrackQuota: true,
      };

      const job = JobManager.createJob(jobConfig, {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      expect(job.userId).toBe('user-123');
      expect(job.config.userId).toBe('user-123');
      expect(job.config.shouldTrackQuota).toBe(true);
    });

    it('should create job without userId for backward compatibility', () => {
      const jobConfig: JobConfiguration = {
        apiKey: 'sk-test-key',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
      };

      const job = JobManager.createJob(jobConfig, {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      expect(job.userId).toBeUndefined();
      expect(job.config.userId).toBeUndefined();
    });
  });

  describe('validateOwnership()', () => {
    it('should validate that user owns their job', () => {
      const jobConfig: JobConfiguration = {
        apiKey: 'sk-test-key',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
        userId: 'user-123',
      };

      const job = JobManager.createJob(jobConfig, {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      const isOwner = JobManager.validateOwnership(job.jobId, 'user-123');
      expect(isOwner).toBe(true);
    });

    it('should reject access to jobs owned by other users', () => {
      const jobConfig: JobConfiguration = {
        apiKey: 'sk-test-key',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
        userId: 'user-123',
      };

      const job = JobManager.createJob(jobConfig, {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      const isOwner = JobManager.validateOwnership(job.jobId, 'user-456');
      expect(isOwner).toBe(false);
    });

    it('should return false for non-existent jobs', () => {
      const isOwner = JobManager.validateOwnership('non-existent-job', 'user-123');
      expect(isOwner).toBe(false);
    });

    it('should allow access to jobs without userId (backward compatibility)', () => {
      const jobConfig: JobConfiguration = {
        apiKey: 'sk-test-key',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
      };

      const job = JobManager.createJob(jobConfig, {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      // Jobs without userId should allow access from any user
      const isOwner = JobManager.validateOwnership(job.jobId, 'any-user');
      expect(isOwner).toBe(true);
    });
  });

  describe('Multiple Users', () => {
    it('should isolate jobs between different users', () => {
      // Create job for user 1
      const job1Config: JobConfiguration = {
        apiKey: 'sk-test-key-1',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
        userId: 'user-1',
      };

      const job1 = JobManager.createJob(job1Config, {
        filename: 'user1.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      // Create job for user 2
      const job2Config: JobConfiguration = {
        apiKey: 'sk-test-key-2',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
        userId: 'user-2',
      };

      const job2 = JobManager.createJob(job2Config, {
        filename: 'user2.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      // User 1 can access their job, not user 2's
      expect(JobManager.validateOwnership(job1.jobId, 'user-1')).toBe(true);
      expect(JobManager.validateOwnership(job2.jobId, 'user-1')).toBe(false);

      // User 2 can access their job, not user 1's
      expect(JobManager.validateOwnership(job2.jobId, 'user-2')).toBe(true);
      expect(JobManager.validateOwnership(job1.jobId, 'user-2')).toBe(false);
    });
  });

  describe('Usage Tracking Mode', () => {
    it('should track shouldTrackQuota flag for paid users with platform key', () => {
      const jobConfig: JobConfiguration = {
        apiKey: process.env.OPENAI_API_KEY || 'platform-key',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
        userId: 'pro-user-123',
        shouldTrackQuota: true,
      };

      const job = JobManager.createJob(jobConfig, {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      expect(job.config.shouldTrackQuota).toBe(true);
    });

    it('should track shouldTrackQuota=false for users with own API key', () => {
      const jobConfig: JobConfiguration = {
        apiKey: 'sk-user-provided-key',
        mode: 'balanced',
        model: 'whisper-1',
        prompt: 'Test prompt',
        userId: 'user-123',
        shouldTrackQuota: false,
      };

      const job = JobManager.createJob(jobConfig, {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 120,
        totalChunks: 0,
      });

      expect(job.config.shouldTrackQuota).toBe(false);
    });
  });
});
