import { useState, useMemo } from 'react';
import type { HistorySession, SortOption, FilterState } from '../types/history';
import type { ContentType } from '@/types/content-types';

interface UseHistoryFiltersReturn extends FilterState {
  filteredSessions: HistorySession[];
  hasActiveFilters: boolean;
  setSearchQuery: (query: string) => void;
  setContentTypeFilter: (contentType: ContentType | 'all') => void;
  setSortBy: (sortBy: SortOption) => void;
  clearFilters: () => void;
}

/**
 * Hook to manage filtering and sorting of history sessions
 * Uses useMemo for performance optimization
 */
export function useHistoryFilters(sessions: HistorySession[]): UseHistoryFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' || contentTypeFilter !== 'all';
  }, [searchQuery, contentTypeFilter]);

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Filter by search query (case-insensitive)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((session) => session.audioName.toLowerCase().includes(query));
    }

    // Filter by content type
    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter((session) => session.contentType === contentTypeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'a-z':
          return a.audioName.localeCompare(b.audioName);
        case 'z-a':
          return b.audioName.localeCompare(a.audioName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, searchQuery, contentTypeFilter, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setContentTypeFilter('all');
    setSortBy('newest');
  };

  return {
    searchQuery,
    contentTypeFilter,
    sortBy,
    filteredSessions,
    hasActiveFilters,
    setSearchQuery,
    setContentTypeFilter,
    setSortBy,
    clearFilters,
  };
}
