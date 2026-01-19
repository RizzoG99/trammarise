/**
 * Type definitions for test mocks
 */

import type { createMockFFprobe } from './mock-ffmpeg';

/**
 * Type for mocked fluent-ffmpeg module
 */
export interface MockFluentFFmpegStatic {
  (input?: string): MockFluentFFmpegCommand;
  setFfmpegPath: (path: string) => void;
  setFfprobePath: (path: string) => void;
  ffprobe: ReturnType<typeof createMockFFprobe>;
}

/**
 * Type for mocked fluent-ffmpeg command instance
 */
export interface MockFluentFFmpegCommand {
  input: (source: string) => MockFluentFFmpegCommand;
  seek: (seconds: number) => MockFluentFFmpegCommand;
  duration: (seconds: number) => MockFluentFFmpegCommand;
  save: (output: string) => MockFluentFFmpegCommand;
  on: (event: string, callback: (...args: unknown[]) => void) => MockFluentFFmpegCommand;
  audioCodec: (codec: string) => MockFluentFFmpegCommand;
  outputOptions: (options: string | string[]) => MockFluentFFmpegCommand;
}

/**
 * Type for the default export of fluent-ffmpeg module when mocked
 */
export interface MockFluentFFmpegModule {
  default: MockFluentFFmpegStatic;
}

/**
 * Type for chunk metadata arrays (used in tests)
 */
export interface MockChunkMetadata {
  index: number;
  startTime: number;
  duration: number;
  filePath: string;
  hash?: string;
}
