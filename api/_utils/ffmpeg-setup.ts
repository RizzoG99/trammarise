/**
 * FFmpeg Setup Utility
 *
 * Configures the correct FFmpeg binary path for different environments
 * (local development, Vercel serverless) and provides run helpers.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as ffprobeInstaller from '@ffprobe-installer/ffprobe';

const execFileAsync = promisify(execFile);

let isSetup = false;
let configuredFFmpegPath = '';
let configuredFFprobePath = '';

/**
 * Initialize FFmpeg with the correct binary path.
 * Safe to call multiple times (idempotent).
 */
export function setupFFmpeg(): void {
  if (isSetup) {
    return;
  }

  configuredFFmpegPath = getFFmpegPath();
  configuredFFprobePath = getFFprobePath();

  console.log('[FFmpeg Setup] Configured FFmpeg binary:', configuredFFmpegPath);
  console.log('[FFmpeg Setup] Configured FFprobe binary:', configuredFFprobePath);
  isSetup = true;
}

/**
 * Get the FFmpeg binary path for the current environment.
 */
export function getFFmpegPath(): string {
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

  try {
    const { stdout } = await execFileAsync(configuredFFmpegPath, ['-version']);
    return stdout.split('\\n')[0] || 'FFmpeg is available';
  } catch {
    throw new Error('FFmpeg execution failed');
  }
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

/**
 * Extract audio duration using FFprobe
 */
export async function ffprobeDuration(filePath: string): Promise<number> {
  setupFFmpeg();
  const args = [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    filePath,
  ];

  const { stdout } = await execFileAsync(configuredFFprobePath, args);
  const duration = parseFloat(stdout.trim());

  if (isNaN(duration)) {
    throw new Error('Could not determine audio duration');
  }

  return duration;
}

/**
 * Extract an audio chunk using FFmpeg
 */
export async function extractFFmpegChunk(
  inputPath: string,
  startTime: number,
  duration: number,
  outputPath: string
): Promise<void> {
  setupFFmpeg();
  const args = [
    '-i',
    inputPath,
    '-ss',
    startTime.toString(),
    '-t',
    duration.toString(),
    '-acodec',
    'libmp3lame',
    '-ab',
    '64k',
    '-ac',
    '1',
    '-ar',
    '16000',
    '-y',
    outputPath,
  ];

  await execFileAsync(configuredFFmpegPath, args);
}
