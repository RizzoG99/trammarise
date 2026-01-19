/**
 * API Endpoint Tests: GET /api/transcribe-job/[jobId]/status
 *
 * Tests for job status retrieval endpoint.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../../transcribe-job/[jobId]/status';
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

describe('GET /api/transcribe-job/[jobId]/status', () => {
  beforeEach(() => {
    JobManager.clearAllJobs();
  });

  describe('Success Cases', () => {
    it('should return 200 with job status for valid job ID', async () => {
      // Create a job
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024 * 1024,
          duration: 600,
          totalChunks: 0,
        }
      );

      const req = {
        method: 'GET',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: job.jobId,
          status: 'pending',
          progress: 0,
          completedChunks: 0,
          totalChunks: 0,
          metadata: expect.objectContaining({
            filename: 'test.mp3',
            duration: 600,
            mode: 'balanced',
          }),
        })
      );
    });

    it('should include transcript when job is completed', async () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 100,
          totalChunks: 0,
        }
      );

      // Set transcript and mark as completed
      JobManager.setJobTranscript(job.jobId, 'Final transcript text');
      JobManager.updateJobStatus(job.jobId, 'completed');

      const req = {
        method: 'GET',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: job.jobId,
          status: 'completed',
          transcript: 'Final transcript text',
        })
      );
    });

    it('should include error message when job failed', async () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 100,
          totalChunks: 0,
        }
      );

      JobManager.updateJobStatus(job.jobId, 'failed', 'Transcription error occurred');

      const req = {
        method: 'GET',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: job.jobId,
          status: 'failed',
          error: 'Transcription error occurred',
        })
      );
    });

    it('should include estimated time remaining for in-progress jobs', async () => {
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
        { index: 0, startTime: 0, duration: 180, filePath: '/tmp/chunk_0.mp3', hash: 'hash1' },
        { index: 1, startTime: 180, duration: 180, filePath: '/tmp/chunk_1.mp3', hash: 'hash2' },
        { index: 2, startTime: 360, duration: 180, filePath: '/tmp/chunk_2.mp3', hash: 'hash3' },
        { index: 3, startTime: 540, duration: 60, filePath: '/tmp/chunk_3.mp3', hash: 'hash4' },
      ];

      JobManager.initializeChunks(job.jobId, chunks);
      JobManager.updateJobStatus(job.jobId, 'transcribing');

      // Complete one chunk
      JobManager.updateChunkStatus(job.jobId, 0, { status: 'completed' });

      // Advance time
      vi.advanceTimersByTime(5000);

      const req = {
        method: 'GET',
        query: { jobId: job.jobId },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const callArgs = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callArgs.status).toBe('transcribing');
      expect(callArgs.estimatedTimeRemaining).toBeDefined();
    });
  });

  describe('Error Cases', () => {
    it('should return 404 for non-existent job ID', async () => {
      const req = {
        method: 'GET',
        query: { jobId: 'non-existent-id-12345' },
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
        method: 'GET',
        query: {},
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing or invalid job ID',
      });
    });

    it('should return 400 for invalid job ID type', async () => {
      const req = {
        method: 'GET',
        query: { jobId: ['array', 'of', 'values'] },
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing or invalid job ID',
      });
    });

    it('should return 405 for non-GET methods', async () => {
      const req = {
        method: 'POST',
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
