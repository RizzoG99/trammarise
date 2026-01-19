/**
 * Mock FFmpeg
 *
 * Mocks fluent-ffmpeg and related utilities for testing.
 * Avoids actual FFmpeg execution while simulating correct behavior.
 */

import { vi } from 'vitest';
import { generateMockAudio } from './mock-audio-generator';

export interface MockFFmpegConfig {
  /** Default audio duration for probe results */
  defaultDuration?: number;
  /** Map of file paths to their durations */
  fileDurations?: Map<string, number>;
  /** Should ffprobe fail? */
  shouldProbeFail?: boolean;
  /** Should chunk extraction fail? */
  shouldExtractFail?: boolean;
  /** Delay in ms for ffmpeg operations */
  operationDelay?: number;
}

export type MockFFmpegInstance = ReturnType<typeof createMockFFmpeg>;

export class MockFFmpeg {
  private config: MockFFmpegConfig = {};
  private currentInput = '';
  private currentSeek = 0;
  private currentDuration = 0;
  private currentOutput = '';
  private callbacks: Map<string, (...args: unknown[]) => void> = new Map();

  constructor(config?: MockFFmpegConfig) {
    if (config) {
      this.config = { ...config };
    }
  }

  input(inputPath: string): this {
    this.currentInput = inputPath;
    return this;
  }

  seekInput(seconds: number): this {
    this.currentSeek = seconds;
    return this;
  }

  duration(seconds: number): this {
    this.currentDuration = seconds;
    return this;
  }

  output(outputPath: string): this {
    this.currentOutput = outputPath;
    return this;
  }

  audioCodec(): this {
    return this;
  }

  outputOptions(): this {
    return this;
  }

  on(event: string, callback: (...args: unknown[]) => void): this {
    this.callbacks.set(event, callback);
    return this;
  }

  async run(): Promise<void> {
    if (this.config.shouldExtractFail) {
      const errorCallback = this.callbacks.get('error');
      if (errorCallback) {
        errorCallback(new Error('Mock FFmpeg extraction failed'));
      }
      throw new Error('Mock FFmpeg extraction failed');
    }

    // Simulate operation delay
    if (this.config.operationDelay) {
      await new Promise((resolve) => setTimeout(resolve, this.config.operationDelay));
    }

    // Generate mock chunk file
    const chunkDuration = this.currentDuration || 180; // Default 3min
    const mockBuffer = generateMockAudio({
      durationSeconds: chunkDuration,
      format: 'mp3',
    });

    // Write to mock filesystem (handled by fs/promises mock)
    const fs = await import('fs/promises');
    await fs.writeFile(this.currentOutput, mockBuffer);

    // Call end callback
    const endCallback = this.callbacks.get('end');
    if (endCallback) {
      endCallback();
    }
  }
}

/**
 * Create mock ffprobe function
 */
interface FFprobeData {
  format: {
    duration: number;
  };
}

export function createMockFFprobe(config: MockFFmpegConfig = {}) {
  return vi.fn((filePath: string, callback: (err: Error | null, data?: FFprobeData) => void) => {
    if (config.shouldProbeFail) {
      callback(new Error('Mock ffprobe failed'));
      return;
    }

    // Get duration from config or use default
    const duration = config.fileDurations?.get(filePath) || config.defaultDuration || 180;

    const probeData = {
      format: {
        duration: duration.toString(),
        size: (duration * 32000).toString(), // 32KB/s
        bit_rate: '128000',
        format_name: 'mp3',
      },
      streams: [
        {
          codec_type: 'audio',
          codec_name: 'mp3',
          sample_rate: '16000',
          channels: 1,
          duration: duration.toString(),
        },
      ],
    };

    callback(null, probeData);
  });
}

/**
 * Create complete fluent-ffmpeg mock
 */
export function createMockFluentFFmpeg(config: MockFFmpegConfig = {}) {
  const mockFFmpeg = new MockFFmpeg(config);

  const fluentFfmpegMock = vi.fn(() => mockFFmpeg);

  // Add static methods
  (
    fluentFfmpegMock as typeof fluentFfmpegMock & {
      setFfmpegPath: ReturnType<typeof vi.fn>;
      setFfprobePath: ReturnType<typeof vi.fn>;
      ffprobe: ReturnType<typeof createMockFFprobe>;
    }
  ).setFfmpegPath = vi.fn();
  (
    fluentFfmpegMock as typeof fluentFfmpegMock & {
      setFfmpegPath: ReturnType<typeof vi.fn>;
      setFfprobePath: ReturnType<typeof vi.fn>;
      ffprobe: ReturnType<typeof createMockFFprobe>;
    }
  ).setFfprobePath = vi.fn();
  (
    fluentFfmpegMock as typeof fluentFfmpegMock & {
      setFfmpegPath: ReturnType<typeof vi.fn>;
      setFfprobePath: ReturnType<typeof vi.fn>;
      ffprobe: ReturnType<typeof createMockFFprobe>;
    }
  ).ffprobe = createMockFFprobe(config);

  return fluentFfmpegMock;
}

/**
 * Setup global FFmpeg mocks for vitest
 */
export function setupFFmpegMocks(config: MockFFmpegConfig = {}) {
  // Mock fluent-ffmpeg
  vi.mock('fluent-ffmpeg', () => ({
    default: createMockFluentFFmpeg(config),
  }));

  // Mock ffmpeg/ffprobe installers
  vi.mock('@ffmpeg-installer/ffmpeg', () => ({
    path: '/mock/ffmpeg',
  }));

  vi.mock('@ffprobe-installer/ffprobe', () => ({
    path: '/mock/ffprobe',
  }));
}

/**
 * Create mock for audio duration extraction
 */
export function createMockGetAudioDuration(fileDurations: Map<string, number>) {
  return async (filePath: string): Promise<number> => {
    const duration = fileDurations.get(filePath);
    if (duration === undefined) {
      throw new Error(`No mock duration configured for ${filePath}`);
    }
    return duration;
  };
}

/**
 * Mock file system operations related to FFmpeg
 */
export function setupFFmpegFileSystemMocks() {
  const mockFS = new Map<string, Buffer>();

  vi.mock('fs/promises', () => ({
    readFile: vi.fn(async (path: string) => {
      const data = mockFS.get(path);
      if (!data) {
        throw new Error(`ENOENT: no such file or directory, open '${path}'`);
      }
      return data;
    }),
    writeFile: vi.fn(async (path: string, data: Buffer | string) => {
      const buffer = typeof data === 'string' ? Buffer.from(data) : data;
      mockFS.set(path, buffer);
    }),
    unlink: vi.fn(async (path: string) => {
      mockFS.delete(path);
    }),
    mkdir: vi.fn(async () => {}),
  }));

  return {
    getFile: (path: string) => mockFS.get(path),
    setFile: (path: string, data: Buffer) => mockFS.set(path, data),
    clear: () => mockFS.clear(),
    size: () => mockFS.size,
  };
}

/**
 * Helper to verify FFmpeg command construction
 */
export function createFFmpegCommandCapture() {
  const commands: Array<{
    input: string;
    output: string;
    seek?: number;
    duration?: number;
    options?: string[];
  }> = [];

  const captureFFmpeg = vi.fn((input?: string) => {
    const command = {
      input: input || '',
      output: '',
      seek: undefined as number | undefined,
      duration: undefined as number | undefined,
      options: [] as string[],
    };

    const mock = {
      input: vi.fn((path: string) => {
        command.input = path;
        return mock;
      }),
      seekInput: vi.fn((seconds: number) => {
        command.seek = seconds;
        return mock;
      }),
      duration: vi.fn((seconds: number) => {
        command.duration = seconds;
        return mock;
      }),
      output: vi.fn((path: string) => {
        command.output = path;
        return mock;
      }),
      audioCodec: vi.fn(() => mock),
      outputOptions: vi.fn((opts: string | string[]) => {
        command.options = Array.isArray(opts) ? opts : [opts];
        return mock;
      }),
      on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
        if (event === 'end') {
          setTimeout(callback, 0);
        }
        return mock;
      }),
      run: vi.fn(() => {
        commands.push({ ...command });
      }),
    };

    return mock;
  });

  return {
    ffmpeg: captureFFmpeg,
    getCommands: () => commands,
    getLastCommand: () => commands[commands.length - 1],
    clear: () => commands.splice(0),
  };
}
