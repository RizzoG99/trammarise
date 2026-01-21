/**
 * Unit Tests: Audio Chunker
 *
 * Tests for audio chunking utilities with mode-aware behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as ffmpeg from 'fluent-ffmpeg';
import { mockFFmpeg } from '../../vitest.setup';
import type { ChunkMetadata } from '../../types/chunking';
import {
  chunkAudio,
  getAudioDuration,
  extractChunk,
  computeChunkHash,
  cleanupChunks,
  getChunkSize,
} from '../audio-chunker';
import {
  generateMockAudio,
  LONG_AUDIO_90MIN,
  VERY_LONG_AUDIO_2H,
} from '../__test-helpers__/mock-audio-generator';
import * as crypto from 'crypto';

// Helper to configure ffprobe mock for a specific duration
function mockFFprobeDuration(duration: number) {
  vi.mocked(ffmpeg.ffprobe).mockImplementation(((
    _path: string,
    callback: (err: unknown, data?: unknown) => void
  ) => {
    callback(null, { format: { duration } });
  }) as unknown as typeof ffmpeg.ffprobe);
}

describe('Audio Chunker', () => {
  describe('chunkAudio()', () => {
    // Use real timers for all chunkAudio() tests
    beforeEach(() => {
      vi.useRealTimers();
    });

    afterEach(() => {
      vi.useFakeTimers();
    });

    it('should create correct number of chunks for balanced mode (90min audio)', async () => {
      const audioBuffer = LONG_AUDIO_90MIN;
      const duration = 90 * 60; // 5400 seconds
      const expectedChunks = Math.ceil(duration / 180); // 30 chunks

      // Mock ffprobe to return 90min duration
      mockFFprobeDuration(duration);

      const result = await chunkAudio(audioBuffer, 'test-90min.mp3', 'balanced');

      expect(result.totalChunks).toBe(expectedChunks);
      expect(result.chunks).toHaveLength(expectedChunks);
      expect(result.mode).toBe('balanced');
      expect(result.totalDuration).toBe(duration);
    });

    it('should create 3-minute chunks for balanced mode', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 600, format: 'mp3' }); // 10min
      const duration = 600;

      mockFFprobeDuration(duration);

      const result = await chunkAudio(audioBuffer, 'test-10min.mp3', 'balanced');

      // Should create 4 chunks (0-180, 180-360, 360-540, 540-600)
      expect(result.chunks).toHaveLength(4);
      expect(result.chunks[0].duration).toBeCloseTo(180, 1);
      expect(result.chunks[1].duration).toBeCloseTo(180, 1);
      expect(result.chunks[2].duration).toBeCloseTo(180, 1);
      expect(result.chunks[3].duration).toBeCloseTo(60, 1); // Last chunk shorter
    });

    it('should create 10-minute chunks with 15s overlap for best_quality mode', async () => {
      const audioBuffer = VERY_LONG_AUDIO_2H;
      const duration = 120 * 60; // 7200 seconds

      mockFFprobeDuration(duration);

      const result = await chunkAudio(audioBuffer, 'test-2h.wav', 'best_quality');

      // Should create ~12 chunks with overlap
      expect(result.totalChunks).toBeGreaterThanOrEqual(12);
      expect(result.chunks[0].duration).toBeCloseTo(600, 1);
      expect(result.chunks[0].hasOverlap).toBe(true);
      expect(result.chunks[0].overlapStartTime).toBeCloseTo(585, 1); // 600 - 15

      // Last chunk should not have overlap
      const lastChunk = result.chunks[result.chunks.length - 1];
      expect(lastChunk.hasOverlap).toBe(false);
    });

    it('should not add overlap for balanced mode', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 600, format: 'mp3' });
      const duration = 600;

      mockFFprobeDuration(duration);

      const result = await chunkAudio(audioBuffer, 'test.mp3', 'balanced');

      // All chunks should have hasOverlap = false
      result.chunks.forEach((chunk) => {
        expect(chunk.hasOverlap).toBe(false);
        expect(chunk.overlapStartTime).toBeUndefined();
      });
    });

    it('should handle single-chunk audio (duration < chunk size)', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 60, format: 'mp3' }); // 1min
      const duration = 60;

      mockFFprobeDuration(duration);

      const result = await chunkAudio(audioBuffer, 'test-1min.mp3', 'balanced');

      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].duration).toBeCloseTo(60, 1);
      expect(result.chunks[0].startTime).toBe(0);
    });

    it('should compute unique hash for each chunk', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 400, format: 'mp3' });
      const duration = 400;

      mockFFprobeDuration(duration);

      const result = await chunkAudio(audioBuffer, 'test.mp3', 'balanced');

      // All hashes should be unique
      const hashes = result.chunks.map((c) => c.hash);
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);

      // Hashes should be SHA-256 format (64 hex characters)
      hashes.forEach((hash) => {
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
      });
    });

    it('should clean up input file after chunking', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 200, format: 'mp3' });
      const duration = 200;

      mockFFprobeDuration(duration);

      // Use global mock directly
      const unlinkSpy = globalThis.mockFileSystem.unlink;
      unlinkSpy.mockClear();

      await chunkAudio(audioBuffer, 'test.mp3', 'balanced');

      // Should unlink the temp input file
      expect(unlinkSpy).toHaveBeenCalledWith(expect.stringContaining('input_'));
    });
  });

  describe('getAudioDuration()', () => {
    it('should extract duration from ffprobe metadata', async () => {
      const expectedDuration = 1234.56;

      vi.mocked(ffmpeg.ffprobe).mockImplementation(((
        _path: string,
        callback: (err: unknown, data?: unknown) => void
      ) => {
        callback(null, { format: { duration: expectedDuration } });
      }) as unknown as typeof ffmpeg.ffprobe);

      const duration = await getAudioDuration('/tmp/test.mp3');

      expect(duration).toBe(expectedDuration);
    });

    it('should reject if ffprobe fails', async () => {
      vi.mocked(ffmpeg.ffprobe).mockImplementation(((
        _path: string,
        callback: (err: unknown, data?: unknown) => void
      ) => {
        callback(new Error('FFprobe failed'), null);
      }) as unknown as typeof ffmpeg.ffprobe);

      await expect(getAudioDuration('/tmp/test.mp3')).rejects.toThrow('Failed to probe audio file');
    });

    it('should reject if duration is not a number', async () => {
      vi.mocked(ffmpeg.ffprobe).mockImplementation(((
        _path: string,
        callback: (err: unknown, data?: unknown) => void
      ) => {
        callback(null, { format: { duration: null } });
      }) as unknown as typeof ffmpeg.ffprobe);

      await expect(getAudioDuration('/tmp/test.mp3')).rejects.toThrow(
        'Could not determine audio duration'
      );
    });
  });

  describe('extractChunk()', () => {
    let originalFFmpegMock: unknown;

    beforeEach(() => {
      // Save original mock implementation
      originalFFmpegMock = vi.mocked(mockFFmpeg).getMockImplementation();
    });

    afterEach(() => {
      // Restore original mock implementation
      if (originalFFmpegMock) {
        vi.mocked(mockFFmpeg).mockImplementation(originalFFmpegMock as never);
      }
    });

    it('should construct correct FFmpeg command', async () => {
      const mockFFmpegInstance = {
        setStartTime: vi.fn().mockReturnThis(),
        setDuration: vi.fn().mockReturnThis(),
        audioCodec: vi.fn().mockReturnThis(),
        audioBitrate: vi.fn().mockReturnThis(),
        audioChannels: vi.fn().mockReturnThis(),
        audioFrequency: vi.fn().mockReturnThis(),
        output: vi.fn().mockReturnThis(),
        on: vi.fn((event, callback) => {
          if (event === 'end') {
            setTimeout(callback, 0);
          }
          return mockFFmpegInstance;
        }),
        run: vi.fn(),
      };

      // Mock ffprobe for this test
      vi.mocked(mockFFmpeg).mockReturnValue(mockFFmpegInstance);

      await extractChunk('/tmp/input.mp3', 120, 180, '/tmp/output.mp3');

      expect(mockFFmpegInstance.setStartTime).toHaveBeenCalledWith(120);
      expect(mockFFmpegInstance.setDuration).toHaveBeenCalledWith(180);
      expect(mockFFmpegInstance.audioCodec).toHaveBeenCalledWith('libmp3lame');
      expect(mockFFmpegInstance.audioBitrate).toHaveBeenCalledWith('128k');
      expect(mockFFmpegInstance.audioChannels).toHaveBeenCalledWith(1);
      expect(mockFFmpegInstance.audioFrequency).toHaveBeenCalledWith(16000);
      expect(mockFFmpegInstance.output).toHaveBeenCalledWith('/tmp/output.mp3');
      expect(mockFFmpegInstance.run).toHaveBeenCalled();
    });

    it('should reject if FFmpeg fails', async () => {
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
            setTimeout(() => callback(new Error('FFmpeg error')), 0);
          }
          return mockFFmpegInstance;
        }),
        run: vi.fn(),
      };

      // Mock ffprobe for this test
      vi.mocked(mockFFmpeg).mockReturnValue(mockFFmpegInstance);

      await expect(extractChunk('/tmp/input.mp3', 0, 180, '/tmp/output.mp3')).rejects.toThrow(
        'FFmpeg extraction failed'
      );
    });
  });

  describe('computeChunkHash()', () => {
    it('should compute consistent SHA-256 hash for same content', async () => {
      const testBuffer = Buffer.from('test audio data');
      const expectedHash = crypto.createHash('sha256').update(testBuffer).digest('hex');

      // Pre-populate mock filesystem
      globalThis.mockFileSystem.files.set('/tmp/chunk.mp3', testBuffer);

      const hash = await computeChunkHash('/tmp/chunk.mp3');

      expect(hash).toBe(expectedHash);
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 format
    });

    it('should produce different hashes for different content', async () => {
      // Pre-populate mock filesystem with different content
      globalThis.mockFileSystem.files.set('/tmp/chunk1.mp3', Buffer.from('data 1'));
      globalThis.mockFileSystem.files.set('/tmp/chunk2.mp3', Buffer.from('data 2'));

      const hash1 = await computeChunkHash('/tmp/chunk1.mp3');
      const hash2 = await computeChunkHash('/tmp/chunk2.mp3');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('cleanupChunks()', () => {
    it('should delete all chunk files', async () => {
      // Pre-populate mock filesystem with chunk files
      globalThis.mockFileSystem.files.set('/tmp/chunk_0.mp3', Buffer.from('chunk 0'));
      globalThis.mockFileSystem.files.set('/tmp/chunk_1.mp3', Buffer.from('chunk 1'));
      globalThis.mockFileSystem.files.set('/tmp/chunk_2.mp3', Buffer.from('chunk 2'));

      // Use global mock directly WITHOUT clearing
      const unlinkSpy = globalThis.mockFileSystem.unlink;
      const initialCallCount = unlinkSpy.mock.calls.length;

      const chunks: ChunkMetadata[] = [
        {
          index: 0,
          filePath: '/tmp/chunk_0.mp3',
          startTime: 0,
          endTime: 180,
          duration: 180,
          hash: 'hash0',
          hasOverlap: false,
        },
        {
          index: 1,
          filePath: '/tmp/chunk_1.mp3',
          startTime: 180,
          endTime: 360,
          duration: 180,
          hash: 'hash1',
          hasOverlap: false,
        },
        {
          index: 2,
          filePath: '/tmp/chunk_2.mp3',
          startTime: 360,
          endTime: 540,
          duration: 180,
          hash: 'hash2',
          hasOverlap: false,
        },
      ];

      await cleanupChunks(chunks);

      expect(unlinkSpy.mock.calls.length - initialCallCount).toBe(3);
      expect(unlinkSpy).toHaveBeenCalledWith('/tmp/chunk_0.mp3');
      expect(unlinkSpy).toHaveBeenCalledWith('/tmp/chunk_1.mp3');
      expect(unlinkSpy).toHaveBeenCalledWith('/tmp/chunk_2.mp3');
    });

    it('should not throw if deletion fails', async () => {
      // Use global mock directly
      const unlinkSpy = globalThis.mockFileSystem.unlink;
      unlinkSpy.mockClear();
      unlinkSpy.mockRejectedValue(new Error('ENOENT'));

      const chunks: ChunkMetadata[] = [
        {
          index: 0,
          filePath: '/tmp/chunk_0.mp3',
          startTime: 0,
          endTime: 180,
          duration: 180,
          hash: 'hash0',
          hasOverlap: false,
        },
      ];

      // Should not throw
      await expect(cleanupChunks(chunks)).resolves.toBeUndefined();
    });
  });

  describe('getChunkSize()', () => {
    it('should return file size in bytes', async () => {
      const expectedSize = 1024 * 512; // 512KB

      // Pre-populate mock filesystem with correct size
      const testBuffer = Buffer.alloc(expectedSize);
      globalThis.mockFileSystem.files.set('/tmp/chunk.mp3', testBuffer);

      const size = await getChunkSize('/tmp/chunk.mp3');

      expect(size).toBe(expectedSize);
    });
  });

  describe('Edge cases', () => {
    let originalFfprobe: unknown;

    // Use real timers for chunkAudio() tests
    beforeEach(() => {
      vi.useRealTimers();
      // Save original ffprobe implementation
      originalFfprobe = mockFFmpeg.ffprobe;
    });

    afterEach(() => {
      vi.useFakeTimers();
      // Restore original ffprobe implementation
      if (originalFfprobe) {
        mockFFmpeg.ffprobe = originalFfprobe as never;
      }
    });

    it('should handle zero duration audio', async () => {
      const audioBuffer = Buffer.from('');

      mockFFprobeDuration(0);

      const result = await chunkAudio(audioBuffer, 'empty.mp3', 'balanced');

      expect(result.chunks).toHaveLength(0);
      expect(result.totalDuration).toBe(0);
    });

    it('should handle exact chunk boundary (no remainder)', async () => {
      const audioBuffer = generateMockAudio({ durationSeconds: 360, format: 'mp3' }); // Exactly 2 chunks

      mockFFprobeDuration(360);

      const result = await chunkAudio(audioBuffer, 'exact.mp3', 'balanced');

      expect(result.chunks).toHaveLength(2);
      expect(result.chunks[0].duration).toBeCloseTo(180, 1);
      expect(result.chunks[1].duration).toBeCloseTo(180, 1);
    });
  });
});
