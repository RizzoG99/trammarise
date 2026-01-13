import { useState, useMemo, useCallback } from 'react';

export interface SearchMatch {
  index: number;
  text: string;
  position: number;
}

export interface TranscriptSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  matches: SearchMatch[];
  currentMatchIndex: number;
  currentMatch: SearchMatch | undefined;
  totalMatches: number;
  goToNextMatch: () => void;
  goToPreviousMatch: () => void;
  clearSearch: () => void;
  hasMatches: boolean;
}

export function useTranscriptSearch(transcript: string): TranscriptSearchResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Find all matches in the transcript
  const matches = useMemo((): SearchMatch[] => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return [];

    const query = trimmedQuery.toLowerCase();
    const text = transcript.toLowerCase();
    const results: SearchMatch[] = [];
    let position = 0;

    while (position < text.length) {
      const index = text.indexOf(query, position);
      if (index === -1) break;

      results.push({
        index: results.length,
        text: transcript.substring(index, index + trimmedQuery.length),
        position: index,
      });

      position = index + 1;
    }

    return results;
  }, [transcript, searchQuery]);

  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
  }, [matches.length]);

  const goToPreviousMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentMatchIndex(0);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    matches,
    currentMatchIndex,
    currentMatch: matches[currentMatchIndex],
    totalMatches: matches.length,
    goToNextMatch,
    goToPreviousMatch,
    clearSearch,
    hasMatches: matches.length > 0,
  };
}
