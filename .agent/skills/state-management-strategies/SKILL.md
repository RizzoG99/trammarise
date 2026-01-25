---
name: state-management-strategies
description: Guidelines for complex frontend state, tailored for audio apps.
---

# State Management Strategies

## Overview

Choosing the right state management approach is critical for "Trammarise" due to the high frequency of updates (audio time) and global nature of playback state.

## Decision Matrix

### 1. Local State (`useState`, `useReducer`)

- **Use for:** Form inputs, toggle states (modals, dropdowns), UI-specific ephemeral state.
- **Avoid for:** Audio playback status, User session data, Shared data across pages.

### 2. React Context

- **Use for:** Theme, Localization, simple Global settings.
- **Caution:** Context limits performance if high-frequency updates (like audio progress) are pumped through it. Every consumer re-renders.
- **Optimization:** Split contexts (StateContext vs APIContext) or use `useMemo` on the value.

### 3. Global Store (Zustand / Redux)

- **Recommended:** **Zustand** is preferred for this project (lightweight, flexible).
- **Use for:**
  - **Audio Player State:** `isPlaying`, `currentTrack`, `volume`.
  - **Application Data:** `fileList`, `generationStatus`.
- **Why:** Allows components to subscribe only to the slices they need, avoiding unnecessary re-renders (Transient updates).

### 4. URL State

- **Use for:** Shareable state.
  - Selected file ID (`/process/:id`).
  - Active tab (`?tab=summary`).
  - Filters/Search queries.
- **Sync:** Ensure URL is the source of truth when loading the page.

## Specific Pattern: High Frequency Audio State

Don't store `currentTime` in a global React store that triggers re-renders every 100ms.

- **Better:**
  - Store `isPlaying` and `isReady` in Global Store.
  - Have the specific `ProgressBar` component subscribe directly to the audio engine (ref) or use a transient store update that doesn't re-render the whole app tree.
