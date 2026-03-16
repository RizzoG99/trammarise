import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { Checkbox } from '@/lib/components/ui/Checkbox';
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

const LONG_PRESS_MS = 500;

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
  const [pressing, setPressing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLButtonElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  // Close on outside click or Escape
  useEffect(() => {
    const mouseHandler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        dotsRef.current?.focus();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        dotsRef.current?.focus();
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', mouseHandler);
      document.addEventListener('keydown', keyHandler);
    }
    return () => {
      document.removeEventListener('mousedown', mouseHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [menuOpen]);

  // Long-press to enter selection mode
  const handlePointerDown = (e: React.PointerEvent) => {
    if (selectionMode || (e.target as HTMLElement).closest('button, a[role]')) return;
    longPressTriggered.current = false;
    setPressing(true);
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setPressing(false);
      onSelect?.(session.sessionId);
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressing(false);
  };

  // On pointer cancel (e.g. phone call, scroll interrupt), also reset the triggered
  // ref so the next tap is not incorrectly suppressed.
  const handlePointerCancel = () => {
    cancelLongPress();
    longPressTriggered.current = false;
  };

  // In selection mode, row tap toggles selection instead of navigating
  const handleLinkClick = (e: React.MouseEvent) => {
    if (longPressTriggered.current) {
      e.preventDefault();
      longPressTriggered.current = false;
      return;
    }
    if (selectionMode) {
      e.preventDefault();
      onSelect?.(session.sessionId);
    }
  };

  // Clean up timer on unmount
  useEffect(
    () => () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    },
    []
  );

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
    <div
      className={`border-b border-border last:border-0 select-none transition-colors duration-150 ${pressing ? 'bg-primary/5' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 transition-transform duration-150 ${pressing ? 'scale-[0.98]' : ''}`}
      >
        {/* Selection checkbox — hidden unless selectionMode */}
        {selectionMode && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selected}
              onChange={handleCheckbox}
              aria-label={t('history.card.select', { name: session.audioName })}
            />
          </div>
        )}

        {/* Icon */}
        <div className="w-[34px] h-[34px] rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Mic className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
        </div>

        {/* Name + subtitle — navigates to results on click, or toggles selection in selectionMode */}
        <Link
          to={ROUTES.RESULTS.replace(':sessionId', session.sessionId)}
          className="flex-1 min-w-0"
          onClick={handleLinkClick}
          draggable={false}
        >
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
              className="w-11 h-11 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer"
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
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg text-text-tertiary hover:text-accent-error hover:bg-accent-error/10 transition-colors cursor-pointer"
            aria-label={t('history.card.delete', { name: session.audioName })}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
