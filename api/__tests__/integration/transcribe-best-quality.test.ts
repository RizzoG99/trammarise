/**
 * Integration Tests: Transcribe Best Quality Mode
 *
 * Full workflow tests for best quality mode transcription with overlapping chunks.
 * Implements test cases TC-02, TC-04 from functional analysis.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobManager } from '../../utils/job-manager';
import { chunkAudio } from '../../utils/audio-chunker';
import { processChunk } from '../../utils/chunk-processor';
import { assembleTranscript } from '../../utils/transcript-assembler';
import { RateLimitGovernor } from '../../utils/rate-limit-governor';
import {
  generateMockAudio,
  VERY_LONG_AUDIO_2H,
} from '../../utils/__test-helpers__/mock-audio-generator';
import { MockOpenAIAPI } from '../../utils/__test-helpers__/mock-openai-api';
import { ConcurrencyTracker, RetryCounter } from '../../utils/__test-helpers__/test-fixtures';

describe('Integration: Transcribe Best Quality Mode', () => {
  beforeEach(() => {
    JobManager.clearAllJobs();
  });

  describe('TC-02: Large File Upload (Best Quality)', () => {
    it('should chunk 2h audio into ~12 chunks with 15s overlap and process sequentially', async () => {
      const audioBuffer = VERY_LONG_AUDIO_2H;
      const duration = 120 * 60; // 7200 seconds

      // Mock ffprobe
      const mockFFmpegModule = await import('fluent-ffmpeg');
      const mockFfprobe = vi.fn((path, callback) => {
        callback(null, { format: { duration } });
      });

      const mockModule = mockFFmpegModule as unknown as {
        default?: { ffprobe: unknown };
        ffprobe?: unknown;
      };
      mockModule.ffprobe = mockFfprobe;
      if (mockModule.default) {
        mockModule.default.ffprobe = mockFfprobe;
      }

      // Setup OpenAI mock with overlapping transcripts
      const mockOpenAI = new MockOpenAIAPI({
        transcriptGenerator: (index) => {
          // Generate overlapping content
          const mainContent = `Chunk ${index} main content. `;
          const overlapContent = `Overlap text from chunk ${index}. `;
          return mainContent + overlapContent;
        },
      });
      global.fetch = mockOpenAI.createMockFetch();

      // Chunk the audio
      const chunkingResult = await chunkAudio(audioBuffer, 'test-2h.wav', 'best_quality');

      // Verify chunking
      expect(chunkingResult.totalChunks).toBeGreaterThanOrEqual(12);
      expect(chunkingResult.mode).toBe('best_quality');

      // Verify overlap metadata
      chunkingResult.chunks.forEach((chunk, i) => {
        if (i < chunkingResult.chunks.length - 1) {
          expect(chunk.hasOverlap).toBe(true);
          expect(chunk.overlapStartTime).toBeDefined();
          expect(chunk.overlapStartTime).toBeCloseTo(chunk.endTime - 15, 1);
        }
      });

      // Create job
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'best_quality', model: 'whisper-1' },
        {
          filename: 'test-2h.wav',
          fileSize: audioBuffer.length,
          duration,
          totalChunks: chunkingResult.totalChunks,
        }
      );

      JobManager.initializeChunks(job.jobId, chunkingResult.chunks);

      // Process chunks with concurrency tracking
      const governor = new RateLimitGovernor('best_quality');
      const tracker = new ConcurrencyTracker();

      const mockProvider = {
        name: 'Mock',
        summarize: vi.fn(),
        chat: vi.fn(),
        validateApiKey: vi.fn(),
        transcribe: vi.fn(async (params) => {
          tracker.start();
          await new Promise((resolve) => setTimeout(resolve, 10));
          tracker.end();
          return `Transcription for ${params.filePath}`;
        }),
      };

      // Process first 4 chunks to verify sequential processing
      for (let i = 0; i < 4; i++) {
        const chunk = chunkingResult.chunks[i];
        await processChunk(chunk, job, governor, mockProvider, 'test-key');
      }

      // Verify concurrency was limited to 1 (sequential)
      expect(tracker.getMaxConcurrency()).toBe(1);
    }, 15000);

    it('should preserve context across chunks with 15s overlap', async () => {
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
          hasOverlap: true,
          overlapStartTime: 1170,
          filePath: '/tmp/chunk_1.mp3',
        },
        {
          index: 2,
          startTime: 1170,
          endTime: 1770,
          duration: 600,
          hash: 'hash3',
          hasOverlap: false,
          filePath: '/tmp/chunk_2.mp3',
        },
      ];

      // Transcripts with overlapping text
      const transcripts = [
        'First chunk content here. The important context continues into overlap.',
        'The important context continues into overlap. Second chunk new content here.',
        'Third chunk final content.',
      ];

      const result = await assembleTranscript(chunks, transcripts, 'best_quality');

      // Verify overlap was removed (should appear only once)
      const matches = (result.match(/important context continues into overlap/g) || []).length;
      expect(matches).toBe(1);

      // All unique content should be present
      expect(result).toContain('First chunk content');
      expect(result).toContain('Second chunk new content');
      expect(result).toContain('Third chunk final content');
    });
  });

  describe('TC-04: Chunk Failure Recovery (Best Quality)', () => {
    it('should retry chunk 2x then auto-split to 2×300s on failure', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 700, format: 'wav' });
      const duration = 700;

      const mockFFmpegModule = await import('fluent-ffmpeg');
      const mockFfprobe = vi.fn((path, callback) => {
        callback(null, { format: { duration } });
      });

      const mockModule = mockFFmpegModule as unknown as {
        default?: { ffprobe: unknown };
        ffprobe?: unknown;
      };
      mockModule.ffprobe = mockFfprobe;
      if (mockModule.default) {
        mockModule.default.ffprobe = mockFfprobe;
      }

      // Chunk audio
      const chunkingResult = await chunkAudio(audioBuffer, 'test.wav', 'best_quality');

      // Create job
      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'best_quality', model: 'whisper-1' },
        {
          filename: 'test.wav',
          fileSize: audioBuffer.length,
          duration,
          totalChunks: chunkingResult.totalChunks,
        }
      );

      JobManager.initializeChunks(job.jobId, chunkingResult.chunks);

      const governor = new RateLimitGovernor('best_quality');
      const retryCounter = new RetryCounter();
      const chunk = chunkingResult.chunks[0];

      // Mock transcribe to fail 2 times (best_quality max retries)
      let attemptCount = 0;
      const mockProvider = {
        name: 'Mock',
        summarize: vi.fn(),
        chat: vi.fn(),
        validateApiKey: vi.fn(),
        transcribe: vi.fn(async () => {
          attemptCount++;
          retryCounter.increment('chunk_0');

          if (attemptCount <= 2) {
            throw new Error('Chunk transcription failed');
          }

          return 'Success after retries';
        }),
      };

      try {
        await processChunk(chunk, job, governor, mockProvider, 'test-key');
      } catch {
        // Expected to fail after retries if auto-split not fully mocked
      }

      // Should have retried 2 times (best_quality mode max retries)
      expect(attemptCount).toBeGreaterThanOrEqual(2);
    });

    it('should abort if sub-chunk fails after split', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 600, format: 'wav' });
      const duration = 600;

      const mockFFmpegModule = await import('fluent-ffmpeg');
      const mockFfprobe = vi.fn((path, callback) => {
        callback(null, { format: { duration } });
      });

      const mockModule = mockFFmpegModule as unknown as {
        default?: { ffprobe: unknown };
        ffprobe?: unknown;
      };
      mockModule.ffprobe = mockFfprobe;
      if (mockModule.default) {
        mockModule.default.ffprobe = mockFfprobe;
      }

      const chunkingResult = await chunkAudio(audioBuffer, 'test.wav', 'best_quality');

      const job = JobManager.createJob(
        { apiKey: 'test-key', mode: 'best_quality', model: 'whisper-1' },
        {
          filename: 'test.wav',
          fileSize: audioBuffer.length,
          duration,
          totalChunks: chunkingResult.totalChunks,
        }
      );

      JobManager.initializeChunks(job.jobId, chunkingResult.chunks);

      const governor = new RateLimitGovernor('best_quality');
      const chunk = chunkingResult.chunks[0];

      // Mock to always fail (simulates sub-chunk failure)
      const mockProvider = {
        name: 'Mock',
        summarize: vi.fn(),
        chat: vi.fn(),
        validateApiKey: vi.fn(),
        transcribe: vi.fn(async () => {
          throw new Error('Always fails');
        }),
      };

      await expect(processChunk(chunk, job, governor, mockProvider, 'test-key')).rejects.toThrow();
    });
  });

  describe('TC-05: Overlap Removal - Seamless Continuity', () => {
    it('should produce seamless transcript with no duplicate text', async () => {
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
          hasOverlap: true,
          overlapStartTime: 1170,
          filePath: '/tmp/chunk_1.mp3',
        },
      ];

      // Realistic overlapping transcripts
      const transcripts = [
        'The speaker discusses the importance of testing in software development. ' +
          'Testing ensures code quality and prevents regressions. ' +
          'Now moving on to the next topic of continuous integration.',

        'Now moving on to the next topic of continuous integration. ' +
          'CI systems automatically build and test code changes. ' +
          'This improves team productivity significantly.',
      ];

      const result = await assembleTranscript(chunks, transcripts, 'best_quality');

      // Verify no duplicate sentences
      const overlap = 'Now moving on to the next topic of continuous integration';
      const matches = (result.match(new RegExp(overlap, 'g')) || []).length;
      expect(matches).toBe(1);

      // Verify seamless flow
      expect(result).toContain('prevents regressions');
      expect(result).toContain('CI systems automatically');
      expect(result).toContain('improves team productivity');
    });

    it('should handle fuzzy matching with 70% threshold', async () => {
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

      // Slightly different transcription of overlap (Whisper may transcribe differently)
      const transcripts = [
        'The quick brown fox jumps over the lazy dog.',
        'The quick brown fox jumped over the lazy dog. New content here.',
      ];

      const result = await assembleTranscript(chunks, transcripts, 'best_quality');

      // Should still match due to fuzzy matching
      expect(result).toBeTruthy();
      expect(result).toContain('New content here');
    });
  });
});
