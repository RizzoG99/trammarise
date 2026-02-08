/**
 * Integration tests for file validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock functions to top
const { mockFfprobe, mockWriteFile, mockUnlink } = vi.hoisted(() => ({
  mockFfprobe: vi.fn(),
  mockWriteFile: vi.fn(),
  mockUnlink: vi.fn(),
}));

// Mock ffmpeg-setup
vi.mock('../../utils/ffmpeg-setup', () => ({
  setupFFmpeg: vi.fn(),
}));

// Mock ffmpeg with hoisted function
vi.mock('fluent-ffmpeg', () => ({
  default: {
    ffprobe: mockFfprobe,
  },
}));

// Mock fs/promises with hoisted functions
vi.mock('fs/promises', () => ({
  writeFile: mockWriteFile,
  unlink: mockUnlink,
}));

// Now import after mocks are set up
import { validateAudioFile, validatePdfFile } from '../../utils/file-validator';

// Type for FFmpeg probe callback
type FfprobeCallback = (err: Error | null, metadata?: { format: { duration?: number } }) => void;

describe('File Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Audio File Validation', () => {
    describe('Magic Bytes Validation', () => {
      it('should validate MP3 with FF FB magic bytes', async () => {
        const mp3Buffer = Buffer.from([0xff, 0xfb, 0x90, 0x00, ...Array(100).fill(0)]);

        mockFfprobe.mockImplementation((path: string, callback: FfprobeCallback) => {
          callback(null, { format: { duration: 120 } });
        });

        const result = await validateAudioFile(mp3Buffer, 'audio/mpeg', 7200);

        expect(result.valid).toBe(true);
        expect(result.duration).toBe(120);
      });

      it('should validate WAV with RIFF header', async () => {
        const wavBuffer = Buffer.from([
          0x52,
          0x49,
          0x46,
          0x46, // RIFF
          ...Array(100).fill(0),
        ]);

        mockFfprobe.mockImplementation((path: string, callback: FfprobeCallback) => {
          callback(null, { format: { duration: 30 } });
        });

        const result = await validateAudioFile(wavBuffer, 'audio/wav', 7200);

        expect(result.valid).toBe(true);
      });

      it('should reject file with mismatched magic bytes', async () => {
        const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, ...Array(100).fill(0)]);

        const result = await validateAudioFile(invalidBuffer, 'audio/mpeg', 7200);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('File signature does not match');
      });
    });

    describe('Duration Validation', () => {
      it('should accept audio within duration limit', async () => {
        const validBuffer = Buffer.from([0xff, 0xfb, ...Array(100).fill(0)]);

        mockFfprobe.mockImplementation((path: string, callback: FfprobeCallback) => {
          callback(null, { format: { duration: 3600 } }); // 1 hour
        });

        const result = await validateAudioFile(validBuffer, 'audio/mpeg', 7200);

        expect(result.valid).toBe(true);
        expect(result.duration).toBe(3600);
      });

      it('should reject audio exceeding duration limit', async () => {
        const longBuffer = Buffer.from([0xff, 0xfb, ...Array(100).fill(0)]);

        mockFfprobe.mockImplementation((path: string, callback: FfprobeCallback) => {
          callback(null, { format: { duration: 7300 } }); // Over 2 hours
        });

        const result = await validateAudioFile(longBuffer, 'audio/mpeg', 7200);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('exceeds maximum allowed duration');
        expect(result.duration).toBe(7300);
      });
    });
  });

  describe('PDF File Validation', () => {
    it('should validate PDF with correct magic bytes', () => {
      const pdfBuffer = Buffer.from([
        0x25,
        0x50,
        0x44,
        0x46, // %PDF
        ...Array(100).fill(0),
      ]);

      const result = validatePdfFile(pdfBuffer);

      expect(result.valid).toBe(true);
    });

    it('should reject non-PDF files', () => {
      const notPdfBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, ...Array(100).fill(0)]);

      const result = validatePdfFile(notPdfBuffer);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid PDF file signature');
    });

    it('should reject PDF exceeding size limit', () => {
      const largePdfBuffer = Buffer.from([
        0x25,
        0x50,
        0x44,
        0x46,
        ...Array(11 * 1024 * 1024).fill(0), // 11MB
      ]);

      const result = validatePdfFile(largePdfBuffer, 10 * 1024 * 1024);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should accept PDF within size limit', () => {
      const validPdfBuffer = Buffer.from([
        0x25,
        0x50,
        0x44,
        0x46,
        ...Array(5 * 1024 * 1024).fill(0), // 5MB
      ]);

      const result = validatePdfFile(validPdfBuffer, 10 * 1024 * 1024);

      expect(result.valid).toBe(true);
    });
  });
});
