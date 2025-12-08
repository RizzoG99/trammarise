/**
 * Audio format adapter interface
 * Each adapter handles a specific audio format and converts it to a standardized format
 */
export interface AudioAdapter {
  /**
   * Check if this adapter can handle the given file
   */
  canHandle(file: File): boolean;

  /**
   * Get the priority of this adapter (higher = checked first)
   * Used when multiple adapters can handle the same file
   */
  getPriority(): number;

  /**
   * Convert the file to a standardized format if needed
   * Returns the original file if no conversion is needed
   */
  convert(file: File): Promise<Blob>;

  /**
   * Get the adapter name for logging/debugging
   */
  getName(): string;

  /**
   * Validate the file before processing
   */
  validate(file: File): Promise<boolean>;

  /**
   * Get supported MIME types
   */
  getSupportedTypes(): string[];
}

/**
 * Base adapter with common functionality
 */
export abstract class BaseAudioAdapter implements AudioAdapter {
  abstract canHandle(file: File): boolean;
  abstract convert(file: File): Promise<Blob>;
  abstract getName(): string;
  abstract getSupportedTypes(): string[];

  getPriority(): number {
    return 0;
  }

  async validate(file: File): Promise<boolean> {
    // Basic validation - check if file exists and has content
    if (!file || file.size === 0) {
      throw new Error('Invalid file: File is empty');
    }

    // Check if MIME type is supported
    const supportedTypes = this.getSupportedTypes();
    if (!supportedTypes.some(type => file.type.match(type))) {
      return false;
    }

    return true;
  }

  /**
   * Helper method to create a blob from an ArrayBuffer
   */
  protected createBlob(buffer: ArrayBuffer, mimeType: string): Blob {
    return new Blob([buffer], { type: mimeType });
  }
}
