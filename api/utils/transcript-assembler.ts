/**
 * Transcript Assembler
 *
 * Assembles final transcript from chunk transcripts with:
 * - Simple concatenation for Balanced mode
 * - Overlap removal for Best Quality mode (15s overlap, 70% fuzzy matching)
 * - Sentence boundary normalization
 */

import type { ChunkMetadata, ProcessingMode } from '../types/chunking';

/**
 * Assemble final transcript from chunk transcripts
 */
export async function assembleTranscript(
  chunks: ChunkMetadata[],
  transcripts: string[],
  mode: ProcessingMode
): Promise<string> {
  if (chunks.length !== transcripts.length) {
    throw new Error(
      `Chunk count mismatch: ${chunks.length} chunks but ${transcripts.length} transcripts`
    );
  }

  if (chunks.length === 0) {
    return '';
  }

  if (chunks.length === 1) {
    return normalizeSentences(transcripts[0]);
  }

  console.log(`[Transcript Assembler] Assembling ${chunks.length} chunks (mode: ${mode})`);

  if (mode === 'best_quality') {
    // Best Quality: Remove overlaps
    return await removeOverlaps(chunks, transcripts);
  } else {
    // Balanced: Simple concatenation with sentence normalization
    const assembled = transcripts.join(' ');
    return normalizeSentences(assembled);
  }
}

/**
 * Remove overlaps between chunks (Best Quality mode only)
 */
async function removeOverlaps(chunks: ChunkMetadata[], transcripts: string[]): Promise<string> {
  const deduplicatedTranscripts: string[] = [transcripts[0]];

  for (let i = 1; i < chunks.length; i++) {
    const previousChunk = chunks[i - 1];
    const currentChunk = chunks[i];
    const currentTranscript = transcripts[i];

    if (!previousChunk.hasOverlap) {
      // No overlap, just append
      deduplicatedTranscripts.push(currentTranscript);
      continue;
    }

    console.log(`[Transcript Assembler] Removing overlap between chunk ${i - 1} and ${i}`);

    // Extract overlap region from previous transcript
    const previousTranscript = transcripts[i - 1];

    // Calculate overlap duration: difference between previous chunk's end and current chunk's start
    const previousChunkEnd = previousChunk.startTime + previousChunk.duration;
    const overlapDuration = previousChunkEnd - currentChunk.startTime;

    // Estimate words in overlap (assume ~150 words per minute)
    const estimatedByDuration = Math.max(1, Math.ceil((overlapDuration / 60) * 150));

    // Get last N words from previous transcript, but cap at 50% of transcript length
    const previousWords = previousTranscript.split(/\s+/).filter((w) => w.length > 0);
    const maxOverlapWords = Math.floor(previousWords.length * 0.5);
    const estimatedOverlapWords = Math.min(estimatedByDuration, maxOverlapWords);
    const overlapWords = previousWords.slice(-estimatedOverlapWords).join(' ');

    // Find overlap in current transcript - try multiple strategies
    const currentWords = currentTranscript.split(/\s+/);

    // Strategy 1: Try first 50% (expanded from 30%)
    const searchWindowSize = Math.ceil(currentWords.length * 0.5);
    const searchWindow = currentWords.slice(0, searchWindowSize).join(' ');

    let matchPosition = findOverlapMatch(
      overlapWords,
      searchWindow,
      0.7 // 70% similarity threshold
    );

    // Strategy 2: If not found, try full current transcript
    if (matchPosition === -1) {
      matchPosition = findOverlapMatch(overlapWords, currentTranscript, 0.7);
    }

    // Strategy 3: If still not found, try substring matching
    if (matchPosition === -1) {
      const overlapWordsArray = overlapWords.split(/\s+/);
      const minMatchLength = Math.floor(overlapWordsArray.length * 0.6); // Match at least 60% of words

      for (let startIdx = 0; startIdx < overlapWordsArray.length - minMatchLength + 1; startIdx++) {
        const phraseToFind = overlapWordsArray.slice(startIdx, startIdx + minMatchLength).join(' ');
        const lowerCurrentTranscript = currentTranscript.toLowerCase();
        const index = lowerCurrentTranscript.indexOf(phraseToFind.toLowerCase());

        if (index !== -1) {
          // Convert character index to word index
          const beforeMatch = lowerCurrentTranscript.substring(0, index);
          const wordsBeforeMatch = beforeMatch.split(/\s+/).filter((w) => w.length > 0).length;
          matchPosition = wordsBeforeMatch + minMatchLength;
          break;
        }
      }
    }

    if (matchPosition !== -1) {
      // Found match, remove overlap from current transcript
      const wordsToRemove = matchPosition;
      const deduplicated = currentWords.slice(wordsToRemove).join(' ');

      console.log(
        `[Transcript Assembler] Removed ${wordsToRemove} overlapping words from chunk ${i}`
      );

      deduplicatedTranscripts.push(deduplicated);
    } else {
      // No match found, preserve full current transcript
      console.warn(
        `[Transcript Assembler] Could not find overlap match for chunk ${i}, preserving full transcript`
      );

      deduplicatedTranscripts.push(currentTranscript);
    }
  }

  // Join all deduplicated transcripts
  const assembled = deduplicatedTranscripts.join(' ');
  return normalizeSentences(assembled);
}

/**
 * Find overlap match using fuzzy matching
 * Returns the number of words to remove from the current transcript
 */
function findOverlapMatch(overlapText: string, searchText: string, threshold: number): number {
  const overlapWords = overlapText.toLowerCase().split(/\s+/);
  const searchWords = searchText.toLowerCase().split(/\s+/);

  let bestMatchPosition = -1;
  let bestMatchScore = 0;

  // Sliding window approach
  const windowSize = overlapWords.length;

  for (let i = 0; i <= searchWords.length - windowSize; i++) {
    const windowWords = searchWords.slice(i, i + windowSize);
    const score = calculateSimilarity(overlapWords, windowWords);

    if (score > bestMatchScore) {
      bestMatchScore = score;
      bestMatchPosition = i + windowSize; // Position after the match
    }
  }

  // Return position if score meets threshold
  if (bestMatchScore >= threshold) {
    return bestMatchPosition;
  }

  return -1; // No match found
}

/**
 * Calculate similarity between two word arrays (0-1)
 */
function calculateSimilarity(words1: string[], words2: string[]): number {
  if (words1.length !== words2.length) {
    return 0;
  }

  let matches = 0;

  for (let i = 0; i < words1.length; i++) {
    if (words1[i] === words2[i]) {
      matches++;
    } else if (isSimilarWord(words1[i], words2[i])) {
      matches += 0.5; // Partial match for similar words
    }
  }

  return matches / words1.length;
}

/**
 * Check if two words are similar (for fuzzy matching)
 */
function isSimilarWord(word1: string, word2: string): boolean {
  // Levenshtein distance
  const distance = levenshteinDistance(word1, word2);
  const maxLength = Math.max(word1.length, word2.length);

  // Allow 20% difference
  return distance / maxLength <= 0.2;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Normalize sentences to fix broken boundaries
 */
export function normalizeSentences(text: string): string {
  // Fix multiple spaces
  let normalized = text.replace(/\s+/g, ' ').trim();

  // Remove spaces before punctuation
  normalized = normalized.replace(/\s+([!?;:])/g, '$1');

  // Add space after sentence-ending punctuation (!?;:) if not already present
  normalized = normalized.replace(/([!?;:])(?!\s)/g, '$1 ');

  // Add space after periods ONLY if followed by a letter (not in numbers like 1.5)
  normalized = normalized.replace(/(\.)([A-Za-z])/g, '$1 $2');

  // Capitalize after sentence endings
  normalized = normalized.replace(/([.!?])\s+([a-z])/g, (_match, p1, p2) => {
    return p1 + ' ' + p2.toUpperCase();
  });

  // Ensure first character is capitalized
  if (normalized.length > 0) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  // Remove trailing spaces
  normalized = normalized.trim();

  return normalized;
}

/**
 * Split text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  // Simple sentence splitting (can be improved with NLP libraries)
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Get word count
 */
export function getWordCount(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}
