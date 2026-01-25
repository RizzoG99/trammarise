import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { AUDIO_CONSTANTS } from './constants';

const {
  TRANSCODE_BITRATE,
  CHUNK_SIZE_LIMIT,
  SEGMENT_TIME_SECONDS,
  MAX_AUDIO_DURATION_MINI_MODEL,
  MAX_AUDIO_DURATION_SECONDS,
} = AUDIO_CONSTANTS;

/**
 * Safely extracts error message from unknown error types.
 * Handles Error objects, strings, and objects with message property.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error';
}

/**
 * Get audio duration using Web Audio API
 * @param file - Audio file to analyze
 * @returns Duration in seconds
 */
export async function getAudioDuration(file: File | Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(audio.duration);
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load audio metadata'));
    });

    audio.src = objectUrl;
  });
}

const CDN_SOURCES = [
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd', // jsDelivr CDN (better CORS support)
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd', // unpkg CDN fallback
] as const;

let ffmpeg: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

async function loadFFmpegWithRetry(
  instance: FFmpeg,
  baseURL: string,
  timeout: number = 30000, // 30s timeout for debugging (was 120s)
  maxAttempts: number = 2
): Promise<void> {
  let lastError: Error | null = null;

  // Check if SharedArrayBuffer is available (required for FFmpeg.wasm)
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error(
      'SharedArrayBuffer is not available. This is required for FFmpeg.wasm.\n' +
        'Possible causes:\n' +
        '1. Browser headers not set (COOP/COEP). Did you restart the dev server?\n' +
        '2. Using HTTP instead of HTTPS in production\n' +
        "3. Browser doesn't support SharedArrayBuffer\n\n" +
        'Solution: Restart your dev server and hard refresh the browser.'
    );
  }

  console.log('✅ SharedArrayBuffer is available');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `Attempting to load FFmpeg from: ${baseURL}/ffmpeg-core.js (attempt ${attempt}/${maxAttempts})`
      );

      const loadPromise = instance.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout loading from ${baseURL}`)), timeout)
      );

      await Promise.race([loadPromise, timeoutPromise]);
      console.log(`FFmpeg loaded successfully from: ${baseURL} on attempt ${attempt}`);
      return; // Success!
    } catch (error) {
      console.error(
        `Failed to load FFmpeg from ${baseURL} (attempt ${attempt}/${maxAttempts}):`,
        error
      );
      lastError = error as Error;

      if (attempt < maxAttempts) {
        console.log('Retrying in 2 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay between retries
      }
    }
  }

  // All attempts failed
  throw new Error(
    `Failed to load FFmpeg after ${maxAttempts} attempts. Last error: ${lastError?.message}. ` +
      `Please check your internet connection or try again later.`
  );
}

async function loadFFmpegWithFallback(instance: FFmpeg, timeout: number = 120000): Promise<void> {
  for (const baseURL of CDN_SOURCES) {
    try {
      await loadFFmpegWithRetry(instance, baseURL, timeout, 2); // 2 attempts per CDN
      return; // Success!
    } catch (error) {
      console.error(`All attempts failed for ${baseURL}:`, error);
      // Continue to next CDN if available
    }
  }

  // All CDNs failed
  throw new Error(
    `Failed to load FFmpeg from all CDN sources. Please check your internet connection or try again later.`
  );
}

async function getFFmpeg(): Promise<FFmpeg> {
  // If ffmpeg is already loaded, return it
  if (ffmpeg) return ffmpeg;

  // If ffmpeg is currently loading, wait for that promise
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  // Start loading ffmpeg and store the promise
  ffmpegLoadPromise = (async () => {
    try {
      const instance = new FFmpeg();
      await loadFFmpegWithFallback(instance, 120000); // 120s per attempt, 2 attempts
      ffmpeg = instance;
      return instance;
    } catch (error) {
      const message = getErrorMessage(error);
      console.error('FFmpeg loading failed:', error);
      throw new Error(`Failed to load audio processor: ${message}`);
    }
  })();

  try {
    return await ffmpegLoadPromise;
  } finally {
    // Clear the loading promise after completion (success or failure)
    ffmpegLoadPromise = null;
  }
}

/**
 * Compress audio file to MP3 128kbps
 */
export async function compressAudio(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    const ffmpeg = await getFFmpeg();
    const inputName = 'input' + getExtension(file.name);
    const outputName = 'output.mp3';

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        onProgress(Math.round(progress * 100));
      });
    }

    // Convert to MP3
    await ffmpeg.exec([
      '-i',
      inputName,
      '-b:a',
      TRANSCODE_BITRATE,
      '-map',
      '0:a', // Map audio only
      outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);

    // Cleanup
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    // Ensure data is Uint8Array (ffmpeg.readFile returns FileData which can be Uint8Array or string)
    const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(0);
    // Wrap in new Uint8Array to ensure ArrayBuffer (not SharedArrayBuffer) backing
    return new Blob([new Uint8Array(uint8Data)], { type: 'audio/mp3' });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Audio compression failed:', error);
    throw new Error(
      `Audio compression failed: ${message}. Your file may be corrupted or unsupported.`
    );
  }
}

/**
 * Split audio into chunks if larger than limit
 * Handles any audio format (M4A, MP3, WAV, etc.) and outputs chunks in same format
 *
 * @param file - The audio file to chunk
 * @param forceChunk - If true, chunk regardless of file size (for duration-based chunking)
 */
export async function chunkAudio(file: Blob | File, forceChunk: boolean = false): Promise<Blob[]> {
  // Only skip chunking if file is small AND we're not forcing chunking
  if (!forceChunk && file.size <= CHUNK_SIZE_LIMIT) {
    return [file];
  }

  try {
    const ffmpeg = await getFFmpeg();

    // Detect input format from file type or name
    let inputExt = '.mp3';
    if (file instanceof File) {
      const match = file.name.match(/\.[^/.]+$/);
      inputExt = match ? match[0] : '.mp3';
    } else if (file.type) {
      // Map MIME type to extension
      const mimeToExt: Record<string, string> = {
        'audio/mp3': '.mp3',
        'audio/mpeg': '.mp3',
        'audio/x-m4a': '.m4a',
        'audio/m4a': '.m4a',
        'audio/mp4': '.m4a',
        'audio/wav': '.wav',
        'audio/webm': '.webm',
      };
      inputExt = mimeToExt[file.type] || '.mp3';
    }

    const inputName = `input${inputExt}`;
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Split audio into 20-minute segments using -c copy (no re-encoding)
    await ffmpeg.exec([
      '-i',
      inputName,
      '-f',
      'segment',
      '-segment_time',
      SEGMENT_TIME_SECONDS.toString(),
      '-c',
      'copy',
      `chunk%03d${inputExt}`, // Output chunks in same format as input
    ]);

    // Read chunks
    const chunks: Blob[] = [];
    const mimeType = file.type || 'audio/mp3';
    let i = 0;
    while (true) {
      const chunkName = `chunk${i.toString().padStart(3, '0')}${inputExt}`;
      try {
        const data = await ffmpeg.readFile(chunkName);
        // Ensure data is Uint8Array
        const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(0);
        // Wrap in new Uint8Array to ensure ArrayBuffer (not SharedArrayBuffer) backing
        chunks.push(new Blob([new Uint8Array(uint8Data)], { type: mimeType }));
        await ffmpeg.deleteFile(chunkName);
        console.log(`✅ Chunk ${i} created: ${(uint8Data.length / 1024 / 1024).toFixed(2)}MB`);
        i++;
      } catch (error) {
        // Check if this is expected end (no more chunks) or actual error
        if (i === 0) {
          console.error('Failed to create any chunks:', error);
          throw new Error('Audio chunking failed: No chunks created');
        }
        console.log(`✅ Chunking complete: ${i} chunks created`);
        break; // Expected end - no more chunks
      }
    }

    await ffmpeg.deleteFile(inputName);
    return chunks;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Audio chunking failed:', error);
    throw new Error(`Audio chunking failed: ${message}. Your file may be too large or corrupted.`);
  }
}

/**
 * Process large audio file: Check duration -> Compress (if needed) -> Chunk (if needed)
 */
export async function processLargeAudio(
  file: File,
  model?: string,
  onProgress?: (step: string, progress: number) => void
): Promise<Blob[]> {
  console.log(
    `Processing audio: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`
  );

  // CRITICAL: Check audio duration first (OpenAI limit is 1400s for both models)
  let duration: number;
  try {
    duration = await getAudioDuration(file);
    console.log(`Audio duration: ${duration.toFixed(1)}s (${(duration / 60).toFixed(1)} min)`);
  } catch (error) {
    console.warn('Failed to get audio duration, will proceed and let API validate:', error);
    duration = 0; // Will fall back to size-based logic
  }

  // Get model-specific limits
  const isMiniModel = model === 'gpt-4o-mini-transcribe';
  const maxDuration = isMiniModel
    ? MAX_AUDIO_DURATION_MINI_MODEL // 900s (15 min) for mini model
    : MAX_AUDIO_DURATION_SECONDS; // 1400s (23 min) for full model

  // Fallback threshold: if duration detection fails (duration === 0),
  // chunk conservatively based on file size
  const fallbackSizeThreshold = isMiniModel
    ? 10 * 1024 * 1024 // 10MB for mini model (conservative)
    : CHUNK_SIZE_LIMIT; // 22MB for full model

  console.log(`📊 Model: ${model || 'gpt-4o-transcribe'}, max duration: ${maxDuration}s`);

  // IMPORTANT: Only chunk if file SIZE requires it (>= 22MB)
  // For small files with long duration, send to API and let auto-retry handle it
  // This avoids loading 30MB+ FFmpeg library from CDN
  const needsChunkingBySize = file.size >= CHUNK_SIZE_LIMIT;

  // CRITICAL: If duration detection failed (duration === 0) and file size exceeds
  // fallback threshold, chunk anyway to prevent API errors
  const needsChunkingByFallback = duration === 0 && file.size >= fallbackSizeThreshold;

  // Duration warning for small files (won't chunk, but will use API auto-retry)
  if (duration > 0 && duration > maxDuration && file.size < CHUNK_SIZE_LIMIT) {
    console.log(
      `⚠️ Audio duration ${duration.toFixed(1)}s exceeds ${maxDuration}s limit for ${model || 'gpt-4o-transcribe'}`
    );
    console.log(
      `✅ File size is small (${(file.size / 1024 / 1024).toFixed(2)}MB < 22MB) - sending directly to API`
    );
    console.log(`📊 API will auto-retry with larger model (gpt-4o-transcribe) if needed`);
  }

  if (!needsChunkingBySize && !needsChunkingByFallback) {
    console.log(
      `✅ File is under limits (duration: ${duration.toFixed(1)}s, size: ${(file.size / 1024 / 1024).toFixed(2)}MB) - sending directly to Whisper`
    );
    if (onProgress) {
      onProgress('compressing', 100);
      onProgress('chunking', 100);
    }
    return [file];
  }

  // File needs chunking - log reason
  if (needsChunkingBySize) {
    console.log(
      `⚠️ File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds ${(CHUNK_SIZE_LIMIT / 1024 / 1024).toFixed(2)}MB limit - FFmpeg chunking required`
    );
  }
  if (needsChunkingByFallback) {
    console.log(
      `⚠️ Audio duration detection failed (duration: ${duration}s), using fallback chunking strategy`
    );
    console.log(
      `📊 Fallback size threshold: ${(fallbackSizeThreshold / 1024 / 1024).toFixed(2)}MB (file is ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    );
    console.log('✅ Chunking audio into 20-minute segments for safety');
  }

  try {
    // Optimize: Only compress if file size is large
    // For duration-only issues with reasonable file sizes, chunk directly
    let fileToChunk: Blob = file;

    if (needsChunkingBySize) {
      // File is too large - compress to MP3 first
      if (onProgress) onProgress('compressing', 0);
      fileToChunk = await compressAudio(file, (p) => {
        if (onProgress) onProgress('compressing', p);
      });
      console.log(`Compression complete: ${(fileToChunk.size / 1024 / 1024).toFixed(2)}MB`);
    } else {
      // File size is OK, just needs duration chunking - skip compression
      console.log('✅ File size is acceptable - skipping compression, chunking directly');
      if (onProgress) onProgress('compressing', 100);
    }

    // Chunk the file (original or compressed)
    // Force chunking since we've determined it's needed (by duration, size, or fallback)
    if (onProgress) onProgress('chunking', 0);
    const chunks = await chunkAudio(fileToChunk, true); // forceChunk = true
    if (onProgress) onProgress('chunking', 100);

    console.log(`Processing complete: ${chunks.length} chunk(s)`);
    return chunks;
  } catch (error) {
    console.error('FFmpeg processing failed:', error);
    throw error;
  }
}

function getExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0] : '.wav'; // Default to wav if unknown
}
