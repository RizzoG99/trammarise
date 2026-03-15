# History Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-optimised list view (`HistoryRowMobile` + `HistoryFilterPanel`) to the History page while cleaning up design tokens and i18n across existing components.

**Architecture:** `HistoryList` renders `HistoryRowMobile` on `sm:hidden` and `HistoryCard` on `hidden sm:block`; `HistoryFilterPanel` is toggled by an `isFilterPanelOpen` flag in `HistoryPage`; `HistoryDashboard` is hidden on mobile via a `hidden sm:block` wrapper; `useHistoryFilters` (already complete) feeds `contentTypeFilter` into both the panel and the list.

**Tech Stack:** React 19, TypeScript, Tailwind 4 CSS variables, react-i18next (4 locales), Vitest + @testing-library/react, react-router-dom.

---

## File Map

| File                                                          | Action     | Purpose                                                                                                                                                 |
| ------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/locales/{en,it,de,es}/translation.json`                  | Modify     | Add 10 new `history.*` i18n keys                                                                                                                        |
| `src/features/history/components/HistoryFilters.tsx`          | **Delete** | Unused — replaced by inline HistoryPage filters + new panel                                                                                             |
| `src/features/history/components/HistoryFilterPanel.tsx`      | **Create** | Mobile pill-chip filter panel (content type + sort)                                                                                                     |
| `src/features/history/components/HistoryFilterPanel.test.tsx` | **Create** | Tests for HistoryFilterPanel                                                                                                                            |
| `src/features/history/components/HistoryRowMobile.tsx`        | **Create** | Compact row with ⋯ dropdown for mobile list view                                                                                                        |
| `src/features/history/components/HistoryRowMobile.test.tsx`   | **Create** | Tests for HistoryRowMobile                                                                                                                              |
| `src/features/history/components/HistoryList.tsx`             | Modify     | Render mobile row on `sm:hidden`, card on `hidden sm:block`; i18n group headers                                                                         |
| `src/features/history/components/HistoryCard.tsx`             | Modify     | Replace `hover:bg-red-50 dark:hover:bg-red-900/20` → `hover:bg-accent-error/10`                                                                         |
| `src/app/routes/HistoryPage.tsx`                              | Modify     | Stats subtitle, `isFilterPanelOpen` state, `HistoryDashboard` (hidden sm:block), `HistoryFilterPanel`, design token cleanup, thread `contentTypeFilter` |

> **Note:** `useHistoryFilters` already exposes `contentTypeFilter` + `setContentTypeFilter` with filter logic. No changes needed.

---

## Chunk 1: Foundation — i18n keys + delete dead code

### Task 1: Add i18n keys to all 4 locales

**Files:**

- Modify: `src/locales/en/translation.json`
- Modify: `src/locales/it/translation.json`
- Modify: `src/locales/de/translation.json`
- Modify: `src/locales/es/translation.json`

- [ ] **Step 1: Add keys to `en/translation.json`**

Inside the existing `"history"` object (after the `"sort"` block), add:

```json
"groups": {
  "today": "Today",
  "yesterday": "Yesterday",
  "thisWeek": "This Week",
  "lastWeek": "Last Week"
},
"menu": {
  "copySummary": "Copy Summary",
  "downloadAudio": "Download Audio",
  "delete": "Delete"
},
"filter": {
  "allTypes": "All",
  "toggleAriaLabel": "Toggle filters",
  "clearAll": "Clear all"
}
```

Also update `"history.subtitle"` value:

```json
"subtitle": "{{count}} sessions · ~{{time}} · Top: {{topType}}"
```

- [ ] **Step 2: Add same keys to `it/translation.json`**

```json
"groups": {
  "today": "Oggi",
  "yesterday": "Ieri",
  "thisWeek": "Questa settimana",
  "lastWeek": "La settimana scorsa"
},
"menu": {
  "copySummary": "Copia riepilogo",
  "downloadAudio": "Scarica audio",
  "delete": "Elimina"
},
"filter": {
  "allTypes": "Tutti",
  "toggleAriaLabel": "Mostra filtri",
  "clearAll": "Cancella filtri"
}
```

Update subtitle: `"subtitle": "{{count}} sessioni · ~{{time}} · Top: {{topType}}"`

- [ ] **Step 3: Add same keys to `de/translation.json`**

```json
"groups": {
  "today": "Heute",
  "yesterday": "Gestern",
  "thisWeek": "Diese Woche",
  "lastWeek": "Letzte Woche"
},
"menu": {
  "copySummary": "Zusammenfassung kopieren",
  "downloadAudio": "Audio herunterladen",
  "delete": "Löschen"
},
"filter": {
  "allTypes": "Alle",
  "toggleAriaLabel": "Filter anzeigen",
  "clearAll": "Filter löschen"
}
```

Update subtitle: `"subtitle": "{{count}} Sitzungen · ~{{time}} · Top: {{topType}}"`

- [ ] **Step 4: Add same keys to `es/translation.json`**

```json
"groups": {
  "today": "Hoy",
  "yesterday": "Ayer",
  "thisWeek": "Esta semana",
  "lastWeek": "La semana pasada"
},
"menu": {
  "copySummary": "Copiar resumen",
  "downloadAudio": "Descargar audio",
  "delete": "Eliminar"
},
"filter": {
  "allTypes": "Todos",
  "toggleAriaLabel": "Mostrar filtros",
  "clearAll": "Limpiar filtros"
}
```

Update subtitle: `"subtitle": "{{count}} sesiones · ~{{time}} · Top: {{topType}}"`

- [ ] **Step 5: Build-verify i18n only**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors (json changes don't affect TS)

- [ ] **Step 6: Commit**

```bash
git add src/locales/
git commit -m "feat(i18n): add history groups, menu, filter keys to all 4 locales"
```

---

### Task 2: Delete HistoryFilters.tsx

**Files:**

- Delete: `src/features/history/components/HistoryFilters.tsx`

- [ ] **Step 1: Verify nothing imports HistoryFilters**

```bash
grep -r "HistoryFilters" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: only `HistoryFilters.tsx` itself appears (or no results).

- [ ] **Step 1b: Confirm no barrel export**

```bash
ls src/features/history/components/index.ts 2>/dev/null && grep "HistoryFilters" src/features/history/components/index.ts || echo "no index.ts — ok"
```

Expected: "no index.ts — ok" (or index.ts exists but does not export HistoryFilters).

- [ ] **Step 2: Delete the file**

```bash
rm src/features/history/components/HistoryFilters.tsx
```

- [ ] **Step 3: Run tests to confirm no breakage**

```bash
npm test -- --run 2>&1 | tail -5
```

Expected: same pass count as before (no new failures).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor(history): delete unused HistoryFilters component"
```

---

## Chunk 2: HistoryFilterPanel (new component)

### Task 3: Create HistoryFilterPanel

**Files:**

- Create: `src/features/history/components/HistoryFilterPanel.tsx`
- Create: `src/features/history/components/HistoryFilterPanel.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/features/history/components/HistoryFilterPanel.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HistoryFilterPanel } from './HistoryFilterPanel';
import type { SortOption } from '../types/history';

const defaultProps = {
  isOpen: true,
  contentTypeFilter: 'all' as const,
  onContentTypeChange: vi.fn(),
  sortBy: 'newest' as SortOption,
  onSortChange: vi.fn(),
  onClose: vi.fn(),
};

describe('HistoryFilterPanel', () => {
  it('does not render when isOpen is false', () => {
    render(<HistoryFilterPanel {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('button', { name: /all/i })).not.toBeInTheDocument();
  });

  it('renders pill chips for all content types when open', () => {
    render(<HistoryFilterPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /meeting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lecture/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /interview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /podcast/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voice memo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /other/i })).toBeInTheDocument();
  });

  it('calls onContentTypeChange with correct value when chip clicked', async () => {
    const user = userEvent.setup();
    const onContentTypeChange = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onContentTypeChange={onContentTypeChange} />);
    await user.click(screen.getByRole('button', { name: /meeting/i }));
    expect(onContentTypeChange).toHaveBeenCalledWith('meeting');
  });

  it('active content type chip has bg-primary styling', () => {
    render(<HistoryFilterPanel {...defaultProps} contentTypeFilter="meeting" />);
    const meetingChip = screen.getByRole('button', { name: /meeting/i });
    expect(meetingChip.className).toMatch(/bg-primary/);
  });

  it('renders pill chips for sort options', () => {
    render(<HistoryFilterPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /newest/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /oldest/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /a.z/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /z.a/i })).toBeInTheDocument();
  });

  it('calls onSortChange with correct value when sort chip clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onSortChange={onSortChange} />);
    await user.click(screen.getByRole('button', { name: /oldest/i }));
    expect(onSortChange).toHaveBeenCalledWith('oldest');
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<HistoryFilterPanel {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close|clear/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
npm test HistoryFilterPanel.test 2>&1 | tail -10
```

Expected: FAIL — `HistoryFilterPanel` not found.

- [ ] **Step 3: Implement HistoryFilterPanel**

Create `src/features/history/components/HistoryFilterPanel.tsx`:

```tsx
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
  { value: 'meeting', labelKey: 'common.contentTypes.meeting' },
  { value: 'lecture', labelKey: 'common.contentTypes.lecture' },
  { value: 'interview', labelKey: 'common.contentTypes.interview' },
  { value: 'podcast', labelKey: 'common.contentTypes.podcast' },
  { value: 'voice-memo', labelKey: 'common.contentTypes.voice-memo' },
  { value: 'other', labelKey: 'common.contentTypes.other' },
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
```

- [ ] **Step 4: Run tests**

```bash
npm test HistoryFilterPanel.test 2>&1 | tail -10
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/history/components/HistoryFilterPanel.tsx \
        src/features/history/components/HistoryFilterPanel.test.tsx
git commit -m "feat(history): add HistoryFilterPanel mobile filter component"
```

---

## Chunk 3: HistoryRowMobile (new component)

### Task 4: Create HistoryRowMobile

**Files:**

- Create: `src/features/history/components/HistoryRowMobile.tsx`
- Create: `src/features/history/components/HistoryRowMobile.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/features/history/components/HistoryRowMobile.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HistoryRowMobile } from './HistoryRowMobile';
import type { HistorySession } from '../types/history';

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const mockSession: HistorySession = {
  sessionId: 'session-abc',
  audioName: 'Team standup 2026-03-10',
  contentType: 'meeting',
  language: 'en',
  hasTranscript: true,
  hasSummary: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const defaultProps = {
  session: mockSession,
  onDelete: vi.fn(),
  onDownload: vi.fn(),
  onCopySummary: vi.fn(),
  onSelect: vi.fn(),
  selectionMode: false,
  selected: false,
};

beforeEach(() => vi.clearAllMocks());

describe('HistoryRowMobile', () => {
  it('renders session name', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    expect(screen.getByText('Team standup 2026-03-10')).toBeInTheDocument();
  });

  it('renders subtitle with contentType and date', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    // contentType label present
    expect(screen.getByText(/meeting/i)).toBeInTheDocument();
  });

  it('renders Done badge when hasSummary is true', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    expect(screen.getByText(/processed/i)).toBeInTheDocument();
  });

  it('renders Pending badge when hasSummary is false', () => {
    const pendingSession = { ...mockSession, hasSummary: false };
    renderWithRouter(<HistoryRowMobile {...defaultProps} session={pendingSession} />);
    expect(screen.getByText(/unprocessed/i)).toBeInTheDocument();
  });

  it('dots button opens the dropdown menu', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    const dotsBtn = screen.getByRole('button', { name: /more options/i });
    await user.click(dotsBtn);
    expect(screen.getByText(/download audio/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it('shows Copy Summary only when session.hasSummary is true', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    expect(screen.getByText(/copy summary/i)).toBeInTheDocument();
  });

  it('clicking Copy Summary calls onCopySummary and closes menu', async () => {
    const user = userEvent.setup();
    const onCopySummary = vi.fn();
    renderWithRouter(<HistoryRowMobile {...defaultProps} onCopySummary={onCopySummary} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    await user.click(screen.getByText(/copy summary/i));
    expect(onCopySummary).toHaveBeenCalledWith('session-abc');
    expect(screen.queryByText(/copy summary/i)).not.toBeInTheDocument();
  });

  it('does not show Copy Summary when session.hasSummary is false', async () => {
    const user = userEvent.setup();
    const noSummary = { ...mockSession, hasSummary: false };
    renderWithRouter(<HistoryRowMobile {...defaultProps} session={noSummary} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    expect(screen.queryByText(/copy summary/i)).not.toBeInTheDocument();
  });

  it('clicking Download audio calls onDownload and closes menu', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    renderWithRouter(<HistoryRowMobile {...defaultProps} onDownload={onDownload} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    await user.click(screen.getByText(/download audio/i));
    expect(onDownload).toHaveBeenCalledWith('session-abc', 'Team standup 2026-03-10');
    expect(screen.queryByText(/download audio/i)).not.toBeInTheDocument();
  });

  it('clicking Delete calls onDelete and closes menu', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithRouter(<HistoryRowMobile {...defaultProps} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    await user.click(screen.getByText(/^delete$/i));
    expect(onDelete).toHaveBeenCalledWith('session-abc');
    expect(screen.queryByText(/^delete$/i)).not.toBeInTheDocument();
  });

  it('Escape key closes the open menu', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    expect(screen.getByText(/download audio/i)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByText(/download audio/i)).not.toBeInTheDocument();
  });

  it('checkbox is hidden when selectionMode is false', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} selectionMode={false} />);
    const checkbox = screen.queryByRole('checkbox');
    // Hidden via CSS class — not rendered at all OR hidden
    if (checkbox) {
      expect(checkbox).not.toBeVisible();
    } else {
      expect(checkbox).toBeNull();
    }
  });

  it('checkbox is visible when selectionMode is true', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} selectionMode={true} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('clicking checkbox calls onSelect with sessionId', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithRouter(
      <HistoryRowMobile {...defaultProps} selectionMode={true} onSelect={onSelect} />
    );
    await user.click(screen.getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalledWith('session-abc');
  });
});
```

- [ ] **Step 2: Run tests to confirm failure**

```bash
npm test HistoryRowMobile.test 2>&1 | tail -10
```

Expected: FAIL — `HistoryRowMobile` not found.

- [ ] **Step 3: Implement HistoryRowMobile**

Create `src/features/history/components/HistoryRowMobile.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mic, MoreHorizontal, Copy, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/lib/components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/types/routing';
import { formatDate } from '../utils/formatters';
import type { HistorySession } from '../types/history';

interface HistoryRowMobileProps {
  session: HistorySession;
  onDelete: (sessionId: string) => void;
  onDownload: (sessionId: string, audioName: string) => void;
  onCopySummary?: (sessionId: string) => void;
  onSelect?: (sessionId: string) => void;
  selectionMode: boolean;
  selected: boolean;
}

export function HistoryRowMobile({
  session,
  onDelete,
  onDownload,
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

  const handleDownload = () => {
    onDownload(session.sessionId, session.audioName);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete(session.sessionId);
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

      {/* Status badge */}
      {session.hasSummary ? (
        <Badge variant="success" size="sm" className="shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="sr-only sm:not-sr-only">{t('history.card.processed')}</span>
        </Badge>
      ) : (
        <Badge variant="warning" size="sm" className="shrink-0">
          <span className="sr-only sm:not-sr-only">{t('history.card.unprocessed')}</span>
        </Badge>
      )}

      {/* ⋯ button + dropdown */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          ref={dotsRef}
          onClick={() => setMenuOpen((v) => !v)}
          className="w-7 h-7 min-h-11 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer"
          aria-label={t('common.moreOptions', 'More options')}
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
            {/* Header label */}
            <p className="px-3 py-2 text-xs text-text-tertiary truncate border-b border-border">
              {session.audioName}
            </p>

            {session.hasSummary && (
              <button
                role="menuitem"
                onClick={() => {
                  onCopySummary?.(session.sessionId);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 shrink-0 text-text-tertiary" />
                {t('history.menu.copySummary')}
              </button>
            )}

            <button
              role="menuitem"
              onClick={handleDownload}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0 text-text-tertiary" />
              {t('history.menu.downloadAudio')}
            </button>

            <div className="h-px bg-border mx-2 my-1" />

            <button
              role="menuitem"
              onClick={handleDelete}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-accent-error hover:bg-accent-error/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {t('history.menu.delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
npm test HistoryRowMobile.test 2>&1 | tail -15
```

Expected: all 12 tests PASS.

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/history/components/HistoryRowMobile.tsx \
        src/features/history/components/HistoryRowMobile.test.tsx
git commit -m "feat(history): add HistoryRowMobile compact mobile list row"
```

---

## Chunk 4: HistoryList updates

### Task 5: Update HistoryList — mobile rows, i18n group headers, token cleanup

**Files:**

- Modify: `src/features/history/components/HistoryList.tsx`
- Modify: `src/features/history/components/HistoryList.test.tsx` (if it exists, otherwise verify manually)

- [ ] **Step 1: Rewrite HistoryList.tsx**

Replace the entire file content:

```tsx
import { useTranslation } from 'react-i18next';
import { HistoryCard } from './HistoryCard';
import { HistoryRowMobile } from './HistoryRowMobile';
import type { GroupedSessions, HistorySession } from '../types/history';

interface HistoryListProps {
  groupedSessions: GroupedSessions;
  onDelete: (sessionId: string) => void;
  onDownload: (sessionId: string, audioName: string) => void;
  onCopySummary: (sessionId: string) => void;
  selectedIds: Set<string>;
  onToggleSelection: (sessionId: string) => void;
  selectionMode: boolean;
}

// Token cleanup: old class was `text-gray-500 dark:text-gray-400 uppercase tracking-wide`
// New: uses `text-text-tertiary` design token (no dark: variant needed)
const DateGroupHeader = ({ title }: { title: string }) => (
  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 mt-6 first:mt-0 px-1">
    {title}
  </h3>
);

export function HistoryList({
  groupedSessions,
  onDelete,
  onDownload,
  onCopySummary,
  selectedIds,
  onToggleSelection,
  selectionMode,
}: HistoryListProps) {
  const { t } = useTranslation();

  const hasAnySessions =
    groupedSessions.today.length > 0 ||
    groupedSessions.yesterday.length > 0 ||
    groupedSessions.thisWeek.length > 0 ||
    groupedSessions.lastWeek.length > 0 ||
    Object.keys(groupedSessions.older).length > 0;

  if (!hasAnySessions) {
    return null;
  }

  const renderGroup = (title: string, sessions: HistorySession[], groupIndex: number = 0) => (
    <div
      key={title}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${groupIndex * 100}ms` }}
    >
      <DateGroupHeader title={title} />

      {/* Mobile: compact list rows */}
      <div className="sm:hidden bg-bg-surface border border-border rounded-xl overflow-hidden">
        {sessions.map((session) => (
          <HistoryRowMobile
            key={session.sessionId}
            session={session}
            onDelete={onDelete}
            onDownload={onDownload}
            onCopySummary={onCopySummary}
            selected={selectedIds.has(session.sessionId)}
            onSelect={onToggleSelection}
            selectionMode={selectionMode}
          />
        ))}
      </div>

      {/* Desktop: grid cards */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session, index) => (
          <div
            key={session.sessionId}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
          >
            <HistoryCard
              session={session}
              onDelete={onDelete}
              selected={selectedIds.has(session.sessionId)}
              onSelect={onToggleSelection}
              selectionMode={selectionMode}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {groupedSessions.today.length > 0 &&
        renderGroup(t('history.groups.today'), groupedSessions.today, 0)}
      {groupedSessions.yesterday.length > 0 &&
        renderGroup(t('history.groups.yesterday'), groupedSessions.yesterday, 1)}
      {groupedSessions.thisWeek.length > 0 &&
        renderGroup(t('history.groups.thisWeek'), groupedSessions.thisWeek, 2)}
      {groupedSessions.lastWeek.length > 0 &&
        renderGroup(t('history.groups.lastWeek'), groupedSessions.lastWeek, 3)}
      {Object.entries(groupedSessions.older).map(([monthYear, sessions], groupIndex) =>
        renderGroup(monthYear, sessions, groupIndex + 4)
      )}
    </div>
  );
}
```

> **Key changes:** added `onDownload` prop (required to thread through to `HistoryRowMobile`); uses i18n group headers; mobile/desktop split rendering; `DateGroupHeader` tokens cleaned up.

- [ ] **Step 2: Run tests**

```bash
npm test HistoryList 2>&1 | tail -10
```

Expected: if `HistoryList.test.tsx` exists it may fail because `onDownload` prop is new. Fix any such failures by adding a `vi.fn()` for `onDownload` in the test file.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Fix any TS errors before proceeding.

- [ ] **Step 4: Commit**

```bash
git add src/features/history/components/HistoryList.tsx
git commit -m "feat(history): HistoryList renders HistoryRowMobile on mobile, i18n group headers"
```

---

### Task 5b: Create HistoryList.test.tsx

**Files:**

- Create: `src/features/history/components/HistoryList.test.tsx`

- [ ] **Step 1: Write HistoryList tests**

Create `src/features/history/components/HistoryList.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HistoryList } from './HistoryList';
import type { GroupedSessions } from '../types/history';

const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

const emptyGroups: GroupedSessions = {
  today: [],
  yesterday: [],
  thisWeek: [],
  lastWeek: [],
  older: {},
};

const makeSession = (id: string) => ({
  sessionId: id,
  audioName: `session-${id}.webm`,
  contentType: 'meeting' as const,
  language: 'en' as const,
  hasTranscript: true,
  hasSummary: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const defaultProps = {
  groupedSessions: emptyGroups,
  onDelete: vi.fn(),
  onDownload: vi.fn(),
  selectedIds: new Set<string>(),
  onToggleSelection: vi.fn(),
  selectionMode: false,
};

describe('HistoryList', () => {
  it('renders nothing when all groups are empty', () => {
    const { container } = render(
      <MemoryRouter>
        <HistoryList {...defaultProps} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls t() with history.groups.today key for today group header', () => {
    const groups = { ...emptyGroups, today: [makeSession('1')] };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(mockT).toHaveBeenCalledWith('history.groups.today');
  });

  it('calls t() with history.groups.yesterday key', () => {
    const groups = { ...emptyGroups, yesterday: [makeSession('2')] };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(mockT).toHaveBeenCalledWith('history.groups.yesterday');
  });

  it('calls t() with history.groups.thisWeek key', () => {
    const groups = { ...emptyGroups, thisWeek: [makeSession('3')] };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(mockT).toHaveBeenCalledWith('history.groups.thisWeek');
  });

  it('calls t() with history.groups.lastWeek key', () => {
    const groups = { ...emptyGroups, lastWeek: [makeSession('4')] };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(mockT).toHaveBeenCalledWith('history.groups.lastWeek');
  });

  it('renders session name for each session in today group', () => {
    const groups = {
      ...emptyGroups,
      today: [makeSession('abc'), makeSession('xyz')],
    };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(screen.getByText('session-abc.webm')).toBeInTheDocument();
    expect(screen.getByText('session-xyz.webm')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test HistoryList.test 2>&1 | tail -10
```

Expected: all 6 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/history/components/HistoryList.test.tsx
git commit -m "test(history): add HistoryList tests for i18n group keys and rendering"
```

---

## Chunk 5: HistoryCard design token cleanup

### Task 6: Clean up HistoryCard design tokens

**Files:**

- Modify: `src/features/history/components/HistoryCard.tsx`

- [ ] **Step 1: Replace red hover classes on delete button**

In `HistoryCard.tsx` at line ~154, change the `Button` className:

```tsx
// Before:
className =
  'w-8 h-8 !p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100';

// After:
className =
  'w-8 h-8 !p-0 text-text-tertiary hover:text-accent-error hover:bg-accent-error/10 rounded-full transition-colors opacity-0 group-hover:opacity-100';
```

- [ ] **Step 2: Run existing HistoryCard tests**

```bash
npm test HistoryCard.test 2>&1 | tail -10
```

Expected: all tests PASS (no assertions check these CSS classes).

- [ ] **Step 3: Commit**

```bash
git add src/features/history/components/HistoryCard.tsx
git commit -m "fix(history): replace raw red Tailwind classes with accent-error tokens in HistoryCard"
```

---

## Chunk 6: HistoryPage — wire it all together

### Task 7: Update HistoryPage

**Files:**

- Modify: `src/app/routes/HistoryPage.tsx`

This is the largest task. It replaces the entire component. Work through it in sub-steps.

- [ ] **Step 1: Add `isFilterPanelOpen` state + `contentTypeFilter` destructuring**

At the top of `HistoryPage`, update the `useHistoryFilters` destructuring to include `contentTypeFilter` and `setContentTypeFilter`:

```tsx
const {
  searchQuery,
  contentTypeFilter,
  sortBy,
  filteredSessions,
  hasActiveFilters,
  setSearchQuery,
  setContentTypeFilter,
  setSortBy,
  clearFilters,
} = useHistoryFilters(sessions);
```

Add the `isFilterPanelOpen` state:

```tsx
const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
```

- [ ] **Step 2: Update imports**

Add these imports at the top of `HistoryPage.tsx`:

```tsx
import { SlidersHorizontal } from 'lucide-react';
import { HistoryDashboard } from '@/features/history/components/HistoryDashboard';
import { HistoryFilterPanel } from '@/features/history/components/HistoryFilterPanel';
import { calculateHistoryStats } from '@/features/history/utils/historyStats';
import { formatDuration } from '@/features/history/utils/formatters';
```

Remove `Lock` from the Lucide import if it's no longer used elsewhere (keep it if used in the banner).

- [ ] **Step 3: Replace the page header section**

Find the `{/* Header Section */}` block (lines ~176-185) and replace it:

```tsx
{
  /* Header Section */
}
{
  (() => {
    const stats = calculateHistoryStats(sessions);
    const time = stats.isApproximate
      ? `~${formatDuration(stats.totalDurationSeconds)}`
      : formatDuration(stats.totalDurationSeconds);
    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">{t('history.title')}</h1>
          {/* Mobile: compact stats inline */}
          <p className="text-text-secondary sm:hidden">
            {sessions.length > 0
              ? t('history.subtitle', {
                  count: sessions.length,
                  time,
                  topType: stats.topContentType,
                })
              : t('history.subtitle', { count: 0, time: '0s', topType: '—' })}
          </p>
          {/* Desktop: simple count */}
          <p className="hidden sm:block text-text-secondary">
            {t('history.subtitle', { count: sessions.length, time, topType: stats.topContentType })}
          </p>
        </div>
      </div>
    );
  })();
}

{
  /* Stats Dashboard — desktop only */
}
<div className="hidden sm:block">
  <HistoryDashboard sessions={sessions} />
</div>;
```

- [ ] **Step 4: Replace the filter bar section**

Find the `{/* Filters & Search */}` GlassCard block and replace it:

```tsx
{
  /* Filters & Search */
}
<div className="sticky top-4 z-30">
  <GlassCard
    variant="glow"
    className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
  >
    {/* Mobile: search + filter toggle button */}
    <div className="flex items-center gap-2 w-full sm:hidden">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('history.searchPlaceholder')}
          className="pl-10 bg-bg-secondary/50 border-border text-text-primary placeholder:text-text-tertiary focus:ring-primary/50"
        />
      </div>
      <button
        onClick={() => setIsFilterPanelOpen((v) => !v)}
        className={`w-[38px] h-[38px] shrink-0 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
          isFilterPanelOpen || hasActiveFilters
            ? 'bg-primary/10 border-primary/40 text-primary'
            : 'bg-bg-surface border-border text-text-tertiary hover:text-text-primary'
        }`}
        aria-label={t('history.filter.toggleAriaLabel')}
        aria-expanded={isFilterPanelOpen}
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>
    </div>

    {/* Desktop: full search + sort dropdowns */}
    <div className="hidden sm:flex items-center gap-4 w-full">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('history.searchPlaceholder')}
          className="pl-10 bg-bg-secondary/50 border-border text-text-primary placeholder:text-text-tertiary focus:ring-primary/50"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Select
          value={sortBy}
          onChange={(value) => setSortBy(value as SortOption)}
          className="w-48"
          options={[
            { value: 'newest', label: t('history.sort.newest') },
            { value: 'oldest', label: t('history.sort.oldest') },
            { value: 'a-z', label: t('history.sort.nameAsc') },
            { value: 'z-a', label: t('history.sort.nameDesc') },
          ]}
        />
      </div>
    </div>
  </GlassCard>

  {/* Mobile filter panel — inline below bar */}
  <div className="sm:hidden">
    <HistoryFilterPanel
      isOpen={isFilterPanelOpen}
      contentTypeFilter={contentTypeFilter}
      onContentTypeChange={setContentTypeFilter}
      sortBy={sortBy}
      onSortChange={setSortBy}
      onClose={() => setIsFilterPanelOpen(false)}
    />
  </div>
</div>;
```

- [ ] **Step 5: Update HistoryList call to pass `onDownload`**

The `HistoryList` now requires `onDownload`. Add a handler and pass it:

```tsx
// Add these handlers (near other handlers, e.g. after handleDeleteClick):
const handleDownload = async (sessionId: string, audioName: string) => {
  try {
    await download(sessionId, audioName);
  } catch (err) {
    console.error('Download failed:', err);
  }
};

const handleCopySummary = async (sessionId: string) => {
  try {
    const data = loadSessionMetadata(sessionId);
    if (data?.result?.summary) {
      await navigator.clipboard.writeText(data.result.summary);
    }
  } catch (err) {
    console.error('Failed to copy summary:', err);
  }
};

// Import at top of file (if not already present):
// import { loadSessionMetadata } from '@/utils/session-manager';
```

Import `useBlobDownload`:

```tsx
import { useBlobDownload } from '@/features/history/hooks/useBlobDownload';
```

Add inside `HistoryPage` function body:

```tsx
const { download } = useBlobDownload({ onError: (err) => console.error(err) });
```

Then update the `HistoryList` call:

```tsx
<HistoryList
  groupedSessions={groupedSessions}
  onDelete={handleDeleteClick}
  onDownload={handleDownload}
  onCopySummary={handleCopySummary}
  selectedIds={selectedIds}
  onToggleSelection={toggleSelection}
  selectionMode={hasSelection}
/>
```

- [ ] **Step 6: Fix remaining design token issues in HistoryPage**

Run audit to find raw Tailwind color classes:

```bash
grep -n "text-slate-\|text-gray-\|bg-gray-\|bg-red-\|dark:bg-red-\|text-red-\|dark:text-red-\|text-gray-900 dark:text-white\|bg-gradient-to-r" src/app/routes/HistoryPage.tsx
```

Fix each occurrence found (exact replacements):

| Find                                                                     | Replace               |
| ------------------------------------------------------------------------ | --------------------- |
| `bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400` | `text-text-primary`   |
| `text-slate-400`                                                         | `text-text-secondary` |
| `text-gray-900 dark:text-white`                                          | `text-text-primary`   |
| `text-gray-600 dark:text-gray-400`                                       | `text-text-secondary` |
| `bg-red-50 dark:bg-red-900/20`                                           | `bg-accent-error/10`  |
| `text-red-600 dark:text-red-400`                                         | `text-accent-error`   |
| `bg-red-50`                                                              | `bg-accent-error/10`  |
| `text-red-600`                                                           | `text-accent-error`   |

Run the audit again after fixes to confirm 0 remaining raw color tokens.

- [ ] **Step 7: Run full test suite**

```bash
npm test -- --run 2>&1 | tail -15
```

Fix any failures before committing.

- [ ] **Step 8: Type-check and lint**

```bash
npx tsc --noEmit 2>&1 | head -20 && npm run lint 2>&1 | head -20
```

Fix all errors.

- [ ] **Step 9: Commit**

```bash
git add src/app/routes/HistoryPage.tsx
git commit -m "feat(history): mobile-first HistoryPage with stats subtitle, filter panel, HistoryDashboard desktop-only"
```

---

## Chunk 7: Final verification

### Task 8: Full regression + build check

- [ ] **Step 1: Run complete test suite**

```bash
npm run test:all 2>&1 | tail -20
```

Expected: same or better pass count vs baseline, 0 new failures.

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -15
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Lint**

```bash
npm run lint 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 4: Create PR**

```bash
git push -u origin feature/history-page-redesign
gh pr create \
  --title "feat(history): mobile-first history page redesign" \
  --body "$(cat <<'EOF'
## Summary
- New `HistoryRowMobile` compact list rows with ⋯ dropdown menu for mobile (<640px)
- New `HistoryFilterPanel` pill-chip filter panel (content type + sort), toggled by filter button
- `HistoryDashboard` hidden on mobile; stats summarised inline in page subtitle
- `HistoryList` renders mobile rows on `sm:hidden`, desktop cards on `hidden sm:block`; i18n group headers
- Design token cleanup: `text-gray-*`, `text-slate-*` → CSS variable tokens across HistoryPage/HistoryCard/HistoryList
- Deleted unused `HistoryFilters.tsx`
- 10 new i18n keys across en/it/de/es

## Test plan
- [ ] `npm test HistoryRowMobile.test` — 12 tests pass
- [ ] `npm test HistoryFilterPanel.test` — 7 tests pass
- [ ] `npm test HistoryList` — all pass
- [ ] `npm run test:all` — no regressions
- [ ] `npm run build` — clean build
- [ ] Manual: open History on mobile viewport, verify compact rows + filter drawer
- [ ] Manual: open History on desktop viewport, verify card grid + stats dashboard unchanged

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
