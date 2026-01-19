/**
 * API Endpoint Tests: POST /api/transcribe-job/[jobId]/cancel
 *
 * Tests for job cancellation endpoint.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../../transcribe-job/[jobId]/cancel';
import { JobManager } from '../../utils/job-manager';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock response object
function createMockResponse(): VercelResponse {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as VercelResponse;
  return res;
}

// Mock cleanupChunks
vi.mock('../../utils/audio-chunker', async () => {
  const actual = await vi.importActual('../../utils/audio-chunker');
  return {
    ...actual,
    cleanupChunks: vi.fn().mockResolvedValue(undefined),
  };
});

describe('POST /api/transcribe-job/[jobId]/cancel', () => {
  beforeEach(() => {
    JobManager.clearAllJobs();
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return 200 and cancel pending job', async () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 600,
          totalChunks: 0,
        }
      );

      const req = {
        method: 'POST',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        jobId: job.jobId,
        message: 'Job cancelled successfully',
      });

      // Verify job status was updated
      const updatedJob = JobManager.getJob(job.jobId);
      expect(updatedJob!.status).toBe('cancelled');
    });

    it('should cancel transcribing job and cleanup chunks', async () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 600,
          totalChunks: 0,
        }
      );

      // Initialize chunks
      const chunks = [
        {
          index: 0,
          startTime: 0,
          endTime: 180,
          duration: 180,
          filePath: '/tmp/chunk_0.mp3',
          hash: 'hash1',
          hasOverlap: false,
        },
        {
          index: 1,
          startTime: 180,
          endTime: 360,
          duration: 180,
          filePath: '/tmp/chunk_1.mp3',
          hash: 'hash2',
          hasOverlap: false,
        },
      ];

      JobManager.initializeChunks(job.jobId, chunks);
      JobManager.updateJobStatus(job.jobId, 'transcribing');

      const req = {
        method: 'POST',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      // Verify cleanup was called
      const { cleanupChunks } = await import('../../utils/audio-chunker');
      expect(cleanupChunks).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ filePath: '/tmp/chunk_0.mp3' }),
          expect.objectContaining({ filePath: '/tmp/chunk_1.mp3' }),
        ])
      );
    });

    it('should handle cleanup failure gracefully', async () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 600,
          totalChunks: 0,
        }
      );

      const chunks = [
        {
          index: 0,
          startTime: 0,
          endTime: 180,
          duration: 180,
          filePath: '/tmp/chunk_0.mp3',
          hash: 'hash1',
          hasOverlap: false,
        },
      ];

      JobManager.initializeChunks(job.jobId, chunks);

      // Mock cleanup to fail
      const { cleanupChunks } = await import('../../utils/audio-chunker');
      vi.mocked(cleanupChunks).mockRejectedValueOnce(new Error('Cleanup failed'));

      const req = {
        method: 'POST',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      // Should still succeed even if cleanup fails
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Error Cases', () => {
    it('should return 400 when trying to cancel completed job', async () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 100,
          totalChunks: 0,
        }
      );

      JobManager.updateJobStatus(job.jobId, 'completed');

      const req = {
        method: 'POST',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cannot cancel job with status: completed',
      });
    });

    it('should return 400 when trying to cancel failed job', async () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 100,
          totalChunks: 0,
        }
      );

      JobManager.updateJobStatus(job.jobId, 'failed', 'Error occurred');

      const req = {
        method: 'POST',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cannot cancel job with status: failed',
      });
    });

    it('should return 404 for non-existent job ID', async () => {
      const req = {
        method: 'POST',
        query: { jobId: 'non-existent-id' },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Job not found',
      });
    });

    it('should return 400 for missing job ID', async () => {
      const req = {
        method: 'POST',
        query: {},
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing or invalid job ID',
      });
    });

    it('should return 405 for non-POST methods', async () => {
      const req = {
        method: 'GET',
        query: { jobId: 'some-id' },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Method not allowed',
      });
    });
  });
});
