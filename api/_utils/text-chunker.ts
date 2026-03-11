/**
 * Text Chunker Utility
 *
 * Splits long transcripts into smaller chunks for Map-Reduce summarization.
 * Respects sentence boundaries to maintain context.
 */

/**
 * Split text into chunks of approximately targetSize characters,
 * respecting sentence boundaries
 */
export function chunkText(text: string, targetSize: number = 10000): string[] {
  if (text.length <= targetSize) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = splitIntoSentences(text);

  let currentChunk = '';

  for (const sentence of sentences) {
    // If adding this sentence would exceed target size and we have content
    if (currentChunk.length > 0 && currentChunk.length + sentence.length > targetSize) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
    }
  }

  // Add remaining content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Split text into sentences using common sentence boundaries
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by whitespace or end of string
  // Handles: . ! ? followed by space or end
  // Preserves: decimals (1.5), abbreviations (Dr.), etc.
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$/);

  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if text should use Map-Reduce summarization
 */
export function shouldUseMapReduce(text: string, threshold: number = 15000): boolean {
  return text.length > threshold;
}
