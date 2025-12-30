import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Heading } from '../../../components/ui/Heading';
import { Text } from '../../../components/ui/Text';
import { useTranscriptSearch } from '../hooks/useTranscriptSearch';

export interface SearchableTranscriptProps {
  transcript: string;
}

export function SearchableTranscript({ transcript }: SearchableTranscriptProps) {
  const {
    searchQuery,
    setSearchQuery,
    matches,
    currentMatchIndex,
    totalMatches,
    goToNextMatch,
    goToPreviousMatch,
    clearSearch,
    hasMatches,
  } = useTranscriptSearch(transcript);

  // Highlight search matches in the text
  const highlightedText = () => {
    if (!searchQuery.trim()) return transcript;

    const parts = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // Add text before match
      parts.push(
        <span key={`text-${index}`}>
          {transcript.substring(lastIndex, match.position)}
        </span>
      );

      // Add highlighted match
      const isCurrentMatch = index === currentMatchIndex;
      parts.push(
        <mark
          key={`match-${index}`}
          className={`
            ${isCurrentMatch ? 'bg-primary text-white' : 'bg-yellow-300 dark:bg-yellow-600'}
            px-0.5 rounded
          `}
        >
          {transcript.substring(match.position, match.position + searchQuery.length)}
        </mark>
      );

      lastIndex = match.position + searchQuery.length;
    });

    // Add remaining text
    parts.push(
      <span key="text-end">
        {transcript.substring(lastIndex)}
      </span>
    );

    return parts;
  };

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
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap leading-relaxed text-text-primary">
          {highlightedText()}
        </div>
      </div>
    </GlassCard>
  );
}
