# AudioEditingPage Redesign

**Date:** 2026-03-06
**Branch:** feature/ux-ui-refactoring
**Status:** Design approved

## Problem Statement

The AudioEditingPage has three issues:

1. **Broken**: WaveSurfer region selection is wired but doesn't work reliably; manual start/end time inputs are missing entirely
2. **Mandatory friction**: users who just want to process the full audio are forced through an intermediate step
3. **Design inconsistency**: hardcoded `bg-blue-500`, `hover:bg-gray-100/50` etc. — doesn't match the app's design token system

## Validated Use Case

**Scenario A only**: User uploads/records a long audio (e.g., 2-hour conference) and wants to transcribe only a specific portion (e.g., the 30-minute keynote). The waveform is the right tool for this — they need to visually locate the segment and set precise in/out points.

All other users should bypass the page entirely.

---

## Solution Overview

**Option B — Fix and keep AudioEditingPage, make it optional.**

The flow becomes:

```
Upload (audio loaded)
  ├─ "Process Audio" ──────────────────→ /processing/:sessionId
  └─ "Trim audio first" ───────────────→ /audio/:sessionId (AudioEditingPage)
```

---

## Part 1: UploadRecordPage Changes

### New Secondary CTA

When `audioFile !== null`, render a secondary ghost button alongside the existing "Process Audio" button:

```
[  Process Audio  (primary)  ]   [  Trim audio  (ghost)  ]
```

- "Process Audio" remains the dominant primary CTA — unchanged behavior, navigates directly to `/processing/:sessionId`
- "Trim audio" is secondary (ghost/outline style, `var(--color-primary)` text) — navigates to `/audio/:sessionId`
- Both CTAs only visible when audio file is loaded
- On mobile: stack vertically, "Process Audio" first

### i18n keys to add

```json
"audioEditing": {
  "trimButtonLabel": "Trim audio",
  "trimButtonHint": "Select a specific segment"
}
```

---

## Part 2: AudioEditingPage Redesign

### Layout Structure

```
PageLayout
├── Page Header
│     ├── H1: filename
│     ├── Text: instructions (updated copy)
│     └── AudioStatusBadges (duration, format)
│
├── Waveform Card (GlassCard variant="dark")
│     ├── Toolbar row
│     │     └── RegionTimeDisplay (shown only when region set)
│     ├── WaveformPlayer (region selection enabled)
│     ├── NEW: Time Inputs Row
│     │     ├── [Start  00:00] ←→ [End  00:00]  [Duration: --:--]
│     │     └── [Clear region] button (when region set)
│     ├── TimelineRuler
│     └── EnhancedPlaybackControls
│
└── Action Buttons
      ├── No region: "Process Full Audio" (primary)
      └── Region set: "Process Selection" (primary) + "Process Full Audio" (secondary)
```

### Time Inputs Row — New Component `TrimTimeInputs`

**Bidirectional sync:**

- Drag on waveform → region-updated event → update input values
- User types in input → parse MM:SS → call `region.setOptions({ start, end })` on WaveSurfer

**Input design:**

```
Start                    End
[  label  ]              [  label  ]
[ 00 : 00 ]              [ 20 : 00 ]      Duration: 20:00
```

- `<label>` above each input (never placeholder-only — ux-pro-max requirement)
- Monospace font (`font-mono`) for time values — signals precision
- `type="text"` with pattern validation `[0-9]{1,2}:[0-9]{2}` (not `type="number"` — colon format)
- On blur: validate and clamp (start < end, end <= duration)
- Error state: red border + inline message beneath the offending input
- "Clear" button (text-only, small) resets region and clears inputs

**Accessibility:**

- Each input has `htmlFor` label
- `aria-label="Start time"` / `aria-label="End time"` on inputs
- Keyboard: Tab moves Start → End → Clear → action buttons in order

### WaveSurfer Region Fix

Current issue: `enableRegionSelection()` and `getActiveRegion()` are called on the player ref but the Regions plugin may not be initialized when `handleWaveSurferReady` fires. Fix strategy:

1. Initialize Regions plugin inside `WaveformPlayer` during wavesurfer creation (not on ready callback)
2. Expose `regions` plugin instance via `WaveformPlayerRef`
3. In `AudioEditingPage.handleWaveSurferReady`: subscribe to `region-created` / `region-updated` / `region-removed` immediately on ref assignment
4. Region fill color: `var(--color-primary)` at 15% opacity; handles: `var(--color-primary)` solid

### Design Token Cleanup

Replace all hardcoded colors throughout `AudioEditingPage.tsx`, `EnhancedPlaybackControls.tsx`, `AudioStatusBadges.tsx`, `RegionTimeDisplay.tsx`, `TimelineRuler.tsx`:

| Old (hardcoded)        | New (token)                                                |
| ---------------------- | ---------------------------------------------------------- |
| `bg-blue-500`          | `style={{ backgroundColor: 'var(--color-primary)' }}`      |
| `hover:bg-blue-600`    | `onMouseEnter/Leave` with `var(--color-primary-hover)`     |
| `text-blue-100`        | `var(--color-primary-light)`                               |
| `hover:bg-gray-100/50` | `hover:bg-bg-tertiary/50`                                  |
| `bg-bg-secondary`      | `style={{ backgroundColor: 'var(--color-bg-secondary)' }}` |
| `border-2`             | `border` (matches app-wide quieter standard)               |

### EnhancedPlaybackControls Visual Improvements

- Play button: `var(--color-primary)` bg, `var(--color-primary-hover)` on hover — no hardcoded blue
- Skip buttons: `var(--color-text-secondary)` → `var(--color-primary)` on hover
- Speed buttons: active state uses `var(--color-primary)` text + `var(--color-primary-alpha-10)` bg
- Volume bar fill: `var(--color-primary)` (currently uses `var(--color-text-secondary)`)
- Volume slider: add custom range styling matching MiniAudioPlayer's `.mini-audio-range` pattern

### Keyboard Shortcuts

Keep existing shortcuts (Space, Arrow keys). Add:

- `I` — set region start to current playhead position
- `O` — set region end to current playhead position
- `Escape` — clear region
- Update keyboard hint bar at bottom to show I/O shortcuts

### Keyboard Hint Bar

Replace inline `<span>` hack with proper token-styled kbd elements. Remove hardcoded `backgroundColor` inline styles, use CSS class:

```css
.kbd-hint {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
```

### Action Buttons

Replace ad-hoc `<button>` elements with the app's `<Button>` component from `@/lib`:

- Primary: `<Button variant="primary">Process Selection / Process Full Audio</Button>`
- Secondary: `<Button variant="ghost">Process Full Audio</Button>`
- Remove hardcoded `bg-blue-500`, `border-2`, `transform active:scale-[0.99]`

---

## Part 3: UX Enhancements (from ui-ux-pro-max)

### Progressive Disclosure

- Time inputs row is **always visible** (not collapsed) — this page is specifically for trimming, users expect these controls
- `RegionTimeDisplay` in toolbar: **remove** (redundant with new time inputs row)
- Region instructions: show subtle hint text below waveform only when no region is set: _"Drag on the waveform to select a segment, or type start and end times below"_

### Accessibility

- All icon-only buttons (skip back, skip forward, play/pause) have `aria-label` via i18n — already present, verify
- Focus ring: `focus-visible:ring-2 focus-visible:ring-primary` on all interactive elements
- Color is not the only indicator for the selected region — region also shows handles with `cursor-col-resize`
- Volume input: currently `opacity-0` overlay — must add `aria-label` to the hidden range input (already present, keep it)

### i18n Keys to Add (all 4 locales)

```json
"audioEditing": {
  "pageTitle": "Trim Audio",
  "instructions": "Drag to select a segment, or set start and end times. Process the selection or the full audio.",
  "trimButtonLabel": "Trim audio",
  "startLabel": "Start",
  "endLabel": "End",
  "durationLabel": "Duration",
  "clearRegion": "Clear selection",
  "processSelection": "Process Selection",
  "processSelectionHint": "Transcribe {{duration}} segment",
  "processFullAudio": "Process Full Audio",
  "processFullAudioHint": "Transcribe all {{duration}}",
  "keyboardHint": {
    "space": "Space",
    "playPause": "play / pause",
    "arrows": "seek ±5s",
    "shift": "Shift + ← →",
    "shiftSeek": "seek ±10s",
    "iKey": "I",
    "oKey": "O",
    "setInOut": "set in / out point"
  }
}
```

---

## Files to Touch

| File                                                                 | Change                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/app/routes/UploadRecordPage.tsx`                                | Add "Trim audio" secondary CTA                                           |
| `src/app/routes/AudioEditingPage.tsx`                                | New time inputs, keyboard shortcuts, token cleanup, use Button component |
| `src/features/audio-editing/components/EnhancedPlaybackControls.tsx` | Design token cleanup                                                     |
| `src/features/audio-editing/components/RegionTimeDisplay.tsx`        | Keep but simplify (or remove if replaced by TrimTimeInputs)              |
| `src/features/audio-editing/components/AudioStatusBadges.tsx`        | Token cleanup                                                            |
| `src/features/audio-editing/components/TimelineRuler.tsx`            | Token cleanup                                                            |
| `src/features/audio-editing/components/TrimTimeInputs.tsx`           | **NEW** — bidirectional time inputs                                      |
| `src/lib/components/audio/WaveformPlayer/WaveformPlayer.tsx`         | Fix Regions plugin initialization                                        |
| `src/locales/*/translation.json`                                     | Add `audioEditing.*` keys (4 files)                                      |

---

## Quality Gates

```bash
npm test AudioEditingPage 2>&1 | tail -10
npm test TrimTimeInputs 2>&1 | tail -10
npm run test:all && npx tsc --noEmit && npm run lint && npm run build
```
