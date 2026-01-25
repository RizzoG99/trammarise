/**
 * Mock Audio Generator
 *
 * Generates mock audio buffers for testing without actual audio data.
 * Size calculations based on: 16kHz × 16bit × 1 channel = 32KB/s
 */

export interface MockAudioOptions {
  durationSeconds: number;
  sampleRate?: number;
  bitDepth?: number;
  channels?: number;
  format?: 'mp3' | 'wav' | 'm4a' | 'webm';
}

/**
 * Calculate buffer size for given duration
 * Formula: sampleRate * bitDepth/8 * channels * duration
 */
function calculateBufferSize(options: MockAudioOptions): number {
  const { durationSeconds, sampleRate = 16000, bitDepth = 16, channels = 1 } = options;
  const bytesPerSecond = (sampleRate * bitDepth * channels) / 8;
  return Math.floor(bytesPerSecond * durationSeconds);
}

/**
 * Generate mock audio buffer of specified duration
 */
export function generateMockAudio(options: MockAudioOptions): Buffer {
  const size = calculateBufferSize(options);
  const buffer = Buffer.alloc(size);

  // Fill with pseudo-random data to simulate audio
  // Use deterministic pattern for reproducibility in tests
  for (let i = 0; i < size; i++) {
    buffer[i] = (i * 7 + 13) % 256;
  }

  return buffer;
}

/**
 * Generate mock File object for browser-like environments
 */
export function generateMockFile(options: MockAudioOptions): File {
  const buffer = generateMockAudio(options);
  // Convert Buffer to Uint8Array for browser compatibility
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array], { type: `audio/${options.format || 'mp3'}` });
  const filename = `test-audio-${options.durationSeconds}s.${options.format || 'mp3'}`;

  return new File([blob], filename, {
    type: `audio/${options.format || 'mp3'}`,
    lastModified: Date.now(),
  });
}

// Pre-defined fixtures for common test scenarios
export const SHORT_AUDIO_60S = generateMockAudio({
  durationSeconds: 60,
  format: 'mp3',
});

export const MEDIUM_AUDIO_5MIN = generateMockAudio({
  durationSeconds: 5 * 60,
  format: 'mp3',
});

export const LONG_AUDIO_90MIN = generateMockAudio({
  durationSeconds: 90 * 60,
  format: 'mp3',
});

export const VERY_LONG_AUDIO_2H = generateMockAudio({
  durationSeconds: 120 * 60,
  format: 'wav',
});

/**
 * Calculate expected file size in MB for given duration
 */
export function getExpectedFileSizeMB(
  durationSeconds: number,
  format: 'mp3' | 'wav' = 'mp3'
): number {
  const options: MockAudioOptions = {
    durationSeconds,
    format,
    sampleRate: format === 'wav' ? 44100 : 16000,
    bitDepth: 16,
    channels: format === 'wav' ? 2 : 1,
  };

  const bytes = calculateBufferSize(options);
  return bytes / (1024 * 1024);
}

/**
 * Get human-readable size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
