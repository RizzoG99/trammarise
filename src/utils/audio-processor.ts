import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { AUDIO_CONSTANTS } from './constants';

const { TRANSCODE_BITRATE, CHUNK_SIZE_LIMIT, SEGMENT_TIME_SECONDS } = AUDIO_CONSTANTS;

const CDN_SOURCES = [
  '/ffmpeg',  // Local files (fastest, most reliable)
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',  // Fallback CDN
] as const;

let ffmpeg: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

async function loadFFmpegWithRetry(
  instance: FFmpeg,
  baseURL: string,
  timeout: number = 30000,  // 30s timeout for debugging (was 120s)
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
      '3. Browser doesn\'t support SharedArrayBuffer\n\n' +
      'Solution: Restart your dev server and hard refresh the browser.'
    );
  }

  console.log('✅ SharedArrayBuffer is available');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempting to load FFmpeg from: ${baseURL}/ffmpeg-core.js (attempt ${attempt}/${maxAttempts})`);

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
      console.error(`Failed to load FFmpeg from ${baseURL} (attempt ${attempt}/${maxAttempts}):`, error);
      lastError = error as Error;

      if (attempt < maxAttempts) {
        console.log('Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between retries
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
      const err = error as { message?: string };
      console.error('FFmpeg loading failed:', error);
      throw new Error(`Failed to load audio processor: ${err.message || 'Unknown error'}`);
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
export async function compressAudio(file: File, onProgress?: (progress: number) => void): Promise<Blob> {
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
      '-i', inputName,
      '-b:a', TRANSCODE_BITRATE,
      '-map', '0:a', // Map audio only
      outputName
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
    const err = error as { message?: string };
    console.error('Audio compression failed:', error);
    throw new Error(`Audio compression failed: ${err.message || 'Unknown error'}. Your file may be corrupted or unsupported.`);
  }
}

/**
 * Split audio into chunks if larger than limit
 */
export async function chunkAudio(file: Blob): Promise<Blob[]> {
  if (file.size <= CHUNK_SIZE_LIMIT) {
    return [file];
  }

  try {
    const ffmpeg = await getFFmpeg();
    const inputName = 'large_input.mp3';

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Split audio into segments
    // Assuming 128kbps = ~1MB/min, 24MB = ~24 mins. Let's split every 20 mins to be safe.
    await ffmpeg.exec([
      '-i', inputName,
      '-f', 'segment',
      '-segment_time', SEGMENT_TIME_SECONDS.toString(),
      '-c', 'copy',
      'chunk%03d.mp3'
    ]);

    // Read chunks
    const chunks: Blob[] = [];
    let i = 0;
    while (true) {
      const chunkName = `chunk${i.toString().padStart(3, '0')}.mp3`;
      try {
        const data = await ffmpeg.readFile(chunkName);
        // Ensure data is Uint8Array
        const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(0);
        // Wrap in new Uint8Array to ensure ArrayBuffer (not SharedArrayBuffer) backing
        chunks.push(new Blob([new Uint8Array(uint8Data)], { type: 'audio/mp3' }));
        await ffmpeg.deleteFile(chunkName);
        i++;
      } catch {
        break; // No more chunks
      }
    }

    await ffmpeg.deleteFile(inputName);
    return chunks;
  } catch (error) {
    const err = error as { message?: string };
    console.error('Audio chunking failed:', error);
    throw new Error(`Audio chunking failed: ${err.message || 'Unknown error'}. Your file may be too large or corrupted.`);
  }
}

/**
 * Process large audio file: Compress -> Chunk
 */
export async function processLargeAudio(
  file: File,
  onProgress?: (step: string, progress: number) => void
): Promise<Blob[]> {
  console.log(`Processing audio: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, type: ${file.type}`);

  // CRITICAL: Whisper API accepts most audio formats directly (MP3, WAV, M4A, etc.)
  // Only need FFmpeg if file is >24MB (for chunking)
  const isSmallEnough = file.size < CHUNK_SIZE_LIMIT;

  if (isSmallEnough) {
    console.log('✅ File is under 24MB - sending directly to Whisper (no FFmpeg needed)');
    if (onProgress) {
      onProgress('compressing', 100);
      onProgress('chunking', 100);
    }
    return [file];
  }

  // File is >24MB - need FFmpeg for chunking
  console.log(`⚠️ File is large (${(file.size / 1024 / 1024).toFixed(2)}MB) - FFmpeg required for chunking`);

  // Need FFmpeg for compression or chunking
  if (onProgress) onProgress('compressing', 0);

  try {
    // Compress to MP3 first
    const compressed = await compressAudio(file, (p) => {
      if (onProgress) onProgress('compressing', p);
    });
    console.log(`Compression complete: ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);

    // Then chunk if still needed
    if (onProgress) onProgress('chunking', 0);
    const chunks = await chunkAudio(compressed);
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
