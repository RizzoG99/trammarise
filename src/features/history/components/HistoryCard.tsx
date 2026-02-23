import { Link } from 'react-router-dom';
import { Trash2, Calendar, FileText, Globe, CheckCircle2, Clock } from 'lucide-react';
import { GlassCard } from '@/lib/components/ui/GlassCard';
import { Button } from '@/lib/components/ui/Button';
import { Badge } from '@/lib/components/ui/Badge';
import { HistoryQuickActions } from './HistoryQuickActions';
import { useTranslation } from 'react-i18next';
import { useBlobDownload } from '../hooks/useBlobDownload';

import type { HistorySession } from '../types/history';
import { formatDate } from '../utils/formatters';
import { ROUTES } from '@/types/routing';
import { loadSessionMetadata } from '@/utils/session-manager';

interface HistoryCardProps {
  session: HistorySession;
  onDelete: (sessionId: string) => void;
  selected?: boolean;
  onSelect?: (sessionId: string) => void;
  selectionMode?: boolean;
}

export function HistoryCard({
  session,
  onDelete,
  selected,
  onSelect,
  selectionMode,
}: HistoryCardProps) {
  const { t } = useTranslation();
  const { download } = useBlobDownload({
    onError: (error) => {
      console.error('Download failed:', error);
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(session.sessionId);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(session.sessionId);
  };

  const handleCopySummary = async () => {
    try {
      const data = loadSessionMetadata(session.sessionId);
      if (data?.result?.summary) {
        await navigator.clipboard.writeText(data.result.summary);
      }
    } catch (err) {
      console.error('Failed to copy summary:', err);
    }
  };

  const handleDownload = async () => {
    try {
      await download(session.sessionId, session.audioName);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <Link
      to={ROUTES.RESULTS.replace(':sessionId', session.sessionId)}
      className="block group relative"
    >
      <GlassCard
        variant="dark"
        className={`h-full p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
          ${selected ? 'ring-2 ring-primary border-primary/50' : 'border-white/5'} 
          hover:border-primary/30`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Selection Checkbox */}
            <div
              className={`absolute top-5 left-5 z-20 transition-opacity duration-200 ${selectionMode || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-center justify-center w-5 h-5">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={handleCheckboxChange}
                  className="peer appearance-none w-5 h-5 rounded border border-gray-300 dark:border-gray-600 checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                  aria-label={t('history.card.select', { name: session.audioName })}
                />
                <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
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
                  <span className="hidden sm:inline">{t('history.card.processed')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('history.card.unprocessed')}</span>
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
              {t(`common.contentTypes.${session.contentType}`, session.contentType)}
            </Badge>
            <Badge variant="default" size="sm">
              <Globe className="w-3 h-3 mr-1.5 opacity-70" />
              {t(`common.languages.${session.language}`, session.language)}
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
              aria-label={t('history.card.delete', { name: session.audioName })}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
