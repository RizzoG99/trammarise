---
description: Guidelines for ensuring high performance, specifically for audio visualization and list rendering.
---

# Performance Audit Rule

## Trigger

Use this rule when:

1.  Working on Audio Visualization components (Waveforms, Canvas).
2.  Implementing or modifying large lists or tables.
3.  Noticing lag or unnecessary re-renders in the application.

## Standards

### 1. React Render Optimization

- **Memoization:** wrapper components that receive complex props or object/array props with `React.memo` if they re-render often.
- **Hooks:** Use `useMemo` for expensive calculations (e.g., filtering large datasets, processing audio buffers). Use `useCallback` for event handlers passed to child components.

### 2. Audio Processing & Visualization

- **Canvas vs DOM:** Use `<canvas>` for high-frequency visualizations (spectrum analyzers, waveforms) instead of massive amounts of DOM nodes.
- **RequestAnimationFrame:** Drive animations with `requestAnimationFrame` hooks, not `setInterval`.
- **Off-Main-Thread:** If processing large audio files, consider using Web Workers to avoid blocking the main UI thread.

### 3. List Rendering

- **Virtualization:** Use virtualization libraries (e.g., `react-window` or `react-virtuality`) for lists with >50 items if they are complex.
- **Keys:** Ensure `key` props are stable and unique IDs (not array indexes usually).

### 4. Dependency Management

- **Effect Dependencies:** Verify `useEffect` dependency arrays are exhaustive but not excessive. changing object references can trigger loops.

## Checklist

- [ ] Are expensive computations wrapped in `useMemo`?
- [ ] Are handlers passed to pure components wrapped in `useCallback`?
- [ ] Is an Animation Frame loop used for viz instead of React State updates?
- [ ] Are lists virtualized if they are expected to grow large?
