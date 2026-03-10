# Design: AppFooter Component

**Date:** 2026-03-03
**Branch:** feature/ux-ui-refactoring

## Problem

The app has two separate inline footers with inconsistent styling:

1. **AppLayout** — a single copyright line using hardcoded text, no links.
2. **WelcomePage** — an inline `<footer>` with copyright + 4 links, using `slate-*` Tailwind colors that bypass the design system.

No shared `<Footer>` component exists.

## Solution

A unified `AppFooter` component — one component, used in both `AppLayout` and `WelcomePage`. Consistent design tokens, no duplication.

## Layout

Single-row strip that collapses to two rows on mobile.

```
Desktop:
┌──────────────────────────────────────────────────────────────────┐
│  ■ Trammarise    © 2025 · All rights reserved    Privacy  Terms  GH LI TW ✉ │
└──────────────────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────────┐
│  ■ Trammarise            │
│  © 2025  Privacy  Terms  │
│  GH  LI  TW  ✉           │
└──────────────────────────┘
```

## Component API

```tsx
interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className }: AppFooterProps) { ... }
```

No content props — fully self-contained. All text comes from i18n.

## Visual Design

- **Background:** `bg-bg-glass backdrop-blur-md` — matches `AppHeader`
- **Border:** `border-t border-border`
- **Height:** `py-4` (~64px)
- **Copyright:** `text-text-tertiary text-sm`
- **Legal links:** `text-text-tertiary hover:text-text-primary text-sm transition-colors`
- **Social icons:** lucide-react `Github`, `Linkedin`, `Twitter`, `Mail` — `w-4 h-4`, same tertiary→primary hover

## Content

Left section:

- Logo icon (`AudioWaveform`) + "Trammarise" text — links to `/`

Center section:

- `© {{year}} Trammarise. All rights reserved.`

Right section:

- Legal: Privacy Policy (`href="#"` placeholder), Terms of Service (`href="#"` placeholder)
- Social icons: GitHub, LinkedIn, Twitter/X, Contact email (`mailto:`)

## i18n Keys

Extend the existing `footer.*` namespace in all 4 locales (en, it, de, es):

```json
"footer": {
  "copyright": "© {{year}} Trammarise. All rights reserved.",
  "links": {
    "privacy": "Privacy",
    "terms": "Terms of Service"
  },
  "social": {
    "github": "GitHub",
    "linkedin": "LinkedIn",
    "twitter": "Twitter",
    "contact": "Contact us"
  }
}
```

The existing `footer.copyright` key is repurposed (was `"Trammarise © 2025 - Audio Transcription & Summarization"`).
The `welcome.footer.*` keys in WelcomePage are no longer needed once replaced.

## Files Changed

| Action     | File                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| **New**    | `src/components/layout/AppFooter.tsx`                                        |
| **New**    | `src/components/layout/AppFooter.test.tsx`                                   |
| **Update** | `src/app/AppLayout.tsx` — replace inline footer with `<AppFooter />`         |
| **Update** | `src/pages/WelcomePage.tsx` — replace inline `<footer>` with `<AppFooter />` |
| **Update** | `src/locales/en/translation.json`                                            |
| **Update** | `src/locales/it/translation.json`                                            |
| **Update** | `src/locales/de/translation.json`                                            |
| **Update** | `src/locales/es/translation.json`                                            |

## Tests

`AppFooter.test.tsx` covers:

- Renders logo link pointing to `/`
- Renders current year in copyright text
- Renders Privacy and Terms links
- Renders 4 social icon buttons with correct `aria-label` values

## Verification

```bash
npm test -- AppFooter
npm test && npm run lint && npm run build
```

Navigate to `/` (WelcomePage) and any authenticated page — both should show the same footer.
