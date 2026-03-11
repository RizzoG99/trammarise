/**
 * Audio Chunker Utility
 *
 * Handles mode-aware audio chunking using FFmpeg.
 * - Balanced: 3-minute chunks, no overlap
 * - Best Quality: 10-minute chunks, 15-second overlap
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { setupFFmpeg, ffprobeDuration, extractFFmpegChunk } from './ffmpeg-setup';
import type { ChunkMetadata, ChunkingResult, ProcessingMode } from '../_types/chunking';
import { CHUNKING_CONFIGS } from '../_types/chunking';

/**
 * Main chunking function: splits audio file into chunks based on processing mode
 */
export async function chunkAudio(
  audioBuffer: Buffer,
  filename: string,
  mode: ProcessingMode
): Promise<ChunkingResult> {
  setupFFmpeg();

  // Write audio buffer to temporary file
  const tempDir = '/tmp';
  const inputPath = path.join(tempDir, `input_${Date.now()}_${filename}`);

  try {
    await fs.writeFile(inputPath, audioBuffer);

    // Get audio duration
    const duration = await getAudioDuration(inputPath);
    console.log(`[Audio Chunker] Audio duration: ${duration.toFixed(2)}s, mode: ${mode}`);

    // Get chunking config for mode
    const config = CHUNKING_CONFIGS[mode];
    const { chunkDuration, overlapDuration } = config;

    // Calculate chunks
    const chunks: ChunkMetadata[] = [];
    let currentStart = 0;
    let chunkIndex = 0;

    // We do not need a while loop if duration is not defined?
    // the previous code was:
    // const chunks: ChunkMetadata[] = [];
    // let currentStart = 0;
    // let chunkIndex = 0;
    //
    // while (currentStart < duration) {
    //  ...
    //

    while (currentStart < duration) {
      const currentEnd = Math.min(currentStart + chunkDuration, duration);
      const actualDuration = currentEnd - currentStart;

      // Extract chunk to file
      const chunkFilename = `chunk_${chunkIndex}_${Date.now()}.mp3`;
      const chunkPath = path.join(tempDir, chunkFilename);

      await extractChunk(inputPath, currentStart, actualDuration, chunkPath);

      // Compute hash for idempotency
      const hash = await computeChunkHash(chunkPath);

      // Determine if chunk has overlap
      const hasOverlap = mode === 'best_quality' && currentEnd < duration;
      const overlapStartTime = hasOverlap ? currentEnd - overlapDuration : undefined;

      chunks.push({
        index: chunkIndex,
        startTime: currentStart,
        endTime: currentEnd,
        duration: actualDuration,
        hash,
        hasOverlap,
        overlapStartTime,
        filePath: chunkPath,
      });

      console.log(
        `[Audio Chunker] Created chunk ${chunkIndex}: ${currentStart.toFixed(2)}s - ${currentEnd.toFixed(2)}s (${actualDuration.toFixed(2)}s)${hasOverlap ? ` [overlap from ${overlapStartTime!.toFixed(2)}s]` : ''}`
      );

      // Move to next chunk
      // For overlapping chunks, step back by overlap duration
      currentStart = currentEnd - (hasOverlap ? overlapDuration : 0);
      chunkIndex++;
    }

    return {
      chunks,
      totalDuration: duration,
      mode,
      totalChunks: chunks.length,
    };
  } finally {
    // Clean up input file
    try {
      await fs.unlink(inputPath);
    } catch (error) {
      console.warn('[Audio Chunker] Failed to delete input file:', error);
    }
  }
}

/**
 * Get audio duration using ffprobe
 */
export async function getAudioDuration(filePath: string): Promise<number> {
  return ffprobeDuration(filePath);
}

/**
 * Extract a chunk from audio file using FFmpeg
 */
export async function extractChunk(
  inputPath: string,
  startTime: number,
  duration: number,
  outputPath: string
): Promise<void> {
  await extractFFmpegChunk(inputPath, startTime, duration, outputPath);
}

/**
 * Compute SHA-256 hash of chunk file for idempotency
 */
export async function computeChunkHash(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

/**
 * Clean up chunk files from /tmp directory
 */
export async function cleanupChunks(chunks: ChunkMetadata[]): Promise<void> {
  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        await fs.unlink(chunk.filePath);
      } catch (error) {
        console.warn(`[Audio Chunker] Failed to delete chunk ${chunk.index}:`, error);
      }
    })
  );
}

/**
 * Get chunk file size in bytes
 */
export async function getChunkSize(chunkPath: string): Promise<number> {
  const stats = await fs.stat(chunkPath);
  return stats.size;
}
