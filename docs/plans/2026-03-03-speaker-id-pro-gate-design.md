# Design: Speaker Identification Pro Gate

**Date:** 2026-03-03
**Branch:** feature/ux-ui-refactoring
**Status:** Approved

---

## Problem

Speaker identification (diarization) is currently available to all users with no subscription check. The feature is a meaningful Pro differentiator and should be gated accordingly, while being prominently showcased to free users as an upsell signal.

## Goal

- Free users see the toggle, but it is locked with a `Pro` badge and triggers an upgrade modal on click
- Pro/Team users see the normal, fully functional toggle
- The `UpgradeModal` presents speaker identification with compelling, feature-specific copy

## Approach: Locked toggle with Pro badge (Approach A)

Industry-standard pattern (Linear, Notion, Figma). Keeps the config panel layout stable across tiers. The `UpgradeModal` (already supports contextual triggers) provides enough surface to pitch the feature compellingly.

---

## Implementation

### 1. Feature flag — `subscription-tiers.ts`

Add `'speaker-diarization'` to `pro` and `team` feature arrays. Free tier unchanged.

```ts
pro: [
  // ... existing features
  'speaker-diarization',
],
team: [
  // ... existing features
  'speaker-diarization',
],
```

### 2. `SpeakerDiarizationToggle` — new props

```tsx
interface SpeakerDiarizationToggleProps {
  enabled: boolean;
  speakersExpected?: number;
  onEnabledChange: (enabled: boolean) => void;
  onSpeakersExpectedChange: (count: number | undefined) => void;
  // NEW
  isProUser?: boolean; // defaults to true for backwards compat
  onUpgradeClick?: () => void;
}
```

**Free user rendering:**

- `ToggleSwitch` rendered with `disabled={true}`
- `Pro` badge (amber/warning tone using `--color-accent-warning`) appears inline next to the label
- Entire row is wrapped in a clickable div (`cursor-pointer`) that calls `onUpgradeClick()`
- Speaker-count input never appears (already gated behind toggle state)

**Pro user rendering:** No change from current behavior.

### 3. `UploadRecordPage` — wiring

```tsx
const { hasAccess: isSpeakerIdPro, upgrade } = useFeatureGate('speaker-diarization');
const [showSpeakerUpgradeModal, setShowSpeakerUpgradeModal] = useState(false);

// In JSX:
<SpeakerDiarizationToggle
  enabled={enableSpeakerDiarization}
  speakersExpected={speakersExpected}
  onEnabledChange={setEnableSpeakerDiarization}
  onSpeakersExpectedChange={setSpeakersExpected}
  isProUser={isSpeakerIdPro}
  onUpgradeClick={() => setShowSpeakerUpgradeModal(true)}
/>

<UpgradeModal
  isOpen={showSpeakerUpgradeModal}
  onClose={() => setShowSpeakerUpgradeModal(false)}
  trigger="speaker_diarization"
/>
```

### 4. `UpgradeModal` — new trigger

Add `'speaker_diarization'` to `UpgradeTrigger` union. Add case in `getContent()`:

```tsx
case 'speaker_diarization':
  return {
    title: t('upgrade.speakerDiarization.title'),
    description: t('upgrade.speakerDiarization.desc'),
    icon: <Users className="w-12 h-12 mb-4 text-[var(--color-primary)]" />,
    features: [
      t('upgrade.speakerDiarization.feature1'),
      t('upgrade.speakerDiarization.feature2'),
      t('upgrade.speakerDiarization.feature3'),
    ],
  };
```

### 5. i18n keys (all 4 locales: en / it / de / es)

```json
"configuration": {
  "speakerDiarization": {
    "proBadge": "Pro",
    "proUpgradeHint": "Upgrade to Pro to identify speakers"
  }
},
"upgrade": {
  "speakerDiarization": {
    "title": "Identify every voice",
    "desc": "Speaker Identification labels who said what — color-coded, timestamped, up to 10 speakers.",
    "feature1": "Color-coded speaker labels",
    "feature2": "Up to 10 speakers",
    "feature3": "Timestamped per utterance"
  }
}
```

### 6. Tests

**`SpeakerDiarizationToggle.test.tsx`** (new/updated):

- Renders `Pro` badge when `isProUser=false`
- Clicking the row calls `onUpgradeClick` when `isProUser=false`
- Toggle is disabled for free users
- Normal toggle behavior unchanged for pro users (`isProUser=true`)

**`UpgradeModal.test.tsx`** (updated):

- Renders `speaker_diarization` trigger content correctly

---

## Files Changed

| Action | File                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| Update | `src/context/subscription-tiers.ts`                                             |
| Update | `src/features/configuration/components/SpeakerDiarizationToggle.tsx`            |
| Update | `src/app/routes/UploadRecordPage.tsx`                                           |
| Update | `src/components/marketing/UpgradeModal.tsx`                                     |
| Update | `src/locales/*/translation.json` × 4                                            |
| Update | `src/features/configuration/components/SpeakerDiarizationToggle.test.tsx` (new) |
| Update | `src/components/marketing/UpgradeModal.test.tsx`                                |

---

## Verification

```bash
npm test -- SpeakerDiarization UpgradeModal
npm test && npm run lint && npm run build
```

- Free user: toggle shows locked with `Pro` badge; clicking opens speaker_diarization upgrade modal
- Pro user: toggle works normally, no badge shown
- `?section=apiKeys` deep-link unaffected
