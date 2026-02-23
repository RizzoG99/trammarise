import { memo, useMemo } from 'react';
import { Text } from '../../../lib';
import type { TranscriptSegment } from '../utils/transcriptParser';

/**
 * Props for TranscriptSegmentBlock component
 */
interface TranscriptSegmentBlockProps {
  /** Segment data */
  segment: TranscriptSegment;
  /** Whether this segment is currently active (playing) */
  isActive?: boolean;
  /** Optional: Search query for highlighting */
  searchQuery?: string;
  /** Handler when timestamp is clicked */
  onTimestampClick?: (timestampSeconds: number) => void;
}

/**
 * Individual transcript segment with timestamp, speaker, and text.
 *
 * Features:
 * - Clickable timestamp button (blue, seeks audio)
 * - Speaker label (bold, above text)
 * - Text content with search highlighting
 * - Active state (blue background + left border during playback)
 * - Hover effects (light gray background)
 *
 * Memoized to prevent unnecessary re-renders during audio playback.
 * Only re-renders when segment, isActive, or searchQuery changes.
 *
 * @param segment - Transcript segment data
 * @param isActive - Whether currently playing
 * @param searchQuery - Optional search term to highlight
 * @param onTimestampClick - Callback when timestamp clicked
 */
export const TranscriptSegmentBlock = memo(function TranscriptSegmentBlock({
  segment,
  isActive = false,
  searchQuery,
  onTimestampClick,
}: TranscriptSegmentBlockProps) {
  // Memoize highlighted text - only recompute when text or query changes
  const highlightedText = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return segment.text;
    }

    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = segment.text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  }, [segment.text, searchQuery]);

  return (
    <div
      id={segment.id}
      onClick={() => onTimestampClick?.(segment.timestampSeconds)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onTimestampClick) {
          e.preventDefault();
          onTimestampClick(segment.timestampSeconds);
        }
      }}
      tabIndex={onTimestampClick ? 0 : undefined}
      role={onTimestampClick ? 'button' : undefined}
      aria-label={onTimestampClick ? `Jump to ${segment.timestamp}` : undefined}
      className={`
        p-4 rounded-lg transition-all
        ${onTimestampClick ? 'cursor-pointer' : ''}
        ${
          isActive
            ? 'bg-[var(--color-primary)]/10 border-l-4 border-[var(--color-primary)]'
            : 'hover:bg-[var(--color-surface-hover)] hover:shadow-sm'
        }
      `}
    >
      {/* Timestamp & Speaker */}
      <div className="flex items-center gap-3 mb-2">
        {/* Timestamp Badge (visual only) */}
        <span
          className="
            px-2 py-1 rounded text-xs font-mono
            bg-[var(--color-primary)]/20 text-[var(--color-primary)]
            pointer-events-none
          "
          aria-hidden="true"
        >
          {segment.timestamp}
        </span>

        {/* Speaker Label - Only show if speaker exists */}
        {segment.speaker && (
          <Text variant="caption" className="font-semibold text-[var(--color-text)]">
            {segment.speaker}
          </Text>
        )}
      </div>

      {/* Text Content */}
      <Text variant="body" className="leading-relaxed">
        {highlightedText}
      </Text>
    </div>
  );
});
