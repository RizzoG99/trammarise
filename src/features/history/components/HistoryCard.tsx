import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Copy, Check } from 'lucide-react';
import { GlassCard } from '@/lib/components/ui/GlassCard';
import { Badge } from '@/lib/components/ui/Badge';
import { Checkbox } from '@/lib/components/ui/Checkbox';
import { useTranslation } from 'react-i18next';

import type { HistorySession } from '../types/history';
import { formatDate, formatDuration } from '../utils/formatters';
import { ROUTES } from '@/types/routing';

interface HistoryCardProps {
  session: HistorySession;
  onDelete: (sessionId: string) => void;
  onCopySummary?: (sessionId: string) => void | Promise<void>;
  selected?: boolean;
  onSelect?: (sessionId: string) => void;
  selectionMode?: boolean;
}

const CONTENT_TYPE_BORDER_COLOR: Record<string, string> = {
  meeting: 'var(--color-primary)',
  lecture: 'color-mix(in srgb, var(--color-primary) 70%, transparent)',
  interview: 'color-mix(in srgb, var(--color-primary) 50%, transparent)',
  podcast: 'var(--color-accent-success)',
  'voice-memo': 'var(--color-accent-warning)',
  other: 'var(--color-border)',
};

export function HistoryCard({
  session,
  onDelete,
  onCopySummary,
  selected,
  onSelect,
  selectionMode,
}: HistoryCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(session.sessionId);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(session.sessionId);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onCopySummary || copying) return;
    setCopying(true);
    await onCopySummary(session.sessionId);
    setCopied(true);
    setCopying(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link
      to={ROUTES.RESULTS.replace(':sessionId', session.sessionId)}
      className="block group relative"
    >
      <GlassCard
        variant="dark"
        className={`h-full p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
          border-l-4
          ${selected ? 'ring-2 ring-primary border-primary/50' : 'hover:border-primary/30'}`}
        style={{
          borderLeftColor: CONTENT_TYPE_BORDER_COLOR[session.contentType] ?? 'var(--color-border)',
        }}
      >
        {/* Selection Checkbox — absolute top-left */}
        <div
          className={`absolute top-4 left-4 z-20 transition-opacity duration-200 ${selectionMode || selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={!!selected}
            onChange={handleCheckboxChange}
            aria-label={t('history.card.select', { name: session.audioName })}
          />
        </div>

        {/* Card content */}
        <div className="flex flex-col gap-3">
          {/* Title row: name + copy + status + delete — all inline, vertically aligned */}
          <div
            className={`transition-all duration-200 ${selectionMode || selected ? 'pl-8' : 'group-hover:pl-8'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <h3 className="flex-1 min-w-0 text-base font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                {session.audioName}
              </h3>

              {/* Copy + status + delete — all in one row, stopPropagation so clicks don't navigate */}
              <div
                className="flex items-center gap-1.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {session.hasSummary && onCopySummary && (
                  <button
                    onClick={handleCopy}
                    disabled={copying}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-primary/10 text-text-tertiary hover:text-primary transition-colors disabled:opacity-40 cursor-pointer"
                    title={t('history.quickActions.copy')}
                    aria-label={t('history.quickActions.copy')}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-accent-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-error hover:bg-accent-error/10 transition-all duration-200 cursor-pointer"
                  aria-label={t('history.card.delete', { name: session.audioName })}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Metadata row: date + type + language + duration */}
          <div
            className={`flex flex-wrap items-center gap-x-2 gap-y-1 transition-all duration-200 ${selectionMode || selected ? 'pl-8' : 'group-hover:pl-8'}`}
          >
            <span className="text-sm text-text-secondary">{formatDate(session.createdAt)}</span>
            <Badge variant="default" size="sm">
              {t(`common.contentTypes.${session.contentType}`, session.contentType)}
            </Badge>
            <Badge variant="default" size="sm">
              {t(`common.languages.${session.language}`, session.language)}
            </Badge>
            {session.durationSeconds != null && (
              <Badge variant="default" size="sm">
                {formatDuration(session.durationSeconds)}
              </Badge>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
