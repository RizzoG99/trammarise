---
name: audio-processing-patterns
description: Expert patterns for Web Audio API and WaveSurfer.js usage.
---

# Audio Processing Patterns

## Overview

This skill provides best practices and architectural patterns for handling audio in the browser. It specifically targets consistency with `WaveSurfer.js` and the native Web Audio API, focusing on memory management, state synchronization, and visualization performance.

## Core Concepts

### 1. Initialization & Cleanup

- **Pattern:** Always use `useEffect` (or equivalent cleanup) to destroy audio instances.
- **Why:** Audio contexts and DOM bindings are heavy. Failing to destroy them leaks memory rapidly.
- **Example:**
  ```typescript
  useEffect(() => {
    const wavesurfer = WaveSurfer.create({ ... });
    return () => {
      wavesurfer.destroy();
    };
  }, []);
  ```

### 2. State Synchronization

- **Single Source of Truth:** Do not duplicate `isPlaying` or `currentTime` in strict local state if possible. Listen to events from the audio engine.
- **Events:**
  - `audioprocess` / `timeupdate`: Use for progress bars (throttle this!).
  - `finish`: Reset UI state.
  - `error`: Handle decoding errors gracefully.

### 3. Visualizations

- **Optimization:** When using custom visualizations (HTML5 Canvas), decouple the render loop from React's render cycle using `requestAnimationFrame`.
- **React:** Use `useRef` to hold the Canvas element and the Audio Analyzer node.

## Common Operations

### Loading Audio

- Prefer `blob` URL or properly configured CORS URLs.
- Handle `loading` states explicitly in UI.

### Trimming/Regions

- When using Regions plugins, ensure region update events (`region-updated`) update your application state (startTime, endTime) to keep everything in sync.

## Troubleshooting

- **"The AudioContext was not allowed to start":** Ensure audio context creation or `resume()` happens inside a user gesture (click handler).
- **Memory Leaks:** Check if event listeners are being removed.
