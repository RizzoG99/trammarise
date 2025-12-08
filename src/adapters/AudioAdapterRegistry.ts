import type { AudioAdapter } from './AudioAdapter';
import {
  MP3Adapter,
  WAVAdapter,
  WebMAdapter,
  M4AAdapter,
  OGGAdapter,
  FLACAdapter,
  GenericAudioAdapter,
} from './AudioFormatAdapters';

/**
 * Registry for audio format adapters
 * Manages all available adapters and finds the best one for a given file
 */
export class AudioAdapterRegistry {
  private adapters: AudioAdapter[] = [];

  constructor() {
    this.registerDefaultAdapters();
  }

  /**
   * Register default adapters
   */
  private registerDefaultAdapters(): void {
    this.register(new MP3Adapter());
    this.register(new WAVAdapter());
    this.register(new WebMAdapter());
    this.register(new M4AAdapter());
    this.register(new OGGAdapter());
    this.register(new FLACAdapter());
    this.register(new GenericAudioAdapter()); // Fallback
  }

  /**
   * Register a new adapter
   */
  register(adapter: AudioAdapter): void {
    this.adapters.push(adapter);
    // Sort by priority (highest first)
    this.adapters.sort((a, b) => b.getPriority() - a.getPriority());
  }

  /**
   * Find the best adapter for a file
   * Returns the highest priority adapter that can handle the file
   */
  findAdapter(file: File): AudioAdapter | null {
    for (const adapter of this.adapters) {
      if (adapter.canHandle(file)) {
        return adapter;
      }
    }
    return null;
  }

  /**
   * Process a file using the appropriate adapter
   * Validates the file and converts it if necessary
   */
  async processFile(file: File): Promise<Blob> {
    const adapter = this.findAdapter(file);

    if (!adapter) {
      throw new Error(
        `Unsupported audio format: ${file.type || 'unknown'}. ` +
        `Supported formats: MP3, WAV, WebM, M4A, OGG, FLAC.`
      );
    }

    console.log(`Processing file with ${adapter.getName()}`);

    // Validate the file
    const isValid = await adapter.validate(file);
    if (!isValid) {
      throw new Error(`Invalid ${adapter.getName()} file`);
    }

    // Convert the file
    return await adapter.convert(file);
  }

  /**
   * Get all registered adapters
   */
  getAdapters(): AudioAdapter[] {
    return [...this.adapters];
  }

  /**
   * Get all supported MIME types
   */
  getSupportedTypes(): string[] {
    const types = new Set<string>();
    for (const adapter of this.adapters) {
      adapter.getSupportedTypes().forEach(type => types.add(type));
    }
    return Array.from(types);
  }

  /**
   * Check if a file type is supported
   */
  isSupported(file: File): boolean {
    return this.findAdapter(file) !== null;
  }

  /**
   * Clear all adapters
   */
  clear(): void {
    this.adapters = [];
  }
}

// Export singleton instance
export const audioAdapterRegistry = new AudioAdapterRegistry();
