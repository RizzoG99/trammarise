import type { ContentType } from '@/types/content-types';
import type { LanguageCode } from '@/types/languages';

export interface HistorySession {
  // Identity
  sessionId: string;

  // Metadata
  audioName: string;
  contentType: ContentType;
  language: LanguageCode;

  // Processing Status
  hasTranscript: boolean;
  hasSummary: boolean;

  // Timestamps
  createdAt: number;
  updatedAt: number;

  // Optional Metadata
  fileSizeBytes?: number;
  durationSeconds?: number;
}

export interface GroupedSessions {
  today: HistorySession[];
  yesterday: HistorySession[];
  thisWeek: HistorySession[];
  lastWeek: HistorySession[];
  older: Record<string, HistorySession[]>; // "January 2026" → sessions
}

export type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';

export interface FilterState {
  searchQuery: string;
  contentTypeFilter: ContentType | 'all';
  sortBy: SortOption;
}
