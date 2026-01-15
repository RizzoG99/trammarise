import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useMemo, useEffect, memo } from 'react';
import { GlassCard, Heading, Text } from '@/lib';
import { useTranscriptSearch } from '../hooks/useTranscriptSearch';
import { parseTranscriptToSegments } from '../utils/transcriptParser';
import { TranscriptSegmentBlock } from './TranscriptSegmentBlock';

export interface SearchableTranscriptProps {
  transcript: string;
  /** Optional: ID of currently active segment (during playback) */
  activeSegmentId?: string;
  /** Optional: Handler when timestamp is clicked */
  onTimestampClick?: (timestampSeconds: number) => void;
}

export const SearchableTranscript = memo(function SearchableTranscript({
  transcript,
  activeSegmentId,
  onTimestampClick,
}: SearchableTranscriptProps) {
  const {
    searchQuery,
    setSearchQuery,
    currentMatchIndex,
    totalMatches,
    goToNextMatch,
    goToPreviousMatch,
    clearSearch,
    hasMatches,
  } = useTranscriptSearch(transcript);

  // Parse transcript into segments (memoized)
  const segments = useMemo(() => parseTranscriptToSegments(transcript), [transcript]);

  // Auto-scroll to active segment during playback
  useEffect(() => {
    if (activeSegmentId) {
      const element = document.getElementById(activeSegmentId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeSegmentId]);

  return (
    <GlassCard variant="light" className="p-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Heading level="h3">Transcript</Heading>
          {hasMatches && (
            <Text variant="caption" color="tertiary">
              {currentMatchIndex + 1} of {totalMatches} matches
            </Text>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript..."
              className="
                w-full pl-10 pr-10 py-2 rounded-lg
                bg-[var(--color-bg-surface)] border border-border
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:border-primary
              "
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {hasMatches && (
            <div className="flex gap-1">
              <button
                onClick={goToPreviousMatch}
                className="p-2 rounded-lg bg-[var(--color-bg-surface)] border border-border hover:bg-[var(--color-bg-surface-hover)]"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextMatch}
                className="p-2 rounded-lg bg-[var(--color-bg-surface)] border border-border hover:bg-[var(--color-bg-surface-hover)]"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Content */}
      <div className="space-y-2">
        {segments.map((segment) => (
          <TranscriptSegmentBlock
            key={segment.id}
            segment={segment}
            isActive={segment.id === activeSegmentId}
            searchQuery={searchQuery}
            onTimestampClick={onTimestampClick}
          />
        ))}

        {/* Fallback: Show notice if no segments */}
        {segments.length === 0 && (
          <Text variant="body" color="secondary" className="text-center py-8">
            No transcript available
          </Text>
        )}
      </div>
    </GlassCard>
  );
});
