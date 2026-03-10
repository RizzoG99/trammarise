# Design: Speaker ID Upgrade Modal — Live Feature Preview

**Date:** 2026-03-03
**Branch:** `feature/ux-ui-refactoring`
**Status:** Approved — ready for implementation

---

## Problem

The existing `speaker_diarization` upgrade modal is generic and unconvincing:

1. **Shows nothing** — a `<Users>` icon + 3 dry bullet points. No visual proof of the feature's output.
2. **Same layout as every trigger** — no personality or visual differentiation for speaker ID.
3. **Billing toggle friction** — shows monthly/annual toggle before the user has decided to upgrade.
4. **Modal base mismatches the app** — hardcoded `bg-white dark:bg-[#1e1e1e]` hex colors, not glassmorphic.
5. **Generic CTA** — "View Plans & Upgrade" doesn't speak to the specific feature.

---

## Solution: Live Feature Preview (Option A)

`UpgradeModal` detects `trigger === 'speaker_diarization'` and renders a dedicated `SpeakerUpgradeContent` layout. All other triggers remain untouched.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [×]  (custom inline close, hideHeader={true})              │
├───────────────────────────┬─────────────────────────────────┤
│  Identify every voice PRO │  [Pro] Most Popular             │
│  See who said what, when  │  $19 / month                    │
│  ┌─────────────────────┐  │                                 │
│  │ 🔵 Speaker 1  00:12 │  │  ✓ Color-coded speaker labels   │
│  │ "Thanks for joining…│  │  ✓ Up to 10 speakers            │
│  │ ──────────────────  │  │  ✓ Timestamped per utterance   │
│  │ 🟢 Speaker 2  00:28 │  │                                 │
│  │ "Should we start…"  │  │  [Unlock Speaker ID →]          │
│  │ ──────────────────  │  │                                 │
│  │ 🔵 Speaker 1  00:45 │  │  or pay annually & save 2 months│
│  │ "Let's walk through │  │                                 │
│  │ ──────────────────  │  │  [Maybe Later]                  │
│  │ 🟣 Speaker 3  01:02 │  │                                 │
│  │ "Engineering pushed…│  │                                 │
│  └─────────────────────┘  │                                 │
│  (bottom fade mask)       │                                 │
└───────────────────────────┴─────────────────────────────────┘
```

- Modal width: `max-w-3xl` (down from `max-w-4xl`)
- No billing toggle
- `hideHeader={true}` on `<Modal>` — custom close button (×) inline top-right
- Entrance animation: whole modal slides up as usual

---

## Section 1: UpgradeModal Changes

**File:** `src/components/marketing/UpgradeModal.tsx`

- Add `if (trigger === 'speaker_diarization') return <SpeakerDiarizationUpgradeModal ... />`
  before the generic render path — clean separation, zero risk to other triggers.
- `SpeakerDiarizationUpgradeModal` is a local component within the same file (not a new file).
- Props passed: `isOpen`, `onClose`, `navigate`

---

## Section 2: SpeakerTranscriptPreview Component

**File:** `src/components/marketing/SpeakerTranscriptPreview.tsx`

Self-contained presentational component. No props. Static mock data baked in.

### Mock data (4 utterances, 3 speakers)

```ts
const MOCK_UTTERANCES = [
  {
    speaker: 'Speaker 1',
    time: '00:12',
    text: "Thanks everyone for joining today's product review.",
  },
  {
    speaker: 'Speaker 2',
    time: '00:28',
    text: 'Happy to be here. Should we start with the roadmap?',
  },
  {
    speaker: 'Speaker 1',
    time: '00:45',
    text: "Absolutely. Let's walk through Q2 milestones first.",
  },
  { speaker: 'Speaker 3', time: '01:02', text: 'Engineering pushed the API deadline by a week.' },
];
```

### Speaker color mapping

Reuses the `SPEAKER_COLORS` system from `src/constants/ui-constants.ts`:

- Speaker 1 → `from-blue-500/20 to-blue-600/10` (index 0)
- Speaker 2 → `from-green-500/20 to-green-600/10` (index 1)
- Speaker 3 → `from-purple-500/20 to-purple-600/10` (index 2)

Each row renders:

- `bg-gradient-to-r from-[color]/15 to-transparent` background
- Left accent: `border-l-2 border-[solid-color]`
- Speaker chip: colored pill `rounded-full text-xs px-2 py-0.5`
- Monospace timestamp: `font-mono text-xs text-text-tertiary`
- Text: `text-sm text-text-primary`

### Entrance animation

Rows stagger in with `animate-fade-up`:

- Row 0: `animation-delay: 0ms`
- Row 1: `animation-delay: 100ms`
- Row 2: `animation-delay: 200ms`
- Row 3: `animation-delay: 300ms`

### Bottom fade mask

`overflow-hidden` container with `after:` pseudo-element:

```
after:absolute after:bottom-0 after:inset-x-0 after:h-12
after:bg-gradient-to-t after:from-bg-surface after:to-transparent
after:pointer-events-none
```

### Header (above preview rows)

```tsx
<span className="text-lg font-semibold text-text-primary">
  {t('upgrade.speakerDiarization.title')}
</span>
<ProBadge label={t('configuration.speakerDiarization.proBadge')} />
<p className="text-sm text-text-secondary mt-1">
  {t('upgrade.speakerDiarization.previewSubtitle')}
</p>
```

`ProBadge` reused from `SpeakerDiarizationToggle` (extract to shared location or duplicate — see implementation plan).

---

## Section 3: Right Column — Focused PricingCard

**No billing toggle** — `billingPeriod` hardcoded to `'monthly'`.

**Custom `proPlan` object** for this modal:

```ts
{
  features: [
    t('upgrade.speakerDiarization.feature1'),  // Color-coded speaker labels
    t('upgrade.speakerDiarization.feature2'),  // Up to 10 speakers
    t('upgrade.speakerDiarization.feature3'),  // Timestamped per utterance
  ],
  cta: t('upgrade.speakerDiarization.cta'),   // "Unlock Speaker ID →"
}
```

**Below the card:**

- Small link: `t('upgrade.speakerDiarization.annualHint')` → navigates to `/pricing`
- "Maybe Later" ghost button → calls `onClose`

---

## Section 4: i18n

**2 new keys, added to all 4 locales (en/it/de/es):**

```json
"upgrade": {
  "speakerDiarization": {
    "cta": "Unlock Speaker ID",
    "annualHint": "or pay annually and save 2 months",
    "previewSubtitle": "See who said what, when"
  }
}
```

Note: `previewSubtitle` is an additional key identified during design. 3 new keys total.

---

## Section 5: Tests

### `SpeakerTranscriptPreview.test.tsx` (new)

- Renders all 4 mock utterance rows
- All 3 speaker chips present ("Speaker 1", "Speaker 2", "Speaker 3")
- Timestamps render in `MM:SS` format
- Preview heading visible

### `UpgradeModal` tests (additions to existing file)

For `trigger="speaker_diarization"`:

- Renders transcript preview (not generic icon layout)
- Does NOT render billing toggle
- Renders "Unlock Speaker ID" CTA
- CTA click navigates to `/pricing`
- "Maybe Later" click calls `onClose`
- Annual hint link is present

---

## Files Summary

| Action     | File                                                         |
| ---------- | ------------------------------------------------------------ |
| **Update** | `src/components/marketing/UpgradeModal.tsx`                  |
| **New**    | `src/components/marketing/SpeakerTranscriptPreview.tsx`      |
| **New**    | `src/components/marketing/SpeakerTranscriptPreview.test.tsx` |
| **Update** | `src/locales/en/translation.json`                            |
| **Update** | `src/locales/it/translation.json`                            |
| **Update** | `src/locales/de/translation.json`                            |
| **Update** | `src/locales/es/translation.json`                            |

---

## Verification

```bash
npm test -- SpeakerTranscriptPreview UpgradeModal
npm test && npm run lint && npm run build
```

Manual:

- Open `/` as free user → click Speaker Diarization toggle → modal opens
- Left column shows animated transcript preview with 3 colored speakers
- Right column shows 3-feature pricing card with "Unlock Speaker ID →" CTA
- No billing toggle visible
- Annual hint link present below card
- CTA navigates to `/pricing`
- "Maybe Later" closes modal
