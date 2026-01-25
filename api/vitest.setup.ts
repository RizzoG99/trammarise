/**
 * Vitest Setup for API Tests
 *
 * Global setup, teardown, and mocks for API testing.
 */

import { beforeEach, afterEach, vi } from 'vitest';
import { MockOpenAIAPI } from './utils/__test-helpers__/mock-openai-api';

// CRITICAL: Mock fluent-ffmpeg BEFORE any imports
// Create hoisted factory for FFmpeg mock
const mockFFmpegFactory = vi.hoisted(() => {
  const ffprobeImpl = vi.fn((_path: string, callback: (err: unknown, data?: unknown) => void) => {
    // Default: return 60s duration
    callback(null, { format: { duration: 60 } });
  });

  const ffmpegConstructor = vi.fn(() => {
    const callbacks: Record<string, (() => void) | undefined> = {};
    let outputFilePath: string | undefined;

    const mockCommand = {
      input: vi.fn().mockReturnThis(),
      seekInput: vi.fn().mockReturnThis(),
      duration: vi.fn().mockReturnThis(),
      output: vi.fn((path: string) => {
        outputFilePath = path; // Capture output path
        return mockCommand;
      }),
      audioCodec: vi.fn().mockReturnThis(),
      outputOptions: vi.fn().mockReturnThis(),
      setStartTime: vi.fn().mockReturnThis(),
      setDuration: vi.fn().mockReturnThis(),
      audioBitrate: vi.fn().mockReturnThis(),
      audioChannels: vi.fn().mockReturnThis(),
      audioFrequency: vi.fn().mockReturnThis(),
      on: vi.fn((event: string, callback: () => void) => {
        callbacks[event] = callback;

        // Match the unit test pattern: schedule callback in on()
        if (event === 'end') {
          // Capture outputFilePath reference at callback registration time
          const capturedOutputPath = outputFilePath;
          setImmediate(() => {
            // Write file before calling callback
            const pathToUse = capturedOutputPath || outputFilePath;
            if (pathToUse) {
              // Create unique content based on file path to ensure different hashes
              const mockAudioBuffer = Buffer.from(`mock audio data for ${pathToUse}`);
              globalThis.mockFileSystem.files.set(pathToUse, mockAudioBuffer);
            }
            callback();
          });
        }

        return mockCommand;
      }),
      run: vi.fn(),
    };
    // Set all methods to return mockCommand for chaining
    (Object.keys(mockCommand) as Array<keyof typeof mockCommand>).forEach((key) => {
      const value = mockCommand[key];
      if (
        typeof value === 'function' &&
        key !== 'run' &&
        key !== 'on' &&
        key !== 'output' &&
        'mockReturnValue' in value
      ) {
        value.mockReturnValue(mockCommand);
      }
    });
    return mockCommand;
  }) as ReturnType<typeof vi.fn> & {
    ffprobe: ReturnType<typeof vi.fn>;
    setFfmpegPath: ReturnType<typeof vi.fn>;
    setFfprobePath: ReturnType<typeof vi.fn>;
  };

  // Attach static methods
  ffmpegConstructor.ffprobe = ffprobeImpl;
  ffmpegConstructor.setFfmpegPath = vi.fn();
  ffmpegConstructor.setFfprobePath = vi.fn();

  return ffmpegConstructor;
});

// Export mock for tests that need direct access
export const mockFFmpeg = mockFFmpegFactory;

// Mock the module with hoisted factory
vi.mock('fluent-ffmpeg', () => {
  const factory = mockFFmpegFactory;
  return {
    default: factory,
    ffprobe: factory.ffprobe,
  };
});

// CRITICAL: Mock fs/promises to avoid ESM module spy issues
// Create in-memory file system for tests
const mockFileSystem = vi.hoisted(() => {
  const files = new Map<string, Buffer>();

  return {
    files,
    readFile: vi.fn(async (path: string) => {
      const data = files.get(path);
      if (!data) {
        const error: NodeJS.ErrnoException = new Error(
          `ENOENT: no such file or directory, open '${path}'`
        );
        error.code = 'ENOENT';
        throw error;
      }
      return data;
    }),
    writeFile: vi.fn(async (path: string, data: Buffer | string) => {
      const buffer = typeof data === 'string' ? Buffer.from(data) : data;
      files.set(path, buffer);
    }),
    unlink: vi.fn(async (path: string) => {
      files.delete(path);
    }),
    mkdir: vi.fn(async () => {}),
    stat: vi.fn(async (path: string) => {
      const data = files.get(path);
      if (!data) {
        const error: NodeJS.ErrnoException = new Error(
          `ENOENT: no such file or directory, stat '${path}'`
        );
        error.code = 'ENOENT';
        throw error;
      }
      return { size: data.length };
    }),
  };
});

vi.mock('fs/promises', () => mockFileSystem);

// Also mock 'fs' module with promises export (used by audio-chunker.ts)
vi.mock('fs', () => ({
  promises: mockFileSystem,
}));

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key-12345';
process.env.NODE_ENV = 'test';

// Global mock instances
let mockOpenAI: MockOpenAIAPI = new MockOpenAIAPI();

// Setup before each test
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Create fresh OpenAI mock
  mockOpenAI = new MockOpenAIAPI();
  global.fetch = mockOpenAI.createMockFetch();

  // Reset mock file system
  mockFileSystem.files.clear();

  // Use fake timers for precise time control with Date.now() advancement
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

// Cleanup after each test
afterEach(() => {
  // Clear all timers
  vi.clearAllTimers();

  // Restore real timers
  vi.useRealTimers();

  // Reset OpenAI mock
  if (mockOpenAI) {
    mockOpenAI.reset();
  }
});

// Export utilities for tests to use
export { mockOpenAI, mockFileSystem };

// Make mock instances available globally for convenience
declare global {
  var mockOpenAI: MockOpenAIAPI;
  var mockFileSystem: {
    files: Map<string, Buffer>;
    readFile: ReturnType<typeof vi.fn>;
    writeFile: ReturnType<typeof vi.fn>;
    unlink: ReturnType<typeof vi.fn>;
    mkdir: ReturnType<typeof vi.fn>;
    stat: ReturnType<typeof vi.fn>;
  };
  var mockFFmpeg: typeof mockFFmpegFactory;
}

globalThis.mockOpenAI = mockOpenAI;
globalThis.mockFileSystem = mockFileSystem;
globalThis.mockFFmpeg = mockFFmpegFactory;
