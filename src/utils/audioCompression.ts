import { AUDIO_QUALITY } from './fileSize';

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
  try {
    onProgress?.(10);

    // Create audio context for processing
    const audioContext = new AudioContext();

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

    // Convert to WAV blob
    const compressedBlob = audioBufferToWav(monoBuffer);
    onProgress?.(100);

    return compressedBlob;
  } catch (error) {
    console.error('Audio compression failed:', error);
    throw new Error('Failed to compress audio file');
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
 * Convert AudioBuffer to WAV blob
 */
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(44 + offset, sample, true); // write 16-bit sample
      offset += 2;
    }
    pos++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
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
