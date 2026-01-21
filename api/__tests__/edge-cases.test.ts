/**
 * Edge Cases Tests
 *
 * Tests for unusual scenarios, error conditions, and boundary cases.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JobManager } from '../utils/job-manager';
import { chunkAudio, cleanupChunks, computeChunkHash } from '../utils/audio-chunker';
import { processChunk } from '../utils/chunk-processor';
import { assembleTranscript } from '../utils/transcript-assembler';
import { RateLimitGovernor } from '../utils/rate-limit-governor';
import { generateMockAudio } from '../utils/__test-helpers__/mock-audio-generator';
import { createTestJob, createTestChunk } from '../utils/__test-helpers__/test-fixtures';
import { JOB_SAFEGUARDS } from '../types/job';
import type { MockFluentFFmpegModule } from '../utils/__test-helpers__/types';

describe('Edge Cases', () => {
  beforeEach(() => {
    JobManager.clearAllJobs();
  });

  describe('Empty Audio File', () => {
    it('should handle 0 duration audio gracefully', async () => {
      const audioBuffer = Buffer.from('');
      const mockFFmpeg = ((await import('fluent-ffmpeg')) as MockFluentFFmpegModule).default;
      mockFFmpeg.ffprobe = vi.fn((path, callback) => {
        callback(null, { format: { duration: 0 } });
      });

      const result = await chunkAudio(audioBuffer, 'empty.mp3', 'balanced');

      expect(result.totalChunks).toBe(0);
      expect(result.chunks).toHaveLength(0);
      expect(result.totalDuration).toBe(0);
    });

    it('should return empty transcript for empty audio', async () => {
      const result = await assembleTranscript([], [], 'balanced');
      expect(result).toBe('');
    });
  });

  describe('Job Cancellation During Auto-Split', () => {
    it('should abort auto-split when job is cancelled', async () => {
      const job = createTestJob({ mode: 'balanced', status: 'transcribing' });
      const chunk = createTestChunk(0, { duration: 180 });
      job.chunks = [chunk];
      job.chunkStatuses = [
        { status: 'pending', retryCount: 0, wasSplit: false, lastUpdated: new Date() },
      ];

      const governor = new RateLimitGovernor('balanced');

      // Mock to always fail to trigger auto-split
      const mockTranscribe = vi.fn(async () => {
        throw new Error('Fail');
      });

      // Cancel job immediately
      job.status = 'cancelled';

      await expect(processChunk(chunk, job, governor, mockTranscribe)).rejects.toThrow(/cancelled/);
    });
  });

  describe('Job Cleanup After 2 Hours', () => {
    it('should automatically delete jobs older than 2 hours', async () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 100,
          totalChunks: 0,
        }
      );

      // Advance time beyond MAX_JOB_AGE
      vi.advanceTimersByTime(JOB_SAFEGUARDS.MAX_JOB_AGE + 1000);

      // Trigger cleanup interval
      vi.advanceTimersByTime(JOB_SAFEGUARDS.CLEANUP_INTERVAL);

      // Job should be deleted
      const retrieved = JobManager.getJob(job.jobId);
      expect(retrieved).toBeUndefined();
    });

    it('should respect cleanup interval of 5 minutes', () => {
      expect(JOB_SAFEGUARDS.CLEANUP_INTERVAL).toBe(5 * 60 * 1000);
    });
  });

  describe('Hash Collision Handling', () => {
    it('should generate unique hashes for different chunks', async () => {
      const fs = await import('fs/promises');
      const hashes: string[] = [];

      // Generate hashes for different buffers
      for (let i = 0; i < 10; i++) {
        const buffer = Buffer.from(`chunk data ${i}`);
        vi.spyOn(fs, 'readFile').mockResolvedValue(buffer);

        const hash = await computeChunkHash(`/tmp/chunk_${i}.mp3`);
        hashes.push(hash);
      }

      // All hashes should be unique
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);
    });
  });

  describe('FFmpeg Failure During Chunking', () => {
    afterEach(() => {
      // Clear all mocks to prevent contamination
      vi.clearAllMocks();
    });

    it('should propagate error when ffprobe fails', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 100, format: 'mp3' });

      const mockFFmpeg = ((await import('fluent-ffmpeg')) as MockFluentFFmpegModule).default;
      mockFFmpeg.ffprobe = vi.fn((path, callback) => {
        callback(new Error('FFprobe failed'), null);
      });

      await expect(chunkAudio(audioBuffer, 'test.mp3', 'balanced')).rejects.toThrow(
        /Failed to probe audio file/
      );
    });

    it('should handle FFmpeg extraction failure', async () => {
      const mockFFmpegInstance = {
        setStartTime: vi.fn().mockReturnThis(),
        setDuration: vi.fn().mockReturnThis(),
        audioCodec: vi.fn().mockReturnThis(),
        audioBitrate: vi.fn().mockReturnThis(),
        audioChannels: vi.fn().mockReturnThis(),
        audioFrequency: vi.fn().mockReturnThis(),
        output: vi.fn().mockReturnThis(),
        on: vi.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Extraction failed')), 0);
          }
          return mockFFmpegInstance;
        }),
        run: vi.fn(),
      };

      const mockFFmpeg = ((await import('fluent-ffmpeg')) as MockFluentFFmpegModule).default;
      vi.mocked(mockFFmpeg).mockReturnValue(mockFFmpegInstance);

      const { extractChunk } = await import('../utils/audio-chunker');

      await expect(extractChunk('/tmp/input.mp3', 0, 180, '/tmp/output.mp3')).rejects.toThrow(
        /FFmpeg extraction failed/
      );
    });
  });

  describe('Overlap Removal Fallback', () => {
    it('should fallback to no removal when fuzzy match fails', async () => {
      const chunks = [
        {
          index: 0,
          startTime: 0,
          endTime: 600,
          duration: 600,
          hash: 'hash1',
          hasOverlap: true,
          overlapStartTime: 585,
          filePath: '/tmp/chunk_0.mp3',
        },
        {
          index: 1,
          startTime: 585,
          endTime: 1185,
          duration: 600,
          hash: 'hash2',
          hasOverlap: false,
          filePath: '/tmp/chunk_1.mp3',
        },
      ];

      // Completely different transcripts (no match possible)
      const transcripts = [
        'Alpha beta gamma delta epsilon zeta eta theta.',
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.',
      ];

      const result = await assembleTranscript(chunks, transcripts, 'best_quality');

      // Both should be present since no match was found
      expect(result).toContain('Alpha beta gamma');
      expect(result).toContain('Lorem ipsum dolor');
    });
  });

  describe('Concurrent Job Creation', () => {
    it('should handle multiple concurrent job creations', async () => {
      const jobs = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          Promise.resolve(
            JobManager.createJob(
              { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
              {
                filename: `test-${i}.mp3`,
                fileSize: 1024,
                duration: 100,
                totalChunks: 0,
              }
            )
          )
        )
      );

      // All jobs should be created
      expect(jobs).toHaveLength(10);

      // All job IDs should be unique
      const jobIds = jobs.map((j) => j.jobId);
      const uniqueIds = new Set(jobIds);
      expect(uniqueIds.size).toBe(10);

      // All jobs should be retrievable
      jobs.forEach((job) => {
        const retrieved = JobManager.getJob(job.jobId);
        expect(retrieved).toBeDefined();
      });
    });
  });

  describe('Memory Leak Verification', () => {
    it('should cleanup chunk files after job completion', async () => {
      const chunks = [
        createTestChunk(0, { filePath: '/tmp/chunk_0.mp3' }),
        createTestChunk(1, { filePath: '/tmp/chunk_1.mp3' }),
        createTestChunk(2, { filePath: '/tmp/chunk_2.mp3' }),
      ];

      const fs = await import('fs/promises');
      const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValue();

      await cleanupChunks(chunks);

      // Should have attempted to delete all chunk files
      expect(unlinkSpy).toHaveBeenCalledTimes(3);
      expect(unlinkSpy).toHaveBeenCalledWith('/tmp/chunk_0.mp3');
      expect(unlinkSpy).toHaveBeenCalledWith('/tmp/chunk_1.mp3');
      expect(unlinkSpy).toHaveBeenCalledWith('/tmp/chunk_2.mp3');
    });

    it('should not leak jobs in memory', () => {
      const initialCount = JobManager.getJobCount();

      // Create several jobs
      for (let i = 0; i < 5; i++) {
        JobManager.createJob(
          { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
          {
            filename: `test-${i}.mp3`,
            fileSize: 1024,
            duration: 100,
            totalChunks: 0,
          }
        );
      }

      expect(JobManager.getJobCount()).toBe(initialCount + 5);

      // Clear all jobs
      JobManager.clearAllJobs();

      expect(JobManager.getJobCount()).toBe(0);
    });
  });

  describe('Invalid Input Handling', () => {
    it('should reject invalid job ID', () => {
      const result = JobManager.getJobStatusResponse('invalid-id-123');
      expect(result).toBeNull();
    });

    it('should throw when updating non-existent job', () => {
      expect(() => {
        JobManager.updateJobStatus('non-existent', 'completed');
      }).toThrow(/not found/);
    });

    it('should throw when initializing chunks for non-existent job', () => {
      expect(() => {
        JobManager.initializeChunks('non-existent', []);
      }).toThrow(/not found/);
    });

    it('should handle mismatched chunk/transcript counts', async () => {
      const chunks = [createTestChunk(0), createTestChunk(1)];
      const transcripts = ['Only one'];

      await expect(assembleTranscript(chunks, transcripts, 'balanced')).rejects.toThrow(
        /Chunk count mismatch/
      );
    });
  });

  describe('Extreme Values', () => {
    // Use real timers for chunkAudio() tests
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    it('should handle very short chunks (1 second)', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 1, format: 'mp3' });

      const mockFFmpeg = ((await import('fluent-ffmpeg')) as unknown as MockFluentFFmpegModule)
        .default;
      mockFFmpeg.ffprobe = vi.fn((_path, callback) => {
        callback(null, { format: { duration: 1 } });
      });

      const result = await chunkAudio(audioBuffer, 'short.mp3', 'balanced');

      expect(result.totalChunks).toBe(1);
      expect(result.chunks[0].duration).toBeCloseTo(1, 1);
    });

    it('should handle very large job counts', () => {
      const jobs = [];

      for (let i = 0; i < 100; i++) {
        const job = JobManager.createJob(
          { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
          {
            filename: `test-${i}.mp3`,
            fileSize: 1024,
            duration: 100,
            totalChunks: 0,
          }
        );
        jobs.push(job);
      }

      expect(JobManager.getJobCount()).toBe(100);

      // All should be retrievable
      jobs.forEach((job) => {
        expect(JobManager.getJob(job.jobId)).toBeDefined();
      });

      // Cleanup
      JobManager.clearAllJobs();
    });

    it('should handle maximum chunk count', async () => {
      // Simulate extremely long audio (10 hours)
      const duration = 10 * 60 * 60; // 36000 seconds

      const mockFFmpeg = ((await import('fluent-ffmpeg')) as unknown as MockFluentFFmpegModule)
        .default;
      mockFFmpeg.ffprobe = vi.fn((_path, callback) => {
        callback(null, { format: { duration } });
      });

      const audioBuffer = generateMockAudio({ durationSeconds: 100, format: 'mp3' });
      const result = await chunkAudio(audioBuffer, 'long.mp3', 'balanced');

      // 10 hours / 3 minutes = 200 chunks
      expect(result.totalChunks).toBe(200);
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent job state through updates', () => {
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'balanced', model: 'whisper-1' },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 100,
          totalChunks: 0,
        }
      );

      const chunks = [createTestChunk(0), createTestChunk(1), createTestChunk(2)];
      JobManager.initializeChunks(job.jobId, chunks);

      // Update chunks
      JobManager.updateChunkStatus(job.jobId, 0, { status: 'completed' });
      JobManager.updateChunkStatus(job.jobId, 1, { status: 'completed' });

      const updated = JobManager.getJob(job.jobId)!;

      // Progress should be consistent
      expect(updated.completedChunks).toBe(2);
      expect(updated.progress).toBe(Math.floor((2 / 3) * 100));
    });
  });
});
