import { AUDIO_QUALITY } from './fileSize';
import { audioBufferToWav } from './audio';

/**
 * Compress and optimize audio file for transcription
 * - Converts to mono
 * - Downsamples to 16kHz (Whisper's optimal sample rate)
 * - Reduces file size significantly
 */
export const compressAudioFile = async (
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  let audioContext: AudioContext | null = null;

  try {
    onProgress?.(10);

    // Create audio context for processing
    audioContext = new AudioContext();

    // Decode the audio data
    const arrayBuffer = await audioBlob.arrayBuffer();
    onProgress?.(30);

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    onProgress?.(50);

    // Downsample to 16kHz (Whisper's optimal rate)
    const targetSampleRate = AUDIO_QUALITY.WHISPER_SAMPLE_RATE;
    const compressedBuffer = await downsampleBuffer(
      audioBuffer,
      targetSampleRate
    );
    onProgress?.(70);

    // Convert to mono
    const monoBuffer = convertToMono(compressedBuffer, audioContext);
    onProgress?.(85);

    // Convert to WAV blob using shared utility
    const compressedBlob = audioBufferToWav(monoBuffer);
    onProgress?.(100);

    return compressedBlob;
  } catch (error) {
    console.error('Audio compression failed:', error);
    throw new Error('Failed to compress audio file');
  } finally {
    // Clean up AudioContext to prevent memory leaks
    if (audioContext) {
      await audioContext.close();
    }
  }
};

/**
 * Downsample audio buffer to target sample rate
 */
const downsampleBuffer = async (
  buffer: AudioBuffer,
  targetSampleRate: number
): Promise<AudioBuffer> => {
  if (buffer.sampleRate === targetSampleRate) {
    return buffer;
  }

  const offlineContext = new OfflineAudioContext(
    buffer.numberOfChannels,
    Math.ceil((buffer.duration * targetSampleRate)),
    targetSampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineContext.destination);
  source.start(0);

  return await offlineContext.startRendering();
};

/**
 * Convert stereo audio to mono
 */
const convertToMono = (
  buffer: AudioBuffer,
  audioContext: AudioContext
): AudioBuffer => {
  if (buffer.numberOfChannels === 1) {
    return buffer;
  }

  const monoBuffer = audioContext.createBuffer(
    1,
    buffer.length,
    buffer.sampleRate
  );

  const monoData = monoBuffer.getChannelData(0);

  // Average all channels
  for (let i = 0; i < buffer.length; i++) {
    let sum = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      sum += buffer.getChannelData(channel)[i];
    }
    monoData[i] = sum / buffer.numberOfChannels;
  }

  return monoBuffer;
};

/**
 * Get compression info before compressing
 */
export const getCompressionInfo = (originalSize: number) => {
  // Estimate: 16kHz mono = ~120KB per minute of audio
  // Rough calculation based on file size
  const estimatedMinutes = (originalSize / (1024 * 1024)) * 0.1; // 1MB ~ 6 seconds
  const estimatedCompressedSize = estimatedMinutes * 60 * 16000 * 2; // 16kHz * 2 bytes per sample
  const compressionRatio = ((1 - estimatedCompressedSize / originalSize) * 100).toFixed(0);

  return {
    originalSize,
    estimatedCompressedSize: Math.max(estimatedCompressedSize, originalSize * 0.3), // At least 30% of original
    estimatedRatio: Math.max(0, Math.min(70, parseInt(compressionRatio))), // Between 0-70%
  };
};
