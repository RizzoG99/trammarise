import { useState, useMemo } from 'react';

export interface SearchMatch {
  index: number;
  text: string;
  position: number;
}

export function useTranscriptSearch(transcript: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Find all matches in the transcript
  const matches = useMemo((): SearchMatch[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const text = transcript.toLowerCase();
    const results: SearchMatch[] = [];
    let position = 0;

    while (position < text.length) {
      const index = text.indexOf(query, position);
      if (index === -1) break;

      results.push({
        index: results.length,
        text: transcript.substring(index, index + searchQuery.length),
        position: index,
      });

      position = index + 1;
    }

    return results;
  }, [transcript, searchQuery]);

  const goToNextMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
  };

  const goToPreviousMatch = () => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentMatchIndex(0);
  };

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
