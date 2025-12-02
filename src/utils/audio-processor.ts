import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const TRANSCODE_BITRATE = '128k'; // Good balance for speech
const CHUNK_SIZE_LIMIT = 24 * 1024 * 1024; // 24MB (safe margin below 25MB)

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  // Load ffmpeg.wasm
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

/**
 * Compress audio file to MP3 128kbps
 */
export async function compressAudio(file: File, onProgress?: (progress: number) => void): Promise<Blob> {
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

  return new Blob([data as any], { type: 'audio/mp3' });
}

/**
 * Split audio into chunks if larger than limit
 */
export async function chunkAudio(file: Blob): Promise<Blob[]> {
  if (file.size <= CHUNK_SIZE_LIMIT) {
    return [file];
  }

  const ffmpeg = await getFFmpeg();
  const inputName = 'large_input.mp3';
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // Get duration
  // Note: This is a bit tricky with ffmpeg.wasm, simpler to just split by time
  // Assuming 128kbps = ~1MB/min, 24MB = ~24 mins. Let's split every 20 mins to be safe.
  const SEGMENT_TIME = 20 * 60; // 20 minutes in seconds

  await ffmpeg.exec([
    '-i', inputName,
    '-f', 'segment',
    '-segment_time', SEGMENT_TIME.toString(),
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
      chunks.push(new Blob([data as any], { type: 'audio/mp3' }));
      await ffmpeg.deleteFile(chunkName);
      i++;
    } catch (e) {
      break; // No more chunks
    }
  }

  await ffmpeg.deleteFile(inputName);
  return chunks;
}

/**
 * Process large audio file: Compress -> Chunk
 */
export async function processLargeAudio(
  file: File, 
  onProgress?: (step: string, progress: number) => void
): Promise<Blob[]> {
  // 1. Compress
  if (onProgress) onProgress('compressing', 0);
  
  // If already MP3 and small enough, skip compression
  if (file.type === 'audio/mpeg' && file.size < CHUNK_SIZE_LIMIT) {
    if (onProgress) onProgress('compressing', 100);
    return [file];
  }

  const compressed = await compressAudio(file, (p) => {
    if (onProgress) onProgress('compressing', p);
  });

  // 2. Chunk
  if (onProgress) onProgress('chunking', 0);
  const chunks = await chunkAudio(compressed);
  if (onProgress) onProgress('chunking', 100);

  return chunks;
}

function getExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0] : '.wav'; // Default to wav if unknown
}
