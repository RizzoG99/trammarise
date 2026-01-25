/**
 * Unit Tests: Transcript Assembler
 *
 * Tests for transcript assembly with overlap removal and normalization.
 */

import { describe, it, expect } from 'vitest';
import { assembleTranscript } from '../transcript-assembler';
import {
  createTestChunk,
  createOverlappingChunks,
  MOCK_TRANSCRIPTS,
} from '../__test-helpers__/test-fixtures';
import type { ChunkMetadata } from '../../types/chunking';

describe('Transcript Assembler', () => {
  describe('assembleTranscript() - Balanced Mode', () => {
    it('should concatenate transcripts with normalization', async () => {
      const chunks: ChunkMetadata[] = [
        createTestChunk(0, { duration: 180, hasOverlap: false }),
        createTestChunk(1, { duration: 180, hasOverlap: false }),
        createTestChunk(2, { duration: 180, hasOverlap: false }),
      ];

      const transcripts = ['First chunk text.', 'Second chunk text.', 'Third chunk text.'];

      const result = await assembleTranscript(chunks, transcripts, 'balanced');

      expect(result).toContain('First chunk text');
      expect(result).toContain('Second chunk text');
      expect(result).toContain('Third chunk text');
    });

    it('should handle empty chunk list', async () => {
      const result = await assembleTranscript([], [], 'balanced');
      expect(result).toBe('');
    });

    it('should handle single chunk', async () => {
      const chunks = [createTestChunk(0, { duration: 180 })];
      const transcripts = ['Single chunk transcript'];

      const result = await assembleTranscript(chunks, transcripts, 'balanced');

      expect(result).toBe('Single chunk transcript');
    });
  });

  describe('assembleTranscript() - Best Quality Mode', () => {
    it('should remove overlapping text between chunks', async () => {
      const chunks = createOverlappingChunks(3);
      const transcripts = [
        MOCK_TRANSCRIPTS.overlapping.chunk0,
        MOCK_TRANSCRIPTS.overlapping.chunk1,
        MOCK_TRANSCRIPTS.overlapping.chunk2,
      ];

      const result = await assembleTranscript(chunks, transcripts, 'best_quality');

      // The overlapping phrase "discusses topic one in detail" should appear only once
      const matches = (result.match(/discusses topic one in detail/g) || []).length;
      expect(matches).toBe(1);

      // The overlapping phrase "Moving on to topic two now" should appear only once
      const matches2 = (result.match(/Moving on to topic two now/g) || []).length;
      expect(matches2).toBe(1);
    });

    it('should preserve content when no overlap detected', async () => {
      const chunks: ChunkMetadata[] = [
        createTestChunk(0, {
          startTime: 0,
          duration: 600,
          hasOverlap: true,
          overlapStartTime: 585,
        }),
        createTestChunk(1, {
          startTime: 585,
          duration: 600,
          hasOverlap: false,
        }),
      ];

      const transcripts = [
        'Completely different text in first chunk.',
        'No matching words in second chunk at all.',
      ];

      const result = await assembleTranscript(chunks, transcripts, 'best_quality');

      // Both should be present since no overlap was found
      expect(result).toContain('first chunk');
      expect(result).toContain('second chunk');
    });

    it('should handle chunks without overlap flag', async () => {
      const chunks: ChunkMetadata[] = [
        createTestChunk(0, { duration: 600, hasOverlap: false }),
        createTestChunk(1, { duration: 600, hasOverlap: false }),
      ];

      const transcripts = ['Chunk one.', 'Chunk two.'];

      const result = await assembleTranscript(chunks, transcripts, 'best_quality');

      expect(result).toContain('Chunk one');
      expect(result).toContain('Chunk two');
    });
  });

  describe('Sentence Normalization', () => {
    it('should normalize punctuation and spacing', async () => {
      const chunks = [createTestChunk(0, { duration: 180 })];
      const transcripts = ['  Multiple   spaces  and.weird..punctuation...  '];

      const result = await assembleTranscript(chunks, transcripts, 'balanced');

      // Should have normalized spacing (single spaces)
      expect(result).not.toContain('  ');
      expect(result).toBeTruthy();
    });

    it('should handle transcripts with numbers and special characters', async () => {
      const chunks = [createTestChunk(0, { duration: 180 })];
      const transcripts = [MOCK_TRANSCRIPTS.withNumbers];

      const result = await assembleTranscript(chunks, transcripts, 'balanced');

      expect(result).toContain('42');
      expect(result).toContain('$1,234.56');
    });
  });

  describe('Error Handling', () => {
    it('should throw if chunk count does not match transcript count', async () => {
      const chunks = [createTestChunk(0, { duration: 180 }), createTestChunk(1, { duration: 180 })];
      const transcripts = ['Only one transcript'];

      await expect(assembleTranscript(chunks, transcripts, 'balanced')).rejects.toThrow(
        /Chunk count mismatch/
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty transcripts', async () => {
      const chunks = [createTestChunk(0, { duration: 180 }), createTestChunk(1, { duration: 180 })];
      const transcripts = ['', ''];

      const result = await assembleTranscript(chunks, transcripts, 'balanced');

      expect(result).toBeDefined();
    });

    it('should handle very long transcripts', async () => {
      const chunks = [createTestChunk(0, { duration: 600 })];
      const longText = 'word '.repeat(10000); // 10000 words
      const transcripts = [longText];

      const result = await assembleTranscript(chunks, transcripts, 'balanced');

      expect(result.split(/\s+/).length).toBeGreaterThan(5000);
    });

    it('should handle transcripts with only punctuation', async () => {
      const chunks = [createTestChunk(0, { duration: 180 })];
      const transcripts = ['...!!!???'];

      const result = await assembleTranscript(chunks, transcripts, 'balanced');

      expect(result).toBeDefined();
    });
  });
});
