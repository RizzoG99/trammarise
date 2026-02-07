import { Search, X } from 'lucide-react';
import { useMemo, useEffect, memo, useState } from 'react';
import { GlassCard, Heading, Text } from '@/lib';
import { useTranslation } from 'react-i18next';
import type { Utterance } from '../../../types/audio';

export interface SpeakerTranscriptViewProps {
  utterances: Utterance[];
  /** Optional: Current audio playback time in seconds */
  currentTime?: number;
  /** Optional: Handler when timestamp is clicked */
  onTimestampClick?: (timestampSeconds: number) => void;
}

/**
 * Speaker colors for visual distinction (up to 10 speakers)
 */
const SPEAKER_COLORS = [
  'from-blue-500/20 to-blue-600/10',
  'from-green-500/20 to-green-600/10',
  'from-purple-500/20 to-purple-600/10',
  'from-orange-500/20 to-orange-600/10',
  'from-pink-500/20 to-pink-600/10',
  'from-cyan-500/20 to-cyan-600/10',
  'from-yellow-500/20 to-yellow-600/10',
  'from-indigo-500/20 to-indigo-600/10',
  'from-red-500/20 to-red-600/10',
  'from-teal-500/20 to-teal-600/10',
];

/**
 * Format timestamp in milliseconds to MM:SS format
 */
function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get speaker color class based on speaker label
 */
function getSpeakerColor(speaker: string, speakerMap: Map<string, number>): string {
  if (!speakerMap.has(speaker)) {
    speakerMap.set(speaker, speakerMap.size);
  }
  const index = speakerMap.get(speaker)!;
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}

/**
 * SpeakerTranscriptView - Display transcript with speaker labels
 *
 * Shows utterances grouped by speaker with timestamps, supports search,
 * and allows clicking timestamps to jump to that point in the audio.
 */
export const SpeakerTranscriptView = memo(function SpeakerTranscriptView({
  utterances,
  currentTime = 0,
  onTimestampClick,
}: SpeakerTranscriptViewProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Create speaker-to-index map for consistent coloring
  // Reset when utterances change (e.g., switching sessions)
  const speakerMap = useMemo(() => new Map<string, number>(), [utterances]);

  // Filter utterances by search query
  const filteredUtterances = useMemo(() => {
    if (!searchQuery.trim()) return utterances;

    const query = searchQuery.toLowerCase();
    return utterances.filter((utterance) => utterance.text.toLowerCase().includes(query));
  }, [utterances, searchQuery]);

  // Find active utterance based on current playback time
  const activeUtteranceId = useMemo(() => {
    const currentTimeMs = currentTime * 1000;
    const active = utterances.find((utt) => currentTimeMs >= utt.start && currentTimeMs < utt.end);
    return active ? `utterance-${utterances.indexOf(active)}` : null;
  }, [currentTime, utterances]);

  // Auto-scroll to active utterance during playback
  useEffect(() => {
    if (activeUtteranceId) {
      const element = document.getElementById(activeUtteranceId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeUtteranceId]);

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <GlassCard variant="light" className="p-6">
      {/* Header with Search */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Heading level="h3">{t('results.transcript.title')}</Heading>
          <span className="text-xs text-text-tertiary bg-bg-surface px-2 py-1 rounded">
            {utterances.length} {t('results.transcript.utterances')}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('results.transcript.searchPlaceholder')}
            className="
              w-full pl-10 pr-10 py-2 rounded-lg
              bg-[var(--color-bg-surface)] border border-border
              text-text-primary placeholder:text-text-tertiary
              focus:outline-none focus:border-primary
            "
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results count */}
        {searchQuery && (
          <Text variant="caption" color="tertiary" className="mt-2">
            {filteredUtterances.length} {t('results.transcript.resultsFound')}
          </Text>
        )}
      </div>

      {/* Utterances List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredUtterances.length === 0 ? (
          <div className="text-center py-8">
            <Text variant="body" color="secondary">
              {searchQuery
                ? t('results.transcript.noResults')
                : t('results.transcript.noUtterances')}
            </Text>
          </div>
        ) : (
          filteredUtterances.map((utterance) => {
            const utteranceId = `utterance-${utterances.indexOf(utterance)}`;
            const isActive = utteranceId === activeUtteranceId;
            const colorClass = getSpeakerColor(utterance.speaker, speakerMap);

            return (
              <div
                key={utteranceId}
                id={utteranceId}
                className={`
                  p-4 rounded-lg border transition-all
                  ${
                    isActive
                      ? 'border-primary bg-gradient-to-r ' + colorClass + ' shadow-md scale-[1.02]'
                      : 'border-border bg-bg-surface hover:border-border-hover'
                  }
                `}
              >
                {/* Speaker and Timestamp */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      bg-gradient-to-r ${colorClass}
                      border border-border
                    `}
                    >
                      {utterance.speaker}
                    </span>
                    {utterance.confidence && (
                      <span className="text-xs text-text-tertiary">
                        {Math.round(utterance.confidence * 100)}%
                      </span>
                    )}
                  </div>
                  {onTimestampClick && (
                    <button
                      onClick={() => onTimestampClick(utterance.start / 1000)}
                      className="
                        text-xs text-primary hover:text-primary-dark
                        font-mono transition-colors
                      "
                      aria-label={`Jump to ${formatTimestamp(utterance.start)}`}
                    >
                      {formatTimestamp(utterance.start)}
                    </button>
                  )}
                </div>

                {/* Utterance Text */}
                <Text variant="body" color="primary" className="leading-relaxed">
                  {utterance.text}
                </Text>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
});
