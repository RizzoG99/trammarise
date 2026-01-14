/**
 * Transcript segment with timestamp and speaker
 */
export interface TranscriptSegment {
  id: string;
  timestamp: string; // "00:00"
  timestampSeconds: number;
  speaker: string; // "Speaker A", "Speaker B", etc.
  text: string;
}

/**
 * Parse flat transcript string into structured segments.
 *
 * **Phase 3 Implementation**: Client-side parsing with mock data
 * - Splits transcript by sentences/paragraphs
 * - Assigns mock timestamps (every 15 seconds)
 * - Assigns generic speaker labels (Speaker A, B, C rotation)
 *
 * **Phase 5 (Future)**: Replace with real API data
 * - Use Whisper timestamps from API
 * - Use real speaker diarization
 *
 * @param transcript - Flat transcript text
 * @returns Array of structured segments
 */
export function parseTranscriptToSegments(transcript: string): TranscriptSegment[] {
  if (!transcript || transcript.trim().length === 0) {
    return [];
  }

  // Split by double newlines (paragraphs) or single newlines
  const paragraphs = transcript
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const segments: TranscriptSegment[] = [];
  const speakers = ['Speaker A', 'Speaker B', 'Speaker C'];
  let currentSpeaker = 0;
  let currentTime = 0;

  paragraphs.forEach((paragraph, index) => {
    // Split long paragraphs into sentences
    const sentences = paragraph
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    // If paragraph is short, keep as one segment
    if (paragraph.length < 200 || sentences.length <= 1) {
      segments.push({
        id: `segment-${index}`,
        timestamp: formatTimestamp(currentTime),
        timestampSeconds: currentTime,
        speaker: speakers[currentSpeaker % speakers.length],
        text: paragraph,
      });
      currentTime += 15; // Mock: 15 seconds per segment
      currentSpeaker++;
    } else {
      // Split long paragraph into multiple segments (one per sentence)
      sentences.forEach((sentence, sentenceIndex) => {
        segments.push({
          id: `segment-${index}-${sentenceIndex}`,
          timestamp: formatTimestamp(currentTime),
          timestampSeconds: currentTime,
          speaker: speakers[currentSpeaker % speakers.length],
          text: sentence,
        });
        currentTime += 8; // Mock: 8 seconds per sentence
      });
      currentSpeaker++;
    }
  });

  return segments;
}

/**
 * Format seconds to timestamp string (MM:SS or HH:MM:SS)
 */
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return hours + ':' + pad(minutes) + ':' + pad(secs);
  }

  return minutes + ':' + pad(secs);
}
