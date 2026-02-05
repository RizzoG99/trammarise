import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/lib/components/ui/Input';
import { Button } from '@/lib/components/ui/Button';
import type { ContentType } from '@/types/content-types';
import type { SortOption } from '../types/history';

interface HistoryFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  contentTypeFilter: ContentType | 'all';
  onContentTypeChange: (type: ContentType | 'all') => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const DEBOUNCE_MS = 300;

export function HistoryFilters({
  searchQuery,
  onSearchChange,
  contentTypeFilter,
  onContentTypeChange,
  sortBy,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}: HistoryFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearchChange(localSearch);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [localSearch, onSearchChange]);

  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search recordings..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 pr-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-primary/50"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Content Type Filter */}
          <div className="relative">
            <select
              value={contentTypeFilter}
              onChange={(e) => onContentTypeChange(e.target.value as ContentType | 'all')}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-medium"
            >
              <option value="all">All Content Types</option>
              <option value="meeting">Meeting</option>
              <option value="lecture">Lecture</option>
              <option value="interview">Interview</option>
              <option value="podcast">Podcast</option>
              <option value="voice-memo">Voice Memo</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-transparent cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-sm font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-sm h-auto py-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
