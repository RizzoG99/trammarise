import { Link } from 'react-router-dom';
import { Trash2, Calendar, FileText, Globe, CheckCircle2, Clock } from 'lucide-react';
import { GlassCard } from '@/lib/components/ui/GlassCard';
import { Button } from '@/lib/components/ui/Button';
import { Badge } from '@/lib/components/ui/Badge';
import { HistoryQuickActions } from './HistoryQuickActions';

import type { HistorySession } from '../types/history';
import { formatDate } from '../utils/formatters';
import { ROUTES } from '@/types/routing';

interface HistoryCardProps {
  session: HistorySession;
  onDelete: (sessionId: string) => void;
  selected?: boolean;
  onSelect?: (sessionId: string) => void;
  selectionMode?: boolean;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  meeting: 'Meeting',
  lecture: 'Lecture',
  interview: 'Interview',
  podcast: 'Podcast',
  'voice-memo': 'Voice Memo',
  other: 'Other',
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
};

export function HistoryCard({
  session,
  onDelete,
  selected,
  onSelect,
  selectionMode,
}: HistoryCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(session.sessionId);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.(session.sessionId);
  };

  // Mock Copy - in real app would fetch summary from storage
  const handleCopySummary = async () => {
    await navigator.clipboard.writeText(`Summary for ${session.audioName}`);
  };

  const handleDownload = () => {
    // Mock download
    console.log('Download', session.audioName);
  };

  return (
    <Link
      to={ROUTES.RESULTS.replace(':sessionId', session.sessionId)}
      className="block group relative"
    >
      <GlassCard
        variant="light"
        className={`h-full p-5 hover:shadow-xl transition-all duration-300 border 
          ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200/50 dark:border-gray-700/50'} 
          hover:border-primary/30 dark:hover:border-primary/30 group-hover:-translate-y-1`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Selection Checkbox (Visible on hover or if selectionMode is active) */}
            <div
              onClick={handleSelect}
              className={`absolute top-5 left-5 z-20 transition-opacity duration-200 ${selectionMode || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-primary border-primary' : 'bg-white border-gray-300 dark:border-gray-600'}`}
              >
                {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>

            <div
              className={`flex-1 min-w-0 transition-all duration-200 ${selectionMode || selected ? 'pl-8' : 'group-hover:pl-8'}`}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-2 group-hover:text-primary transition-colors">
                {session.audioName}
              </h3>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(session.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {session.hasSummary ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Processed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unprocessed</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Badges */}
          <div
            className={`flex flex-wrap gap-2 mb-4 transition-all duration-200 ${selectionMode || selected ? 'pl-8' : 'group-hover:pl-8'}`}
          >
            <Badge variant="default" size="sm">
              <FileText className="w-3 h-3 mr-1.5 opacity-70" />
              {CONTENT_TYPE_LABELS[session.contentType] || session.contentType}
            </Badge>
            <Badge variant="default" size="sm">
              <Globe className="w-3 h-3 mr-1.5 opacity-70" />
              {LANGUAGE_LABELS[session.language] || session.language}
            </Badge>
          </div>

          <div
            className={`mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between transition-all duration-200 ${selectionMode || selected ? 'pl-8' : 'group-hover:pl-8'}`}
          >
            {/* Quick Actions (Hover) */}
            <div className="-ml-2">
              <HistoryQuickActions
                onCopySummary={session.hasSummary ? handleCopySummary : undefined}
                onDownload={handleDownload}
              />
            </div>

            <Button
              variant="ghost"
              onClick={handleDelete}
              className="w-8 h-8 !p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Delete recording: ${session.audioName}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
