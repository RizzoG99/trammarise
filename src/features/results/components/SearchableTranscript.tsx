import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useMemo, useEffect, memo } from 'react';
import { GlassCard, Heading, Text } from '@/lib';
import { useTranslation } from 'react-i18next';
import { useTranscriptSearch } from '../hooks/useTranscriptSearch';
import { parseTranscriptToSegments } from '../utils/transcriptParser';
import { TranscriptSegmentBlock } from './TranscriptSegmentBlock';

export interface SearchableTranscriptProps {
  transcript: string;
  /** Optional: ID of currently active segment (during playback) */
  activeSegmentId?: string;
  /** Optional: Handler when timestamp is clicked */
  onTimestampClick?: (timestampSeconds: number) => void;
  /** Whether to show speaker labels (only when diarization data is present) */
  includeSpeakers?: boolean;
}

export const SearchableTranscript = memo(function SearchableTranscript({
  transcript,
  activeSegmentId,
  onTimestampClick,
  includeSpeakers = false,
}: SearchableTranscriptProps) {
  const { t } = useTranslation();
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
  const segments = useMemo(
    () => parseTranscriptToSegments(transcript, includeSpeakers),
    [transcript, includeSpeakers]
  );

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
    <GlassCard variant="dark" className="overflow-hidden">
      {/* Accent top bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-primary/60" />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-widest uppercase bg-bg-surface text-text-tertiary border border-border">
              TXT
            </span>
            <Heading level="h3">{t('results.transcript.title')}</Heading>
          </div>

          {hasMatches && (
            <span className="text-xs font-mono text-primary tabular-nums">
              {t('results.transcript.matches', {
                current: currentMatchIndex + 1,
                total: totalMatches,
              })}
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('results.transcript.searchPlaceholder')}
              className="
                w-full pl-9 pr-9 py-2 rounded-lg text-sm
                bg-bg-surface border border-border
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
                transition-colors duration-150
              "
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                aria-label={t('results.transcript.clearSearch', 'Clear search')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasMatches && (
            <div className="flex gap-1">
              <button
                onClick={goToPreviousMatch}
                className="p-2 rounded-lg bg-bg-surface border border-border hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                aria-label="Previous match"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextMatch}
                className="p-2 rounded-lg bg-bg-surface border border-border hover:border-primary/40 hover:text-primary transition-colors cursor-pointer"
                aria-label="Next match"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-4" />

        {/* Transcript Content */}
        <div className="space-y-0.5">
          {segments.map((segment) => (
            <TranscriptSegmentBlock
              key={segment.id}
              segment={segment}
              isActive={segment.id === activeSegmentId}
              searchQuery={searchQuery}
              onTimestampClick={onTimestampClick}
            />
          ))}

          {segments.length === 0 && (
            <Text variant="body" color="secondary" className="text-center py-12">
              {t('results.transcript.noTranscript')}
            </Text>
          )}
        </div>
      </div>
    </GlassCard>
  );
});
