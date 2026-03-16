# History Page Redesign — Spec

**Date:** 2026-03-15
**Status:** Approved
**Scope:** `HistoryPage`, `HistoryCard`, `HistoryList`, `HistoryDashboard`, `HistoryQuickActions`, new `HistoryRowMobile`, new `HistoryFilterPanel`

---

## Problem

The History page has several mobile UX failures:

1. **Card layout** — full-width single-column GlassCards on mobile are tall and slow to scan; actions rely on `opacity-0 group-hover:opacity-100` which is inaccessible on touch devices.
2. **Filter bar** — search + content-type dropdown + sort dropdown in one row is too wide for phones.
3. **Stats dashboard** — 3 stacked full-width cards before the list means significant scroll before content on mobile.
4. **Design tokens** — multiple components use raw Tailwind gray/slate classes instead of CSS variable tokens. The page header uses a gradient text anti-pattern.
5. **Hardcoded strings** — date group headers ("Today", "Yesterday", etc.) and action labels are not i18n'd.

---

## Approved Design

### Mobile (< 640px / `sm` breakpoint)

**Page header:**

- Title: `Recordings` — `text-text-primary`, no gradient
- Subtitle: inline stats string using a single i18n key — `{count} sessions · ~{time} · Top: {topType}` (falls back to count-only if no sessions processed yet)
- No `HistoryDashboard` rendered on mobile (`hidden sm:block` wrapper)

**Filter bar (sticky, `top-4 z-30`):**

- Full-width search input (flex-1) + filter toggle button (⊟, 38×38px) on the right
- Tapping the filter button toggles `isFilterPanelOpen` state in `HistoryPage`
- `HistoryFilterPanel` renders inline below the search bar when open
- Active filters shown as dismissible chips below the bar (rendered in `HistoryPage` from filter state)

**`HistoryFilterPanel` content:**

- Pill-chip selectors for content type: All · Meeting · Lecture · Interview · Podcast · Voice Memo · Other
- Pill-chip selectors for sort: Newest · Oldest · A→Z · Z→A
- Close button

**Session list:**

- Compact list rows via `HistoryRowMobile` — no GlassCard, no grid
- Row: icon (34×34px rounded square, Mic SVG in primary) · name+subtitle (truncated) · status badge · ⋯ button (28×28px, `min-h-11` for touch)
- Subtitle: `{contentType} · {formattedDate}` in `text-text-secondary`
- Status badge: Done (accent-success) / Pending (accent-warning) via `<Badge>`
- Checkbox: visible in selection mode (same logic as `HistoryCard`)

**⋯ Dropdown menu (absolute-positioned, not a Portal):**

- Anchored to the ⋯ button, right-aligned, `z-50`
- Header: session name (non-interactive label, `text-text-secondary`, truncated)
- Copy summary (only if `session.hasSummary`) → `t('history.menu.copySummary')`
- Download audio → `t('history.menu.downloadAudio')`
- Divider
- Delete (red, destructive) → `t('history.menu.delete')`
- Closes on: outside click (`useEffect` + document mousedown listener), Escape key, or any action selection
- Focus: ⋯ button gets focus back on close

**Date group headers:** uppercase, letter-spaced, `text-text-tertiary` — i18n'd via `t('history.groups.*')`

**Selection / bulk delete bar:** unchanged (already mobile-friendly)

---

### Desktop (≥ 640px)

**Stats dashboard:** unchanged — `HistoryDashboard` wrapped in `<div className="hidden sm:block">` in `HistoryPage`

**Card layout:** unchanged — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` rich GlassCards with hover actions

**Filter bar:** unchanged — sticky row with search + `Select` dropdowns. `HistoryFilterPanel` not rendered on desktop.

---

### Shared / Both Breakpoints

**Design token cleanup (all touched components):**

- `text-gray-*`, `text-slate-*` → `text-text-primary / secondary / tertiary`
- `bg-gray-*`, `bg-slate-*` → `bg-bg-primary / surface / secondary`
- `border-gray-*` → `border-border`
- `hover:bg-red-50 dark:hover:bg-red-900/20` (HistoryCard delete btn) → `hover:bg-accent-error/10`
- Gradient heading (HistoryPage line ~178) → `text-text-primary`
- `text-slate-400` subtitle → `text-text-secondary`

**`useHistoryFilters` extension:**

- Hook currently exposes `searchQuery`, `sortBy`, `filteredSessions`, `hasActiveFilters`, `setSearchQuery`, `setSortBy`, `clearFilters`
- Add: `contentTypeFilter: ContentType | 'all'` and `setContentTypeFilter: (v: ContentType | 'all') => void`
- Filter logic: already handled by `HistoryFilters.tsx` (which will be deleted) — move the actual `contentTypeFilter` state and filtering logic into `useHistoryFilters`
- `HistoryPage` passes `contentTypeFilter` + `setContentTypeFilter` to `HistoryFilterPanel`

**`HistoryFilters.tsx` deletion:**

- Confirmed unused — `HistoryPage` builds its own inline filters and does not import this file
- Safe to delete

---

## Components Summary

| Component                 | Action     | Notes                                                                                                                                      |
| ------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `HistoryPage.tsx`         | Modify     | Mobile subtitle with stats; `isFilterPanelOpen` state; hide `HistoryDashboard` on mobile; design token cleanup; thread `contentTypeFilter` |
| `HistoryList.tsx`         | Modify     | Render `HistoryRowMobile` on `sm:hidden`, `HistoryCard` on `hidden sm:block`; i18n group header strings; design token on `DateGroupHeader` |
| `HistoryDashboard.tsx`    | Modify     | Wrap render in `<div className="hidden sm:block">` in caller (`HistoryPage`)                                                               |
| `HistoryCard.tsx`         | Modify     | Design token cleanup only (delete button hover colors)                                                                                     |
| `HistoryQuickActions.tsx` | No change  | Desktop hover pattern preserved                                                                                                            |
| `HistoryFilters.tsx`      | **Delete** | Unused — replaced by inline HistoryPage filters + new HistoryFilterPanel                                                                   |
| `useHistoryFilters.ts`    | Modify     | Add `contentTypeFilter` + `setContentTypeFilter` + filter logic                                                                            |
| `HistoryRowMobile`        | **New**    | `src/features/history/components/HistoryRowMobile.tsx`                                                                                     |
| `HistoryFilterPanel`      | **New**    | `src/features/history/components/HistoryFilterPanel.tsx`                                                                                   |

---

## i18n

All keys added to all 4 locales (en/it/de/es). Keys that already exist are marked ✓.

```
history.title                      ✓ exists
history.subtitle                   ✓ exists (update value to include stats: "{count} sessions · ~{time} · Top: {topType}")
history.searchPlaceholder          ✓ exists
history.sort.newest                ✓ exists
history.sort.oldest                ✓ exists
history.sort.nameAsc               ✓ exists
history.sort.nameDesc              ✓ exists
history.groups.today               NEW
history.groups.yesterday           NEW
history.groups.thisWeek            NEW
history.groups.lastWeek            NEW
history.menu.copySummary           NEW
history.menu.downloadAudio         NEW
history.menu.delete                NEW
history.filter.allTypes            NEW
history.filter.toggleAriaLabel     NEW  (aria-label for ⊟ button)
history.filter.clearAll            NEW
```

---

## Testing

### `HistoryRowMobile.test.tsx` (new)

- Renders name, subtitle (contentType + date), status badge
- Clicking the row navigates to results page
- ⋯ button opens dropdown menu
- Menu shows "Copy summary" only when `session.hasSummary = true`
- Clicking "Download audio" calls `onDownload` and closes menu
- Clicking "Delete" calls `onDelete` with sessionId and closes menu
- Escape key closes the open menu
- Checkbox is hidden by default, visible when `selectionMode = true`
- Clicking checkbox calls `onSelect` with sessionId

### `HistoryFilterPanel.test.tsx` (new)

- Not rendered when `isOpen = false`
- Renders pill chips for all content types when open
- Clicking a chip calls `onContentTypeChange` with correct value
- Active chip has `bg-primary` styling
- Renders pill chips for sort options
- Clicking sort chip calls `onSortChange`
- Close button calls `onClose`

### `useHistoryFilters.test.ts` (update)

- `contentTypeFilter` defaults to `'all'`
- `setContentTypeFilter('meeting')` filters sessions to meeting type only
- `clearFilters` resets `contentTypeFilter` to `'all'`
- `hasActiveFilters` is true when `contentTypeFilter !== 'all'`

### `HistoryList.test.tsx` (update)

- On mobile viewport renders `HistoryRowMobile` components
- On desktop viewport renders `HistoryCard` components
- Date group headers use i18n keys (mock `t` to verify key usage)

### Existing tests: no regressions expected; `HistoryCard.test.tsx` unchanged.

**Coverage target:** 80%+ per new component (project standard)

---

## Out of Scope

- New data fields or API changes
- Swipe-to-delete gesture
- Pagination / infinite scroll
- Storybook stories for new components (deferred to Phase 4 per MEMORY.md)
- `HistoryDashboard` internal changes (desktop unchanged)
