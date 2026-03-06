# Audio Preview on UploadRecordPage — Design Doc

**Date:** 2026-03-06
**Branch:** feature/ux-ui-refactoring
**Status:** Approved

---

## Problem

Users upload a file or finish recording but have no way to confirm the audio is correct before
hitting "Process Audio". They must either trust the filename/size metadata or proceed blind into
the (slow, costly) transcription pipeline.

---

## Goals

- Let users play back their audio inline, before processing
- Zero additional navigation step
- Works on both mobile (tabbed layout) and desktop (side-by-side)
- Lightweight: preview only, not a trim editor (that's the next page)

---

## Approach

**Native `<audio>` element** styled with custom controls (Option A).
Chosen over WaveSurfer because:

- WaveSurfer is already in the next step (AudioEditingPage) — showing it here would feel redundant
- Native audio decodes instantly, no canvas rendering overhead
- All seek/scrub capability still present via `<input type="range">`

---

## Architecture

```
MiniAudioPlayer                   ← new shared primitive
  ↑ used by
  ├── FilePreview                  ← extended (desktop, Option C)
  └── AudioPreviewBar              ← new component (mobile strip, lg:hidden)
        ↑ rendered in
        └── UploadRecordPage       (above <UploadRecordTabs>)
```

### Responsive placement

| Breakpoint        | Preview location                                           | Visibility                            |
| ----------------- | ---------------------------------------------------------- | ------------------------------------- |
| `< lg` (mobile)   | `AudioPreviewBar` above tab switcher + panels              | `lg:hidden`                           |
| `>= lg` (desktop) | Inside `FilePreview`, between file info and action buttons | `hidden lg:block` (or always visible) |

The `audioFile` state already lives in `UploadRecordPage` and is the single source of truth for
both placements.

---

## Component Specs

### `MiniAudioPlayer`

**Location:** `src/features/upload/components/MiniAudioPlayer.tsx`

**Props:**

```ts
interface MiniAudioPlayerProps {
  file: File | Blob;
  className?: string;
}
```

**Internal state:**

- `isPlaying: boolean`
- `currentTime: number`
- `duration: number`
- `objectUrl: string` — created via `URL.createObjectURL(file)`, revoked on unmount

**Layout (horizontal):**

```
[▶/⏸]  [seek bar ————●————————————]  [0:23 / 2:14]
  32px   flex-1, custom range input     text-xs tabular-nums
```

**Seek bar implementation:**

- Native `<input type="range" min="0" max={duration} step={0.1} value={currentTime}>`
- Fill effect: CSS `background: linear-gradient(to right, var(--color-primary) X%, var(--color-bg-tertiary) X%)` driven by `(currentTime/duration)*100`
- Thumb: `var(--color-primary)`, 12px circle, no default browser styling
- Track height: 3px

**Play/pause button:** 32×32px, rounded-full, `bg-primary/10`, icon `Play`/`Pause` size 16 from lucide.

**Time display:** `currentTime | duration` formatted as `M:SS`, `text-xs text-text-tertiary tabular-nums`.

**Accessibility:**

- `aria-label` on play button: `t('audioPreview.playAriaLabel')` / `t('audioPreview.pauseAriaLabel')`
- `aria-label` on seek bar: `t('audioPreview.seekAriaLabel')`
- Hidden `<audio>` element synced to state via event listeners (`timeupdate`, `durationchange`, `ended`)

---

### `FilePreview` extension (desktop)

`MiniAudioPlayer` inserted between the file info card and the action buttons.

```
[✓ File uploaded successfully]
──────────────────────────────────────────
[🎵 recording.webm          4.2 MB  audio/webm]
──────────────────────────────────────────
[▶  ────●──────────────  0:23 / 2:14]     ← NEW (always visible when file present)
──────────────────────────────────────────
[Replace File]  [🗑 Remove]
```

No layout change needed — the card expands naturally.

---

### `AudioPreviewBar` (mobile)

**Location:** `src/features/upload/components/AudioPreviewBar.tsx`

**Props:**

```ts
interface AudioPreviewBarProps {
  file: File | Blob;
}
```

Rendered in `UploadRecordPage` with `lg:hidden`, placed above `<UploadRecordTabs>`.
Slides in via `animate-fade-up` when `audioFile !== null`.

**Layout:**

```
GlassCard (p-3 rounded-xl border border-border)
  [🎵 filename.mp3 (truncated)]   [▶ ──●──── 0:23 / 2:14]
  flex items-center justify-between gap-3
```

Left: Music icon + filename (`truncate max-w-[120px]` or `max-w-[40%]`)
Right: `MiniAudioPlayer` (flex-1)

---

## i18n Keys (all 4 locales: en / it / de / es)

```json
"audioPreview": {
  "playAriaLabel": "Play audio",
  "pauseAriaLabel": "Pause audio",
  "seekAriaLabel": "Seek audio position",
  "previewLabel": "Audio preview"
}
```

---

## Files Changed

| Action | File                                                         |
| ------ | ------------------------------------------------------------ |
| Create | `src/features/upload/components/MiniAudioPlayer.tsx`         |
| Create | `src/features/upload/components/MiniAudioPlayer.test.tsx`    |
| Create | `src/features/upload/components/MiniAudioPlayer.stories.tsx` |
| Create | `src/features/upload/components/AudioPreviewBar.tsx`         |
| Create | `src/features/upload/components/AudioPreviewBar.test.tsx`    |
| Modify | `src/features/upload/components/FilePreview.tsx`             |
| Modify | `src/app/routes/UploadRecordPage.tsx`                        |
| Modify | `src/locales/en/translation.json`                            |
| Modify | `src/locales/it/translation.json`                            |
| Modify | `src/locales/de/translation.json`                            |
| Modify | `src/locales/es/translation.json`                            |

---

## Design Tokens Used

- `var(--color-primary)` — seek fill, play button bg tint, thumb
- `var(--color-bg-tertiary)` — seek track background
- `var(--color-bg-surface)` — card background
- `var(--color-border)` — card border
- `var(--color-text-tertiary)` — time display
- `var(--color-text-primary)` — filename

---

## Out of Scope

- Waveform visualization (that's AudioEditingPage)
- Volume control
- Speed control
- Trim handles
