# Welcome Page Simplification Design

**Date:** 2026-03-05
**Branch:** feature/ux-ui-refactoring
**Status:** Approved

---

## Problem

The current `WelcomePage` has six sections, five conversion moments, four fake team members, and a broken app preview placeholder. It reads as an AI-generated template rather than a designed product page. Key anti-patterns identified in design critique:

- Animated decorative orbs behind hero
- "✨ Introducing Liquid Glass Design" badge (internal jargon, not user value)
- `[App Preview Visualization]` placeholder — signals unfinished
- Four fake team members (Alex Chen, Sarah Johnson, Michael Brown, Emily Davis) with dead social links — active trust liability
- CTA fatigue: "Start Free Trial" / "Get Started Free" / "Start Free Trial (60 min)" / pricing CTAs across five sections
- Pricing section exists but pricing is not finalized
- Duplicate "No credit card required" text appears twice
- `🔑` hardcoded emoji inconsistent with i18n approach

---

## Design Decisions

- **Solo project** — team section removed, no "Made by" block (footer social links sufficient)
- **Static UI mockup** — replaces the empty app preview placeholder
- **Lean structure** — Hero → Features → BYOK → Footer (drop pricing, team, duplicate CTA card)
- **No badge** — headline leads without preamble
- **No founder attribution section** — footer already carries GitHub, LinkedIn, email

---

## Page Structure

```
Hero (two-column)
  └─ Left: Headline + description + single CTA + proof line
  └─ Right: Static transcript/summary mockup card

Features (3-card grid, tightened)

BYOK — Free tier (full-width two-column card)
  └─ Left: Value prop + CTA
  └─ Right: Masked API key input mockup

AppFooter (unchanged)
```

---

## Section Specs

### 1. Hero

**Layout:** Two-column, 55% left / 45% right, vertically centered. Stacks on mobile (text above, mockup below).

**Left column:**

- No badge — headline leads directly
- H1 line 1: `"Transcribe & Summarize"` — `text-text-primary`
- H1 line 2: `"In Seconds."` — `text-primary`
- Description: `"Turn meetings, lectures, and interviews into transcripts and summaries — using your own AI key."`
- Single primary CTA: `"Get Started Free"` — one button only
- Proof line below button: `· 60 minutes free  · No subscription  · Your API key`

**Right column:**

- `GlassCard` styled to resemble the app's actual output panel
- Fake transcript excerpt: 3–4 short lines with speaker label (`"Speaker 1"`) and timestamps
- Below transcript: small summary chip `"Key points · 3 items"` with 2 mock bullet lines
- Style: `bg-bg-surface border-border` — no glow, no `variant="glow"`

**Removed:**

- `animate-[pulse_*]` decorative orbs (3 fixed divs)
- `GlassCard` badge with `"✨ Introducing Liquid Glass Design"`
- Secondary CTA button `"View Pricing"`
- `aspect-video` `[App Preview Visualization]` placeholder
- Standalone `"No credit card required"` text node
- `handleViewPricing` handler (no pricing section)

---

### 2. Features

**Section header:**

- Title: `"Everything you need"` (replaces `"Power Tools for Audio"`)
- Subtitle: `"Accurate transcription, AI summaries, complete privacy."` — one line

**Cards (3-column grid, unchanged topics):**

| Card          | Icon                 | Title (unchanged)           | Description (new — one sentence)                                           |
| ------------- | -------------------- | --------------------------- | -------------------------------------------------------------------------- |
| Transcription | `Mic` blue-400       | Crystal Clear Transcription | "Upload a file or record live. Whisper-accurate transcription every time." |
| Summaries     | `Zap` amber-400      | Instant AI Summaries        | "Key points, action items, structured summaries — generated instantly."    |
| Privacy       | `Shield` emerald-400 | Private & Secure            | "Client-side processing. Your audio never leaves without your permission." |

**Style changes:**

- Card padding: `p-8` → `p-6`
- Remove `hover:-translate-y-1` lift animation

---

### 3. BYOK — Free Tier

**Layout:** Full-width `GlassCard variant="dark"`, two-column interior.

**Left column:**

- Label: `"Free tier"` — `text-primary text-sm font-medium` (no icon, no emoji)
- Heading (h3): `"Use your own OpenAI key. Pay nothing to us."`
- Body: `"Connect your OpenAI API key and start transcribing immediately. You pay OpenAI directly for what you use — no Trammarise subscription required."`
- CTA: `"Get Started Free"` — `variant="primary"`

**Right column:**

- `GlassCard` inner card: masked API key input mockup
  - Input field visual: `sk-••••••••••••••••`
  - Below input: `"Connected ✓"` badge in `accent-success` color
- No interactive behavior — purely visual

**Removed:**

- `Key` icon in `bg-primary/10 rounded-full` wrapper
- `🔑` hardcoded emoji in heading
- `"Or Upgrade to Pro"` secondary button

---

### 4. Removed Sections

| Section                                             | Reason                                                  |
| --------------------------------------------------- | ------------------------------------------------------- |
| Pricing section (`#pricing`, 3 tiers)               | Pricing not finalized; creates false commitment         |
| `TeamSection`                                       | 4 fake members with dead social links — trust liability |
| CTA section (`"Ready to boost your productivity?"`) | Duplicate of hero CTA, adds no new information          |
| `ApiKeySetupPage`-style BYOK card at bottom         | Replaced by proper BYOK section above                   |

---

## i18n

New/changed keys (English, propagate to it/de/es):

```json
"welcome": {
  "hero": {
    "title1": "Transcribe & Summarize",
    "title2": "In Seconds.",
    "description": "Turn meetings, lectures, and interviews into transcripts and summaries — using your own AI key.",
    "cta": "Get Started Free",
    "proof": "· 60 minutes free  · No subscription  · Your API key",
    "mockup": {
      "speaker": "Speaker 1",
      "summaryLabel": "Key points · 3 items"
    }
  },
  "features": {
    "title": "Everything you need",
    "subtitle": "Accurate transcription, AI summaries, complete privacy.",
    "cards": {
      "transcription": { "description": "Upload a file or record live. Whisper-accurate transcription every time." },
      "summaries": { "description": "Key points, action items, structured summaries — generated instantly." },
      "security": { "description": "Client-side processing. Your audio never leaves without your permission." }
    }
  },
  "byok": {
    "label": "Free tier",
    "title": "Use your own OpenAI key. Pay nothing to us.",
    "description": "Connect your OpenAI API key and start transcribing immediately. You pay OpenAI directly for what you use — no Trammarise subscription required.",
    "cta": "Get Started Free",
    "mockup": {
      "connected": "Connected ✓"
    }
  }
}
```

Keys to remove: `welcome.hero.newBadge`, `welcome.hero.cta.secondary`, `welcome.hero.noCreditCard`, `welcome.hero.cta.appPreview`, `welcome.pricing.*`, `welcome.team.*`, `welcome.cta.*`, `welcome.byok.cta.upgrade`

---

## Files

| Action      | File                                      |
| ----------- | ----------------------------------------- |
| **Rewrite** | `src/pages/WelcomePage.tsx`               |
| **Delete**  | `src/components/sections/TeamSection.tsx` |
| **Update**  | `src/locales/*/translation.json` × 4      |
| **Update**  | `src/pages/WelcomePage.test.tsx`          |

---

## Verification

```bash
npm test WelcomePage
npm test && npm run lint && npm run build
```

Visual checks:

- Hero two-column renders correctly at 1280px, 768px, 375px
- Mockup card looks like real app output
- BYOK section is the clear second CTA moment on the page
- No fake team members, no pricing tiers, no duplicate CTAs
