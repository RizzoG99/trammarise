/**
 * FFmpeg Setup Utility
 *
 * Configures fluent-ffmpeg to use the correct FFmpeg binary path
 * for different environments (local development, Vercel serverless).
 */

import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as ffprobeInstaller from '@ffprobe-installer/ffprobe';

let isSetup = false;

/**
 * Initialize FFmpeg with the correct binary path.
 * Safe to call multiple times (idempotent).
 */
export function setupFFmpeg(): void {
  if (isSetup) {
    return;
  }

  const ffmpegPath = getFFmpegPath();
  const ffprobePath = getFFprobePath();

  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);

  console.log('[FFmpeg Setup] Configured FFmpeg binary:', ffmpegPath);
  console.log('[FFmpeg Setup] Configured FFprobe binary:', ffprobePath);
  isSetup = true;
}

/**
 * Get the FFmpeg binary path for the current environment.
 */
export function getFFmpegPath(): string {
  // Use @ffmpeg-installer/ffmpeg which auto-detects the platform
  // and provides the correct binary path
  const path = ffmpegInstaller.path;

  if (!path) {
    throw new Error('FFmpeg binary path not found. Ensure @ffmpeg-installer/ffmpeg is installed.');
  }

  return path;
}

/**
 * Get the FFprobe binary path for the current environment.
 */
export function getFFprobePath(): string {
  // Use @ffprobe-installer/ffprobe which auto-detects the platform
  // and provides the correct binary path
  const path = ffprobeInstaller.path;

  if (!path) {
    throw new Error(
      'FFprobe binary path not found. Ensure @ffprobe-installer/ffprobe is installed.'
    );
  }

  return path;
}

/**
 * Get FFmpeg version information (for debugging)
 */
export async function getFFmpegVersion(): Promise<string> {
  setupFFmpeg();

  return new Promise((resolve, reject) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        reject(err);
        return;
      }

      // Just return a success indicator
      resolve('FFmpeg is available');
    });
  });
}

/**
 * Verify FFmpeg is working correctly
 */
export async function verifyFFmpeg(): Promise<boolean> {
  try {
    setupFFmpeg();
    await getFFmpegVersion();
    return true;
  } catch (error) {
    console.error('[FFmpeg Setup] Verification failed:', error);
    return false;
  }
}
