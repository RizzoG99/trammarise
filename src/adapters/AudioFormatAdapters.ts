import { BaseAudioAdapter } from './AudioAdapter';

/**
 * MP3 adapter - handles MP3 files (no conversion needed)
 */
export class MP3Adapter extends BaseAudioAdapter {
  canHandle(file: File): boolean {
    return file.type === 'audio/mpeg' ||
           file.type === 'audio/mp3' ||
           file.name.toLowerCase().endsWith('.mp3');
  }

  async convert(file: File): Promise<Blob> {
    // MP3 files don't need conversion - return as is
    return file;
  }

  getName(): string {
    return 'MP3Adapter';
  }

  getSupportedTypes(): string[] {
    return ['audio/mpeg', 'audio/mp3'];
  }

  getPriority(): number {
    return 100; // High priority - MP3 is preferred format
  }
}

/**
 * WAV adapter - handles WAV files (no conversion needed for Whisper)
 */
export class WAVAdapter extends BaseAudioAdapter {
  canHandle(file: File): boolean {
    return file.type === 'audio/wav' ||
           file.type === 'audio/x-wav' ||
           file.name.toLowerCase().endsWith('.wav');
  }

  async convert(file: File): Promise<Blob> {
    // WAV files are supported by Whisper - return as is
    return file;
  }

  getName(): string {
    return 'WAVAdapter';
  }

  getSupportedTypes(): string[] {
    return ['audio/wav', 'audio/x-wav'];
  }

  getPriority(): number {
    return 90;
  }
}

/**
 * WebM adapter - handles WebM audio files (from browser recording)
 */
export class WebMAdapter extends BaseAudioAdapter {
  canHandle(file: File): boolean {
    return file.type === 'audio/webm' ||
           file.name.toLowerCase().endsWith('.webm');
  }

  async convert(file: File): Promise<Blob> {
    // WebM is supported by Whisper - return as is
    return file;
  }

  getName(): string {
    return 'WebMAdapter';
  }

  getSupportedTypes(): string[] {
    return ['audio/webm'];
  }

  getPriority(): number {
    return 80;
  }
}

/**
 * M4A adapter - handles M4A/AAC files
 */
export class M4AAdapter extends BaseAudioAdapter {
  canHandle(file: File): boolean {
    return file.type === 'audio/m4a' ||
           file.type === 'audio/mp4' ||
           file.type === 'audio/x-m4a' ||
           file.name.toLowerCase().endsWith('.m4a');
  }

  async convert(file: File): Promise<Blob> {
    // M4A is supported by Whisper - return as is
    return file;
  }

  getName(): string {
    return 'M4AAdapter';
  }

  getSupportedTypes(): string[] {
    return ['audio/m4a', 'audio/mp4', 'audio/x-m4a'];
  }

  getPriority(): number {
    return 70;
  }
}

/**
 * OGG adapter - handles OGG Vorbis files
 */
export class OGGAdapter extends BaseAudioAdapter {
  canHandle(file: File): boolean {
    return file.type === 'audio/ogg' ||
           file.type === 'audio/ogg; codecs=vorbis' ||
           file.name.toLowerCase().endsWith('.ogg');
  }

  async convert(file: File): Promise<Blob> {
    // OGG is supported by Whisper - return as is
    return file;
  }

  getName(): string {
    return 'OGGAdapter';
  }

  getSupportedTypes(): string[] {
    return ['audio/ogg'];
  }

  getPriority(): number {
    return 60;
  }
}

/**
 * FLAC adapter - handles FLAC files
 */
export class FLACAdapter extends BaseAudioAdapter {
  canHandle(file: File): boolean {
    return file.type === 'audio/flac' ||
           file.type === 'audio/x-flac' ||
           file.name.toLowerCase().endsWith('.flac');
  }

  async convert(file: File): Promise<Blob> {
    // FLAC is supported by Whisper - return as is
    return file;
  }

  getName(): string {
    return 'FLACAdapter';
  }

  getSupportedTypes(): string[] {
    return ['audio/flac', 'audio/x-flac'];
  }

  getPriority(): number {
    return 50;
  }
}

/**
 * Generic audio adapter - fallback for other audio types
 */
export class GenericAudioAdapter extends BaseAudioAdapter {
  canHandle(file: File): boolean {
    // Accept any audio/* MIME type as fallback
    return file.type.startsWith('audio/');
  }

  async convert(file: File): Promise<Blob> {
    // Try to pass through - Whisper might support it
    console.warn(`Using generic adapter for ${file.type}. May require FFmpeg conversion.`);
    return file;
  }

  getName(): string {
    return 'GenericAudioAdapter';
  }

  getSupportedTypes(): string[] {
    return ['audio/*'];
  }

  getPriority(): number {
    return -1; // Lowest priority - only used as fallback
  }
}
