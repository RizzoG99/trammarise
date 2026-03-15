import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { ContentType } from '@/types/content-types';
import type { SortOption } from '../types/history';

interface HistoryFilterPanelProps {
  isOpen: boolean;
  contentTypeFilter: ContentType | 'all';
  onContentTypeChange: (value: ContentType | 'all') => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onClose: () => void;
}

const CONTENT_TYPE_CHIPS: { value: ContentType | 'all'; labelKey: string }[] = [
  { value: 'all', labelKey: 'history.filter.allTypes' },
  { value: 'meeting', labelKey: 'home.meetingType.options.meeting' },
  { value: 'lecture', labelKey: 'home.meetingType.options.lecture' },
  { value: 'interview', labelKey: 'home.meetingType.options.interview' },
  { value: 'podcast', labelKey: 'home.meetingType.options.podcast' },
  { value: 'voice-memo', labelKey: 'home.meetingType.options.voice-memo' },
  { value: 'other', labelKey: 'home.meetingType.options.other' },
];

const SORT_CHIPS: { value: SortOption; labelKey: string }[] = [
  { value: 'newest', labelKey: 'history.sort.newest' },
  { value: 'oldest', labelKey: 'history.sort.oldest' },
  { value: 'a-z', labelKey: 'history.sort.nameAsc' },
  { value: 'z-a', labelKey: 'history.sort.nameDesc' },
];

export function HistoryFilterPanel({
  isOpen,
  contentTypeFilter,
  onContentTypeChange,
  sortBy,
  onSortChange,
  onClose,
}: HistoryFilterPanelProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="mt-2 p-4 bg-bg-surface border border-border rounded-xl space-y-4">
      {/* Content type */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
          {t('common.contentType', 'Content type')}
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPE_CHIPS.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => onContentTypeChange(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                contentTypeFilter === value
                  ? 'bg-primary text-white'
                  : 'bg-bg-secondary text-text-secondary border border-border hover:bg-bg-secondary/80'
              }`}
            >
              {t(labelKey, value)}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
          {t('common.sort', 'Sort')}
        </p>
        <div className="flex flex-wrap gap-2">
          {SORT_CHIPS.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => onSortChange(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                sortBy === value
                  ? 'bg-primary text-white'
                  : 'bg-bg-secondary text-text-secondary border border-border hover:bg-bg-secondary/80'
              }`}
            >
              {t(labelKey, value)}
            </button>
          ))}
        </div>
      </div>

      {/* Close / clear all */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          aria-label={t('history.filter.clearAll')}
        >
          <X className="w-3.5 h-3.5" />
          {t('history.filter.clearAll')}
        </button>
      </div>
    </div>
  );
}
