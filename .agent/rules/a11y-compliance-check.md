---
description: Enforce accessibility (a11y) standards for all interactive components.
---

# Accessibility (a11y) Compliance Rule

## Trigger

Use this rule when:

1.  Creating new interactive components (buttons, links, inputs, audio players).
2.  Modifying existing interactive elements.
3.  Reviewing UI code for quality assurance.

## Standards

### 1. Semantic HTML

- **Requirement:** Use native HTML elements (`<button>`, `<input>`, `<label>`, `<nav>`, `<main>`) whenever possible instead of `<div>` with handlers.
- **Why:** Native elements provide built-in keyboard accessibility and screen reader support.

### 2. Interactive Elements

- **Focus Management:** Ensure all interactive elements can be reached and activated via keyboard (Tab, Enter, Space).
- **Outlines:** Never remove focus outlines (`outline: none`) without providing a visible alternative focus state.

### 3. ARIA Attributes

- **Labels:** Use `aria-label` or `aria-labelledby` for elements without visible text (e.g., icon-only buttons).
  - Example: `<button aria-label="Play audio"><PlayIcon /></button>`
- **State:** Use ARIA state attributes for dynamic components.
  - `aria-pressed` for toggle buttons.
  - `aria-expanded` for accordions/menus.
  - `aria-hidden="true"` for decorative icons.

### 4. Audio Player Specifics

- **Slider/Scrubber:** Use `<input type="range">` or a `div` with `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` for audio progress bars.
- **Keyboard Shortcuts:** Ensure playback controls (Play/Pause, Skip) are mapped to standard keys (Space, Arrow keys).

## Checklist

- [ ] Are semantic elements used?
- [ ] Do icon buttons have `aria-label`?
- [ ] Is the focus state visible?
- [ ] Can the component be operated with only a keyboard?
- [ ] Do images have `alt` text (or `role="presentation"` if decorative)?
