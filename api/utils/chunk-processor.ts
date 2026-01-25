/**
 * Chunk Processor
 *
 * Handles individual chunk transcription with:
 * - Retry logic with mode-aware max retries
 * - Auto-split on failure (90s/300s sub-chunks)
 * - Job-level safeguards (max 20 retries, 2 splits)
 */

import { promises as fs } from 'fs';
import type { ChunkMetadata } from '../types/chunking';
import type { TranscriptionJob, JobStatus } from '../types/job';
import { JOB_SAFEGUARDS } from '../types/job';
import { CHUNKING_CONFIGS, AUTO_SPLIT_CONFIG } from '../types/chunking';
import { RateLimitGovernor } from './rate-limit-governor';
import { extractChunk, computeChunkHash } from './audio-chunker';

/**
 * Configuration for Whisper API transcription
 */
interface TranscriptionConfig {
  model?: string;
  language?: string;
  [key: string]: unknown;
}

/**
 * Process a single chunk with retry and auto-split logic
 */
export async function processChunk(
  chunk: ChunkMetadata,
  job: TranscriptionJob,
  governor: RateLimitGovernor,
  transcribeFunction: (chunkPath: string, config: TranscriptionConfig) => Promise<string>
): Promise<string> {
  const config = CHUNKING_CONFIGS[job.config.mode];
  if (!chunk) {
    throw new Error('Chunk is undefined');
  }
  const chunkStatus = job.chunkStatuses?.[chunk.index];

  console.log(`[Chunk Processor] Processing chunk ${chunk.index} (${chunk.duration.toFixed(2)}s)`);

  if (!chunkStatus) {
    throw new Error(`Chunk status not found for index ${chunk.index} in job ${job.jobId}`);
  }

  // Try transcribing with retries
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    // Check if job was cancelled before each attempt
    if (job.status === 'cancelled') {
      console.log(`[Chunk Processor] Job ${job.jobId} cancelled, aborting chunk ${chunk.index}`);
      throw new Error('Job was cancelled by user');
    }
    try {
      // Update status
      chunkStatus.status = attempt === 1 ? 'in_progress' : 'retrying';
      chunkStatus.retryCount = attempt - 1;
      chunkStatus.lastUpdated = new Date();

      console.log(
        `[Chunk Processor] Attempt ${attempt}/${config.maxRetries} for chunk ${chunk.index}`
      );

      // Enqueue request with rate governor
      const transcript = await governor.enqueue(
        `chunk_${job.jobId}_${chunk.index}_${attempt}`,
        job.jobId,
        chunk.index,
        () => transcribeFunction(chunk.filePath, job.config as unknown as TranscriptionConfig),
        chunk.index // Priority based on chunk order
      );

      // Check if job was cancelled during the async operation
      if ((job.status as JobStatus) === 'cancelled') {
        console.log(
          `[Chunk Processor] Job ${job.jobId} cancelled during transcription of chunk ${chunk.index}`
        );
        throw new Error('Job was cancelled by user');
      }

      console.log(`[Chunk Processor] Successfully transcribed chunk ${chunk.index}`);

      return transcript;
    } catch (error: unknown) {
      const err = error as Error;
      console.warn(
        `[Chunk Processor] Attempt ${attempt} failed for chunk ${chunk.index}:`,
        err.message
      );

      // If this was the last retry, fall through to auto-split
      if (attempt === config.maxRetries) {
        console.warn(
          `[Chunk Processor] All retries exhausted for chunk ${chunk.index}, attempting auto-split`
        );
        break;
      }

      // Otherwise continue to next retry
      continue;
    }
  }

  // All retries failed, try auto-split
  return await autoSplitAndProcess(chunk, job, governor, transcribeFunction);
}

/**
 * Auto-split a chunk into smaller sub-chunks and process them
 */
async function autoSplitAndProcess(
  chunk: ChunkMetadata,
  job: TranscriptionJob,
  governor: RateLimitGovernor,
  transcribeFunction: (chunkPath: string, config: TranscriptionConfig) => Promise<string>
): Promise<string> {
  // Check job-level safeguards
  if (job.chunkingSplits >= JOB_SAFEGUARDS.MAX_SPLITS) {
    throw new Error(
      `Job ${job.jobId}: Maximum splits (${JOB_SAFEGUARDS.MAX_SPLITS}) exceeded. Aborting.`
    );
  }

  if (job.totalRetries >= JOB_SAFEGUARDS.MAX_TOTAL_RETRIES) {
    throw new Error(
      `Job ${job.jobId}: Maximum total retries (${JOB_SAFEGUARDS.MAX_TOTAL_RETRIES}) exceeded. Aborting.`
    );
  }

  console.log(
    `[Chunk Processor] Auto-splitting chunk ${chunk.index} (${chunk.duration.toFixed(2)}s)`
  );

  // Update status
  const chunkStatus = job.chunkStatuses[chunk.index];
  chunkStatus.status = 'splitting';
  chunkStatus.wasSplit = true;
  chunkStatus.lastUpdated = new Date();

  // Increment job-level split counter
  job.chunkingSplits++;

  // Determine sub-chunk duration based on mode
  const subChunkDuration =
    job.config.mode === 'balanced'
      ? AUTO_SPLIT_CONFIG.BALANCED_SUBCHUNK_DURATION
      : AUTO_SPLIT_CONFIG.BEST_QUALITY_SUBCHUNK_DURATION;

  // Create sub-chunks
  const subChunks: ChunkMetadata[] = [];
  const numSubChunks = Math.ceil(chunk.duration / subChunkDuration);

  for (let i = 0; i < numSubChunks; i++) {
    const subStart = chunk.startTime + i * subChunkDuration;
    const subEnd = Math.min(subStart + subChunkDuration, chunk.endTime);
    const subDuration = subEnd - subStart;

    // Extract sub-chunk
    const subChunkPath = `/tmp/subchunk_${job.jobId}_${chunk.index}_${i}_${Date.now()}.mp3`;

    await extractChunk(
      chunk.filePath,
      i * subChunkDuration, // Relative to chunk start
      subDuration,
      subChunkPath
    );

    const hash = await computeChunkHash(subChunkPath);

    subChunks.push({
      index: i,
      startTime: subStart,
      endTime: subEnd,
      duration: subDuration,
      hash,
      hasOverlap: false,
      filePath: subChunkPath,
    });

    console.log(
      `[Chunk Processor] Created sub-chunk ${i}/${numSubChunks - 1}: ${subStart.toFixed(2)}s - ${subEnd.toFixed(2)}s`
    );
  }

  // Process sub-chunks
  const subTranscripts: string[] = [];

  for (const subChunk of subChunks) {
    // Check if job was cancelled before processing sub-chunk
    if (job.status === 'cancelled') {
      console.log(`[Chunk Processor] Job ${job.jobId} cancelled, aborting sub-chunk processing`);
      await cleanupSubChunks(subChunks);
      throw new Error('Job was cancelled by user');
    }

    try {
      const transcript = await governor.enqueue(
        `subchunk_${job.jobId}_${chunk.index}_${subChunk.index}`,
        job.jobId,
        chunk.index,
        () => transcribeFunction(subChunk.filePath, job.config as unknown as TranscriptionConfig),
        1000 + chunk.index // Higher priority for sub-chunks
      );

      subTranscripts.push(transcript);
      job.totalRetries++; // Count sub-chunk attempts

      console.log(`[Chunk Processor] Sub-chunk ${subChunk.index} transcribed successfully`);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`[Chunk Processor] Sub-chunk ${subChunk.index} failed:`, err.message);

      // Clean up sub-chunk files
      await cleanupSubChunks(subChunks);

      throw new Error(
        `Failed to transcribe sub-chunk ${subChunk.index} of chunk ${chunk.index}: ${err.message}`
      );
    }
  }

  // Clean up sub-chunk files
  await cleanupSubChunks(subChunks);

  // Merge sub-chunk transcripts
  const mergedTranscript = subTranscripts.join(' ');

  console.log(
    `[Chunk Processor] Successfully processed chunk ${chunk.index} via auto-split (${subChunks.length} sub-chunks)`
  );

  return mergedTranscript;
}

/**
 * Clean up sub-chunk files
 */
async function cleanupSubChunks(subChunks: ChunkMetadata[]): Promise<void> {
  await Promise.all(
    subChunks.map(async (subChunk) => {
      try {
        await fs.unlink(subChunk.filePath);
      } catch (error) {
        console.warn(`[Chunk Processor] Failed to delete sub-chunk ${subChunk.index}:`, error);
      }
    })
  );
}

/**
 * Create a transcription function that calls OpenAI Whisper API
 */
export function createTranscribeFunction(apiKey: string) {
  return async (chunkPath: string, config: TranscriptionConfig): Promise<string> => {
    // TypeScript definitions for form-data reflect CommonJS "export =",
    // but Node.js ESM interop wraps it in a "default" export.
    // We cast to match the runtime behavior.
    const FormData = (
      (await import('form-data')) as unknown as { default: typeof import('form-data') }
    ).default;
    const fetch = (await import('node-fetch')).default;

    const formData = new FormData();
    const fileBuffer = await fs.readFile(chunkPath);

    formData.append('file', fileBuffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg',
    });
    formData.append('model', config.model || 'whisper-1');

    if (config.language) {
      formData.append('language', config.language);
    }

    if (config.temperature !== undefined && config.temperature !== null) {
      formData.append('temperature', config.temperature.toString());
    }

    if (config.prompt) {
      formData.append('prompt', config.prompt);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: formData as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const result = (await response.json()) as { text?: string };
    return result.text || '';
  };
}
