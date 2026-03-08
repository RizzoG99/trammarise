# Unified AudioPlayer Component — Design

**Date:** 2026-03-08
**Branch:** feature/ux-ui-refactoring
**Status:** Approved

## Problem

Three separate audio players exist across the app:

| Component         | Page          | State                  | Controls                                      |
| ----------------- | ------------- | ---------------------- | --------------------------------------------- |
| `MiniAudioPlayer` | Upload        | Self-contained         | Play, seek, time                              |
| `ResultsAudioBar` | Results       | Hook-driven (external) | Play, seek, skip ±10s, speed, time, file name |
| `WaveformPlayer`  | Audio Editing | WaveSurfer.js          | Full waveform + region editing                |

`MiniAudioPlayer` and `ResultsAudioBar` duplicate: rAF slider loop, time formatter, `mini-audio-range` CSS usage. Visual inconsistency is also possible as they diverge independently.

`WaveformPlayer` is intentionally separate — region editing requires WaveSurfer.js and is a different UX context entirely. **Not touched by this refactor.**

---

## Solution: Single `AudioPlayer` Component — Controlled/Uncontrolled Pattern

One component handles both use cases via React's standard controlled/uncontrolled pattern.

### New Component

**Location:** `src/lib/components/audio/AudioPlayer/AudioPlayer.tsx`

```tsx
interface AudioPlayerProps {
  file: File | Blob;
  // Controlled mode: pass an existing hook instance (Results page)
  // Uncontrolled mode: omit — creates its own internal instance (Upload page)
  audioPlayer?: ReturnType<typeof useAudioPlayer>;
  // Feature flags
  showSkipButtons?: boolean; // default: false
  showSpeedControl?: boolean; // default: false
  // Optional label shown above controls
  fileName?: string;
  className?: string;
}
```

### Controlled vs Uncontrolled

```tsx
// Always call hook — pass null in controlled mode to skip audio element setup
const internalPlayer = useAudioPlayer(audioPlayer ? null : { blob: file, name: '' });
const player = audioPlayer ?? internalPlayer;
```

Hooks rules are respected (unconditional call). When controlled, the hook receives `null` and skips all Audio element setup.

### useAudioPlayer Hook Change

Accept `AudioFile | null`. When `null` is passed, the hook no-ops (no Audio element, no blob URL, no event listeners). This avoids creating a wasted Audio element in controlled mode.

### ResultsLayout — Make Player Sticky

Add `sticky top-0` to the audio player wrapper in `ResultsLayout` so the player stays visible while the transcript scrolls.

```tsx
// Before
<div className="z-40">{audioPlayer}</div>

// After
<div className="sticky top-0 z-40">{audioPlayer}</div>
```

---

## Call Sites

**Upload page (uncontrolled):**

```tsx
// FilePreview.tsx, AudioPreviewBar.tsx
<AudioPlayer file={file} />
```

**Results page (controlled):**

```tsx
// ResultsState.tsx
<AudioPlayer
  file={audioFile.blob}
  audioPlayer={audioPlayer}
  showSkipButtons
  showSpeedControl
  fileName={audioFile.name}
/>
```

---

## Files Changed

### New

- `src/lib/components/audio/AudioPlayer/AudioPlayer.tsx`
- `src/lib/components/audio/AudioPlayer/index.ts`
- `src/lib/components/audio/AudioPlayer/AudioPlayer.test.tsx`
- `src/lib/components/audio/AudioPlayer/AudioPlayer.stories.tsx`

### Modified

- `src/features/results/hooks/useAudioPlayer.ts` — accept `AudioFile | null`
- `src/features/results/components/ResultsLayout.tsx` — sticky player wrapper
- `src/features/results/components/ResultsState.tsx` — swap to `AudioPlayer`
- `src/features/upload/components/FilePreview.tsx` — swap to `AudioPlayer`
- `src/features/upload/components/AudioPreviewBar.tsx` — swap to `AudioPlayer` (or delete if it becomes a thin no-op wrapper)
- `src/lib/components/audio/index.ts` — export `AudioPlayer`

### Deleted

- `src/features/upload/components/MiniAudioPlayer.tsx`
- `src/features/upload/components/MiniAudioPlayer.test.tsx`
- `src/features/upload/components/MiniAudioPlayer.stories.tsx`
- `src/features/results/components/ResultsAudioBar.tsx`
- `src/features/results/components/ResultsAudioBar.test.tsx`

---

## Testing

`AudioPlayer.test.tsx` covers:

- **Uncontrolled mode**: renders, play/pause, seek, time display
- **Controlled mode**: uses external player state, calls external callbacks
- **Feature flags**: skip buttons hidden by default, shown when `showSkipButtons`; same for speed
- **fileName prop**: label shown when provided, hidden when omitted
- **Accessibility**: aria-labels, slider aria attributes, disabled state when loading
- **Edge cases**: NaN/Infinity duration, empty file name

---

## What Stays the Same

- `mini-audio-range` CSS class and slider styling — unchanged
- `WaveformPlayer` — unchanged (editing page)
- `useAudioPlayer` hook public API — unchanged (only adds null handling internally)
- `ResultsState` transcript sync logic — unchanged (`audioPlayer.state.currentTime` still drives `activeSegmentId`)
