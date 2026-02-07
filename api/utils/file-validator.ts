import { promises as fs } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { setupFFmpeg } from './ffmpeg-setup';

/**
 * File Validation Utility
 *
 * Provides security-focused file validation using magic byte signatures
 * to prevent malicious file uploads disguised with incorrect MIME types.
 */

/**
 * Known file signatures (magic bytes) for supported file types
 */
const FILE_SIGNATURES: Record<string, { bytes: number[]; offset: number }[]> = {
  'audio/mpeg': [
    { bytes: [0xff, 0xfb], offset: 0 }, // MP3 frame sync
    { bytes: [0x49, 0x44, 0x33], offset: 0 }, // ID3 tag
  ],
  'audio/wav': [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }], // RIFF header
  'audio/webm': [{ bytes: [0x1a, 0x45, 0xdf, 0xa3], offset: 0 }], // EBML header
  'audio/ogg': [{ bytes: [0x4f, 0x67, 0x67, 0x53], offset: 0 }], // OggS
  'audio/mp4': [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }], // ftyp (MP4 container)
  'audio/x-m4a': [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }], // ftyp (M4A)
};

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46]; // %PDF

export interface ValidationResult {
  valid: boolean;
  error?: string;
  duration?: number;
}

/**
 * Validate audio file using magic bytes and duration check
 *
 * @param buffer - File buffer to validate
 * @param declaredMimeType - MIME type from upload
 * @param maxDurationSeconds - Maximum allowed duration (default: 7200s = 2 hours)
 * @returns Validation result with duration if valid
 */
export async function validateAudioFile(
  buffer: Buffer,
  declaredMimeType: string,
  maxDurationSeconds = 7200
): Promise<ValidationResult> {
  // Step 1: Validate magic bytes
  if (!validateMagicBytes(buffer, declaredMimeType)) {
    return {
      valid: false,
      error:
        'File signature does not match declared type. Possible file type mismatch or corruption.',
    };
  }

  // Step 2: Validate duration using FFmpeg
  try {
    setupFFmpeg();
    const tempPath = `/tmp/validate_${Date.now()}_${Math.random().toString(36).substring(7)}.tmp`;
    await fs.writeFile(tempPath, buffer);

    const duration = await getAudioDuration(tempPath);

    // Clean up temp file
    await fs.unlink(tempPath).catch(() => {
      /* ignore cleanup errors */
    });

    if (duration > maxDurationSeconds) {
      return {
        valid: false,
        error: `Audio duration (${Math.round(duration)}s) exceeds maximum allowed duration (${maxDurationSeconds}s)`,
        duration,
      };
    }

    return { valid: true, duration };
  } catch (error) {
    const err = error as { message?: string };
    return {
      valid: false,
      error: `Failed to validate audio file: ${err.message || 'Unknown error'}`,
    };
  }
}

/**
 * Validate PDF file using magic bytes and size check
 *
 * @param buffer - File buffer to validate
 * @param maxSizeBytes - Maximum allowed size (default: 10MB)
 * @returns Validation result
 */
export function validatePdfFile(buffer: Buffer, maxSizeBytes = 10 * 1024 * 1024): ValidationResult {
  // Check PDF signature
  if (!matchesSignature(buffer, PDF_SIGNATURE, 0)) {
    return { valid: false, error: 'Invalid PDF file signature' };
  }

  // Check file size
  if (buffer.length > maxSizeBytes) {
    const maxMB = (maxSizeBytes / 1024 / 1024).toFixed(1);
    const actualMB = (buffer.length / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `PDF size (${actualMB}MB) exceeds maximum allowed size (${maxMB}MB)`,
    };
  }

  return { valid: true };
}

/**
 * Validate that buffer matches expected magic bytes for MIME type
 */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType];

  // If we don't have signatures for this type, allow it (fallback to basic validation)
  if (!signatures) {
    console.warn(`[File Validator] No magic byte signatures defined for ${mimeType}`);
    return true;
  }

  // Check if buffer matches any of the known signatures for this type
  return signatures.some((sig) => matchesSignature(buffer, sig.bytes, sig.offset));
}

/**
 * Check if buffer matches a specific byte signature at an offset
 */
function matchesSignature(buffer: Buffer, signature: number[], offset: number): boolean {
  if (buffer.length < offset + signature.length) {
    return false;
  }

  return signature.every((byte, index) => buffer[offset + index] === byte);
}

/**
 * Get audio duration using FFmpeg
 */
async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}
