import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      aria-label={
        onTimestampClick
          ? t('results.transcript.jumpTo', { timestamp: segment.timestamp })
          : undefined
      }
      className={`
        group px-3 py-3 rounded-lg transition-all duration-150
        ${onTimestampClick ? 'cursor-pointer' : ''}
        ${
          isActive
            ? 'bg-primary/8 border-l-2 border-primary ml-0 pl-3'
            : 'border-l-2 border-transparent hover:bg-white/[0.025] hover:border-border'
        }
      `}
    >
      {/* Timestamp & Speaker */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <span
          className={`
            px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums
            pointer-events-none transition-colors duration-150
            ${
              isActive
                ? 'bg-primary/20 text-primary'
                : 'bg-bg-surface text-text-tertiary group-hover:text-text-secondary'
            }
          `}
          aria-hidden="true"
        >
          {segment.timestamp}
        </span>

        {segment.speaker && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
            {segment.speaker}
          </span>
        )}
      </div>

      {/* Text Content */}
      <p
        className={`text-[15px] leading-[1.7] transition-colors duration-150 ${isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}
      >
        {highlightedText}
      </p>
    </div>
  );
});
