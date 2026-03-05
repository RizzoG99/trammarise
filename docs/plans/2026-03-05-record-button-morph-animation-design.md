# Record Button Morph Animation — Design Doc

**Date**: 2026-03-05
**Branch**: feature/ux-ui-refactoring
**Status**: Approved

## Problem

The RecordPanel shows Pause and Stop buttons at all times, disabled when not recording. This adds visual noise in the idle state and gives no feedback that something interesting is about to happen.

## Decision

Remove Pause and Stop from the idle layout entirely. Show only the Record button centered. When recording starts, Record morphs into Stop and Pause slides in from the right.

```
IDLE:        [         ●REC large, blue, pulse rings        ]

RECORDING:   [‖PAUSE]                           [■STOP red]
```

## Animation Choreography

| t      | What happens                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------- |
| 0ms    | User clicks Record                                                                                |
| 0ms    | Pulse rings fade out (opacity 0, 150ms)                                                           |
| 0ms    | Button background transitions: primary → accent-error (250ms ease)                                |
| 0ms    | Icon crossfade starts: Mic scales down + Square scales up (200ms)                                 |
| 50ms   | Pause wrapper begins animating in: translateX(48px)→0, opacity 0→1, scale 0.85→1 (250ms ease-out) |
| ~300ms | Final state: [‖PAUSE] [■STOP]                                                                     |

On stop/complete, reverse: Pause slides right and fades out (200ms), primary button morphs back to Record.

## Component Changes

### `RecordingButtons.tsx` — enhance `RecordButton`

- Add `onStop?: () => void` prop
- When `isRecording=true`: button is **not disabled**, fires `onStop` on click
- Consistent size (`p-5`) in both states — no size jump on transition
- Background color: inline style with `transition: background-color 250ms ease`
  - Idle: `var(--color-primary)`
  - Recording: `var(--color-accent-error)`
- Hover: handled via `onMouseEnter/onMouseLeave` respecting current state color
- Pulse rings: wrapped in div with `transition: opacity 150ms`, hidden when `isRecording`
- Icons stacked `absolute` in same container, crossfade via opacity + scale:
  - `Mic`: `opacity: isRecording ? 0 : 1`, `transform: isRecording ? scale(0.5) : scale(1)`
  - `Square`: `opacity: isRecording ? 1 : 0`, `transform: isRecording ? scale(1) : scale(0.5)`
  - Both: `transition: opacity 200ms ease, transform 200ms ease`

### `RecordPanel.tsx` — update Controls section

Remove `<StopButton>`. Wrap `<PauseButton>` in an animated div.

```tsx
<div className="flex items-center gap-4">
  {/* Pause — slides in from the right on recording start */}
  <div
    style={{
      opacity: isRecording ? 1 : 0,
      transform: isRecording ? 'translateX(0) scale(1)' : 'translateX(48px) scale(0.85)',
      pointerEvents: isRecording ? 'auto' : 'none',
      transition: 'opacity 250ms ease-out, transform 250ms ease-out',
      transitionDelay: isRecording ? '50ms' : '0ms',
    }}
  >
    <PauseButton
      onClick={isPaused ? handleResumeRecording : handlePauseRecording}
      isPaused={isPaused}
    />
  </div>

  {/* Primary action — morphs between Record and Stop */}
  <RecordButton
    onClick={isRecording ? handleStopRecording : handleStartRecording}
    isRecording={isRecording}
    onStop={handleStopRecording}
  />
</div>
```

### `RecordingButtons.test.tsx` — update tests

- Remove tests that assert disabled state on RecordButton when `isRecording=true`
- Add test: when `isRecording=true`, clicking button fires `onStop`
- Add test: when `isRecording=true`, Square icon is visible, Mic is not
- Add test: when `isRecording=false`, Mic icon is visible, Square is not

### `StopButton`

Not removed from the library (other consumers may use it). Simply no longer rendered in `RecordPanel`.

## Files Touched

| File                                                               | Change                 |
| ------------------------------------------------------------------ | ---------------------- |
| `src/lib/components/ui/RecordingButtons/RecordingButtons.tsx`      | Enhance RecordButton   |
| `src/lib/components/ui/RecordingButtons/RecordingButtons.test.tsx` | Update tests           |
| `src/features/upload/components/RecordPanel.tsx`                   | Update Controls layout |

## Non-Goals

- No changes to WaveformVisualization
- No changes to PauseButton or StopButton internals
- No new CSS keyframes — pure inline style transitions
- No Storybook story changes (existing stories still valid, new state covered by props)
