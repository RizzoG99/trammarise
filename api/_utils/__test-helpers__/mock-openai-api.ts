/**
 * Mock OpenAI API
 *
 * Provides controlled mock responses for OpenAI Whisper API calls.
 * Allows testing various scenarios: success, failure, rate limiting, delays.
 */

import { vi } from 'vitest';

export interface MockOpenAIConfig {
  /** Chunk indices that should fail */
  failingChunks?: Set<number>;
  /** Chunk indices that should return 429 (rate limit) */
  rateLimitedChunks?: Set<number>;
  /** Delay in ms before responding */
  responseDelay?: number;
  /** Rate limit error rate (0-1) for random rate limiting */
  rateLimitRate?: number;
  /** Custom transcript generator function */
  transcriptGenerator?: (chunkIndex: number) => string;
}

export class MockOpenAIAPI {
  private config: MockOpenAIConfig = {};
  private callCount = 0;
  private transcribeCallback: ((chunkIndex: number, formData: FormData) => void) | null = null;

  constructor(initialConfig?: MockOpenAIConfig) {
    if (initialConfig) {
      this.config = { ...initialConfig };
    }
  }

  /**
   * Mark specific chunk to fail
   */
  failChunk(chunkIndex: number): void {
    if (!this.config.failingChunks) {
      this.config.failingChunks = new Set();
    }
    this.config.failingChunks.add(chunkIndex);
  }

  /**
   * Mark specific chunk to return 429
   */
  return429OnChunk(chunkIndex: number): void {
    if (!this.config.rateLimitedChunks) {
      this.config.rateLimitedChunks = new Set();
    }
    this.config.rateLimitedChunks.add(chunkIndex);
  }

  /**
   * Set rate limit error rate (0-1)
   */
  setRateLimitRate(rate: number): void {
    this.config.rateLimitRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Set response delay in ms
   */
  setResponseDelay(ms: number): void {
    this.config.responseDelay = ms;
  }

  /**
   * Register callback to be notified when transcribe is called
   */
  onTranscribe(callback: (chunkIndex: number, formData: FormData) => void): void {
    this.transcribeCallback = callback;
  }

  /**
   * Reset all configuration and counters
   */
  reset(): void {
    this.config = {};
    this.callCount = 0;
    this.transcribeCallback = null;
  }

  /**
   * Get number of API calls made
   */
  getCallCount(): number {
    return this.callCount;
  }

  /**
   * Generate default transcript text for a chunk
   */
  private generateDefaultTranscript(chunkIndex: number): string {
    return (
      `This is the transcription for chunk ${chunkIndex}. ` +
      `The content continues with meaningful text that would appear in a real transcript. ` +
      `This helps test boundary conditions and sentence splitting.`
    );
  }

  /**
   * Extract chunk index from FormData (looks for chunk metadata or filename pattern)
   */
  private extractChunkIndex(formData: FormData): number {
    // Try to extract from filename pattern like "chunk_05_..."
    if (formData && formData.get) {
      const file = formData.get('file');
      // Type guard: FormDataEntryValue is File | string
      if (file && typeof file !== 'string' && file instanceof File) {
        const match = file.name.match(/chunk_(\d+)/);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }

    // Fallback: use call count
    return this.callCount;
  }

  /**
   * Create mock fetch function for OpenAI API
   */
  createMockFetch(): typeof fetch {
    return vi.fn(async (url: string | URL, options?: RequestInit) => {
      this.callCount++;

      // Only intercept OpenAI Whisper API calls
      const urlString = url.toString();
      const isWhisper = urlString.includes('openai.com/v1/audio/transcriptions');
      const isChat = urlString.includes('openai.com/v1/chat/completions');

      if (!isWhisper && !isChat) {
        return new Response(null, { status: 404, statusText: 'Not Found' });
      }

      // Extract chunkIndex from request body
      let chunkIndex = 0;

      if (isWhisper) {
        // Whisper uses FormData
        const formData = options?.body as FormData;
        chunkIndex = this.extractChunkIndex(formData);

        // Notify callback
        if (this.transcribeCallback) {
          this.transcribeCallback(chunkIndex, formData);
        }
      } else {
        // Chat uses JSON body - we don't parse it as we don't use it currently
        // If we add advanced tests later, we might need better index tracking.
        chunkIndex = this.callCount;
      }

      // Apply response delay if configured
      if (this.config.responseDelay && this.config.responseDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.config.responseDelay));
      }

      // Check for intentional failure
      if (this.config.failingChunks?.has(chunkIndex)) {
        return new Response(JSON.stringify({ error: { message: 'Mock transcription failed' } }), {
          status: 500,
          statusText: 'Internal Server Error',
        });
      }

      // Check for intentional rate limiting
      if (this.config.rateLimitedChunks?.has(chunkIndex)) {
        return new Response(JSON.stringify({ error: { message: 'Rate limit exceeded' } }), {
          status: 429,
          statusText: 'Too Many Requests',
          headers: { 'retry-after': '2' },
        });
      }

      // Check for random rate limiting
      if (this.config.rateLimitRate && Math.random() < this.config.rateLimitRate) {
        return new Response(JSON.stringify({ error: { message: 'Rate limit exceeded' } }), {
          status: 429,
          statusText: 'Too Many Requests',
          headers: { 'retry-after': '1' },
        });
      }

      // Success response
      const transcript = this.config.transcriptGenerator
        ? this.config.transcriptGenerator(chunkIndex)
        : this.generateDefaultTranscript(chunkIndex);

      if (isChat) {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: transcript,
                },
              },
            ],
          }),
          {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify({ text: transcript }), {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;
  }
}

/**
 * Create a simple mock fetch that always succeeds
 */
export function createSuccessfulMockFetch(
  transcriptGenerator?: (chunkIndex: number) => string
): typeof fetch {
  const mock = new MockOpenAIAPI({ transcriptGenerator });
  return mock.createMockFetch();
}

/**
 * Create a mock fetch that fails for specific chunks
 */
export function createFailingMockFetch(failingChunkIndices: number[]): typeof fetch {
  const mock = new MockOpenAIAPI();
  failingChunkIndices.forEach((index) => mock.failChunk(index));
  return mock.createMockFetch();
}

/**
 * Create a mock fetch that rate limits specific chunks
 */
export function createRateLimitedMockFetch(rateLimitedChunkIndices: number[]): typeof fetch {
  const mock = new MockOpenAIAPI();
  rateLimitedChunkIndices.forEach((index) => mock.return429OnChunk(index));
  return mock.createMockFetch();
}
