import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/types/routing';
import { formatDate } from '../utils/formatters';
import type { HistorySession } from '../types/history';

interface HistoryRowMobileProps {
  session: HistorySession;
  onDelete: (sessionId: string) => void;
  onCopySummary?: (sessionId: string) => void;
  onSelect?: (sessionId: string) => void;
  selectionMode: boolean;
  selected: boolean;
}

export function HistoryRowMobile({
  session,
  onDelete,
  onCopySummary,
  onSelect,
  selectionMode,
  selected,
}: HistoryRowMobileProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        dotsRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        dotsRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  const handleDelete = () => {
    onDelete(session.sessionId);
    setMenuOpen(false);
  };

  const handleCopySummary = () => {
    onCopySummary?.(session.sessionId);
    setMenuOpen(false);
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(session.sessionId);
  };

  const contentTypeLabel = t(`common.contentTypes.${session.contentType}`, session.contentType);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      {/* Selection checkbox — hidden unless selectionMode */}
      {selectionMode && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={handleCheckbox}
            className="w-5 h-5 rounded border border-border checked:bg-primary checked:border-primary cursor-pointer"
            aria-label={t('history.card.select', { name: session.audioName })}
          />
        </div>
      )}

      {/* Icon */}
      <div className="w-[34px] h-[34px] rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Mic className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
      </div>

      {/* Name + subtitle — navigates to results on click */}
      <Link to={ROUTES.RESULTS.replace(':sessionId', session.sessionId)} className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{session.audioName}</p>
        <p className="text-xs text-text-secondary mt-0.5 truncate">
          {contentTypeLabel} · {formatDate(session.createdAt)}
        </p>
      </Link>

      {/* Actions: direct delete for pending, ⋯ menu for processed */}
      {session.hasSummary ? (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            ref={dotsRef}
            onClick={() => setMenuOpen((v) => !v)}
            className="w-7 h-7 min-h-11 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer"
            aria-label="More options"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 w-48 bg-bg-surface border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden"
            >
              <p className="px-3 py-2 text-xs text-text-tertiary truncate border-b border-border">
                {session.audioName}
              </p>
              <button
                role="menuitem"
                onClick={handleCopySummary}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 shrink-0 text-text-tertiary" />
                {t('history.menu.copySummary', 'Copy Summary')}
              </button>
              <div className="h-px bg-border mx-2 my-1" />
              <button
                role="menuitem"
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-accent-error hover:bg-accent-error/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                {t('history.menu.delete', 'Delete')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="w-7 h-7 min-h-11 shrink-0 flex items-center justify-center rounded-lg text-text-tertiary hover:text-accent-error hover:bg-accent-error/10 transition-colors cursor-pointer"
          aria-label={t('history.card.delete', { name: session.audioName })}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
