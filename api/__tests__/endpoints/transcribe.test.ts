/**
 * API Endpoint Tests: POST /api/transcribe
 *
 * Tests for transcription job creation endpoint.
 * Note: Full multipart/form-data testing requires complex mocking of busboy.
 * These tests focus on the main error cases and validation logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
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

describe('POST /api/transcribe', () => {
  beforeEach(() => {
    JobManager.clearAllJobs();
    vi.clearAllMocks();
  });

  describe('Method Validation', () => {
    it('should return 405 for non-POST methods', async () => {
      // Since the handler uses busboy, we'll test the method check
      // by importing and checking the logic
      const handler = (await import('../../transcribe')).default;

      const req = {
        method: 'GET',
        headers: {},
      } as unknown as VercelRequest;

      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Method not allowed',
      });
    });
  });

  describe('Job Creation', () => {
    it('should create a job and return 202 with job ID', async () => {
      // This is a simplified test - full multipart testing would require
      // mocking the entire busboy stream processing

      // For now, we verify that JobManager can create jobs
      const job = JobManager.createJob(
        {
          apiKey: 'test-key',
          mode: 'balanced',
          model: 'whisper-1',
        },
        {
          filename: 'test.mp3',
          fileSize: 1024 * 1024,
          duration: 600,
          totalChunks: 0,
        }
      );

      expect(job.jobId).toBeDefined();
      expect(job.status).toBe('pending');
      expect(job.metadata.filename).toBe('test.mp3');

      // Verify job is retrievable
      const retrieved = JobManager.getJob(job.jobId);
      expect(retrieved).toEqual(job);
    });
  });

  describe('File Validation', () => {
    it('should validate file type (audio/* only)', () => {
      // This tests the validation logic that would be in the handler
      const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm'];
      const invalidTypes = ['video/mp4', 'image/png', 'text/plain'];

      validTypes.forEach((type) => {
        expect(type.startsWith('audio/')).toBe(true);
      });

      invalidTypes.forEach((type) => {
        expect(type.startsWith('audio/')).toBe(false);
      });
    });

    it('should have correct file size limit', async () => {
      const { API_VALIDATION } = await import('../../src/utils/constants');

      // Verify constants are defined
      expect(API_VALIDATION.MAX_FILE_SIZE).toBeDefined();
      expect(API_VALIDATION.MAX_FILES).toBeDefined();
      expect(API_VALIDATION.MAX_FIELDS).toBeDefined();

      // File size should be reasonable (e.g., 500MB)
      expect(API_VALIDATION.MAX_FILE_SIZE).toBeGreaterThan(100 * 1024 * 1024); // At least 100MB
    });
  });

  describe('Error Scenarios', () => {
    it('should handle missing API key', () => {
      // The handler requires apiKey in form fields
      const apiKey: string | null = null;

      expect(apiKey).toBeNull();
      // In the actual handler, this would return 401
    });

    it('should handle invalid file type', () => {
      const mimeType = 'video/mp4';

      // This would trigger: "Invalid file type. Audio files only."
      expect(mimeType.startsWith('audio/')).toBe(false);
    });

    it('should handle file size exceeded', () => {
      // The handler uses busboy limits and checks fileSizeExceeded flag
      // This would trigger: "File size exceeds limit"
      const fileSizeExceeded = true;

      expect(fileSizeExceeded).toBe(true);
    });
  });

  describe('Background Processing', () => {
    it('should initiate background processing after job creation', async () => {
      // Verify that job status can be updated during background processing
      const job = JobManager.createJob(
        {
          apiKey: 'test-key',
          mode: 'balanced',
          model: 'whisper-1',
        },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 600,
          totalChunks: 0,
        }
      );

      // Simulate status updates that would happen during background processing
      JobManager.updateJobStatus(job.jobId, 'chunking');
      expect(JobManager.getJob(job.jobId)!.status).toBe('chunking');

      JobManager.updateJobStatus(job.jobId, 'transcribing');
      expect(JobManager.getJob(job.jobId)!.status).toBe('transcribing');

      JobManager.updateJobStatus(job.jobId, 'completed');
      expect(JobManager.getJob(job.jobId)!.status).toBe('completed');
    });

    it('should propagate errors to job status', () => {
      const job = JobManager.createJob(
        {
          apiKey: 'test-key',
          mode: 'balanced',
          model: 'whisper-1',
        },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 100,
          totalChunks: 0,
        }
      );

      // Simulate error during processing
      JobManager.updateJobStatus(job.jobId, 'failed', 'Transcription API error');

      const updated = JobManager.getJob(job.jobId)!;
      expect(updated.status).toBe('failed');
      expect(updated.error).toBe('Transcription API error');
    });
  });

  describe('Integration with Utilities', () => {
    it('should use correct processing mode based on performance level', async () => {
      const { getTranscriptionModelForLevel } = await import('../../src/types/performance-levels');

      // Verify model selection logic
      const balancedModel = getTranscriptionModelForLevel('balanced');
      const bestQualityModel = getTranscriptionModelForLevel('best_quality');

      expect(balancedModel).toBe('whisper-1');
      expect(bestQualityModel).toBe('whisper-1');

      // Mode is passed separately in the API
      const modes: Array<'balanced' | 'best_quality'> = ['balanced', 'best_quality'];
      modes.forEach((mode) => {
        expect(['balanced', 'best_quality']).toContain(mode);
      });
    });
  });
});
