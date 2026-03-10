# Usage Panel Design

**Date:** 2026-03-08
**Branch:** feature/ux-ui-refactoring
**Mockup:** `docs/mockups/usage-panel-mockup.html`

## Problem

The existing `UsageTab` in the Account Settings page is minimal and undifferentiated:

- Free users see a generic upgrade nudge with no usage context
- Pro users see basic stats without clear status signalling
- No actionable link to the user's OpenAI billing dashboard

## Goal

Replace `UsageTab` with a new `UsagePanel` component that:

- Shows free users their transcription activity + what Pro unlocks
- Shows pro users a clear minutes/quota view with progressive status states
- Only surfaces status badges when they carry meaning

---

## Architecture

### New component tree

```
src/features/account/components/UsagePanel/
├── UsagePanel.tsx          # Reads tier → renders Free or Pro variant
├── FreePlanPanel.tsx       # Free user view
├── ProPlanPanel.tsx        # Pro/Team user view
├── index.ts                # Barrel export
└── UsagePanel.test.tsx     # Tests for both variants + all states
```

### Integration

`AccountBillingPage.tsx` currently imports `UsageTab` from `src/features/user-menu/components/`.
Swap that import for `<UsagePanel />` from the new location.

### Data sources (no new API endpoints)

| Data                                                                            | Source                                  |
| ------------------------------------------------------------------------------- | --------------------------------------- |
| Tier, status, minutesUsed, minutesIncluded, currentPeriodEnd, cancelAtPeriodEnd | `useSubscription()`                     |
| Transcription count this month                                                  | `GET /api/usage/current` → `eventCount` |

---

## Free Plan Panel

### Layout

```
[ Free ]                              [ Upgrade to Pro → ]
────────────────────────────────────────────────────────
THIS MONTH
┌─────────────────────────────────────┐
│  🎙  4                              │
│      transcriptions this month      │
└─────────────────────────────────────┘
🔑  Using your own OpenAI key (BYOK)
    Check your OpenAI balance ↗
────────────────────────────────────────────────────────
WHAT YOU'RE MISSING
  🔒  No API key needed      Pro   Platform handles transcription
  🔒  AI Chat on results     Pro   Ask questions, translate
  🔒  Speaker diarization    Pro   Who said what
  🔒  Cloud sync             Pro   Access from any device
────────────────────────────────────────────────────────
[ ⚡ Upgrade to Pro ]  (full width)
```

### Notes

- "Check your OpenAI balance ↗" links to `https://platform.openai.com/usage` (`target="_blank"`)
- If user has no API key configured: replace BYOK line with a warning + link to `/account?section=apiKeys`
- Feature list is derived from `subscription-tiers.ts` — not hardcoded strings
- Upgrade buttons navigate to `/pricing`
- All strings are i18n keys

---

## Pro Plan Panel

### States

#### Normal (< 80%)

```
[ Pro ]                               [ Manage plan → ]
────────────────────────────────────────────────────────
MINUTES THIS MONTH
320 / 500 min                                      64%
████████████████░░░░░░░░░░░░░░░░░░░░░░░░  (blue bar)
Renews January 1, 2026
────────────────────────────────────────────────────────
┌─────────────────────────────────────┐
│  🎙  12                             │
│      transcriptions this month      │
└─────────────────────────────────────┘
```

#### Warning (≥ 80%)

Same layout + amber alert banner above progress section:

```
⚠  Running low on minutes
   410 of 500 minutes used — 90 remaining this period.
```

Progress bar fill switches to amber.

#### Quota reached (100%)

```
✕  Quota reached
   Upgrade your plan or wait for renewal on January 1, 2026.
```

Progress bar fill switches to red.
Upgrade CTA button appears at bottom (same as free panel).

#### Cancels at period end (`cancelAtPeriodEnd: true`)

Header badge changes:

```
[ Pro ]  [ Cancels Jan 1 ]            [ Manage plan → ]
```

Renewal line reads "Access ends January 1, 2026" instead of "Renews …".
No alert banner — the badge is the signal.

### Status badge rules

| `status` / condition                 | Badge shown               |
| ------------------------------------ | ------------------------- |
| `active`, `cancelAtPeriodEnd: false` | None                      |
| `active`, `cancelAtPeriodEnd: true`  | Amber "Cancels [date]"    |
| `trialing`                           | Amber "Trial ends [date]" |
| `past_due`                           | Red "Payment failed"      |
| `unpaid`                             | Red "Unpaid"              |
| `canceled`                           | Red "Canceled"            |

---

## Design Tokens

All styling uses existing CSS variables — no new tokens needed:

| Token                             | Usage                                   |
| --------------------------------- | --------------------------------------- |
| `--color-primary`                 | Progress fill, pro badge, count icon bg |
| `--color-accent-warning`          | Warning bar fill, cancels badge         |
| `--color-accent-error`            | Error bar fill, past-due badge          |
| `--color-bg-surface`              | Card background                         |
| `--color-border`                  | Dividers, feature item separators       |
| `--color-text-secondary/tertiary` | Secondary labels, descriptions          |

---

## Accessibility

- Progress bar uses `role="progressbar"` with `aria-valuenow/min/max` and `aria-label`
- External link has `target="_blank" rel="noopener noreferrer"` + screen-reader visible text
- Alert banners use `role="alert"`
- All interactive elements have `cursor-pointer` and visible focus states
- `prefers-reduced-motion` respected (no animated fills on first render)

---

## Testing (UsagePanel.test.tsx)

| Test                                   | Scenario                          |
| -------------------------------------- | --------------------------------- |
| Renders FreePlanPanel for tier=free    | Basic render                      |
| Shows transcription count              | Free: eventCount from API         |
| Shows BYOK line when key configured    | Free: apiConfig present           |
| Shows "set up key" warning when no key | Free: no apiConfig                |
| Renders ProPlanPanel for tier=pro/team | Basic render                      |
| Shows correct progress %               | Pro: minutesUsed/minutesIncluded  |
| No status badge at normal state        | Pro: active, no cancelAtPeriodEnd |
| Amber badge when cancelAtPeriodEnd     | Pro: cancelAtPeriodEnd=true       |
| Warning banner at ≥ 80%                | Pro: 410/500                      |
| Red banner + upgrade CTA at 100%       | Pro: 500/500                      |
| "Payment failed" badge for past_due    | Pro: status=past_due              |
| Loading state                          | Both: shows skeleton/spinner      |
| Error state                            | Both: shows error message         |
| All strings use i18n                   | Render with each locale           |

---

## i18n Keys (new, to add to all 4 locales)

```
usagePanel.free.planBadge
usagePanel.free.upgradeBtn
usagePanel.free.sectionThisMonth
usagePanel.free.transcriptionCount (with count param)
usagePanel.free.byokStatus
usagePanel.free.checkBalance
usagePanel.free.sectionMissing
usagePanel.free.sectionMissingCaption
usagePanel.free.feature.hostedApi.name
usagePanel.free.feature.hostedApi.desc
usagePanel.free.feature.chat.name
usagePanel.free.feature.chat.desc
usagePanel.free.feature.diarization.name
usagePanel.free.feature.diarization.desc
usagePanel.free.feature.cloudSync.name
usagePanel.free.feature.cloudSync.desc
usagePanel.free.noKeyWarning
usagePanel.free.noKeyCta

usagePanel.pro.planBadge
usagePanel.pro.managePlan
usagePanel.pro.sectionMinutes
usagePanel.pro.minutesUsed (minutesUsed, minutesIncluded params)
usagePanel.pro.minutesPct
usagePanel.pro.renews (date param)
usagePanel.pro.accessEnds (date param)
usagePanel.pro.transcriptionCount (with count param)
usagePanel.pro.warning.title
usagePanel.pro.warning.body (minutesUsed, minutesIncluded, remaining params)
usagePanel.pro.quota.title
usagePanel.pro.quota.body (date param)
usagePanel.pro.quota.upgradeBtn
usagePanel.pro.badge.cancels (date param)
usagePanel.pro.badge.trial (date param)
usagePanel.pro.badge.pastDue
usagePanel.pro.badge.unpaid
usagePanel.pro.badge.canceled
usagePanel.pro.progressAriaLabel (pct param)
```
