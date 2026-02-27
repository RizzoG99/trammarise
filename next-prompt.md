---
page: results-standard-v2
---

A refreshed results page for standard (free) users — the clean, accessible baseline view without speaker diarization.

This is the counterpart to results-diarization-v2.html. Free-tier users see a streamlined transcript + summary layout without speaker pills, but with a clear upgrade nudge for the Pro diarization feature.

**DESIGN SYSTEM (REQUIRED):**

- Primary: #256AF4 (electric blue) — used for active states, CTAs, highlights
- Background: #101622 (midnight) — main app background
- Surface: #1E293B (slate-800) — cards, panels
- Surface-2: #0F172A — sidebar, modal backdrop
- Text primary: #F8FAFC — headings, important labels
- Text secondary: #94A3B8 — captions, timestamps, supporting text
- Accent-green: #10B981 — success, online indicators
- Accent-amber: #F59E0B — warnings, Pro tier badges
- Font: Inter (300–700 weight)
- Border radius: 8px default, 12px cards, 16px modals, 24px pills
- Glassmorphism: `backdrop-filter: blur(12px); background: rgba(30,41,59,0.7); border: 1px solid rgba(255,255,255,0.05);`
- Motion: `transition: all 0.2s cubic-bezier(0.4,0,0.2,1)`

**Page Structure:**

1. Sticky glass header (56px) — logo, filename pill, theme toggle, user avatar
2. Sticky audio player bar (72px, below header) — waveform progress, play/pause, speed (0.5×–2×), volume, timestamp
3. Main split layout (full remaining height):
   - Left panel (40%): Summary card with collapsible sections (Executive Summary, Key Topics, Action Items). Clean, single-color text — no speaker attribution. Each section shows a chevron toggle.
   - Right panel (60%): Full transcript scroll — plain paragraphs with timestamps shown on hover, no speaker coloring. Active word/sentence lightly highlighted during playback.
4. Upgrade nudge banner (between player bar and main layout, amber/amber-10 bg): "🎙️ Enable speaker labels — see who said what. Upgrade to Pro" with a CTA button and an "x" dismiss.
5. Floating "Chat with AI" FAB button (bottom-right, primary blue, glowing shadow)
6. Export button in header (ghost style) — shows "Export PDF" text but disabled with lock icon for free tier

**Content to use:**

- File: "Team_Standup_Feb_26.mp3" (12:47 duration)
- Transcript excerpt: "Good morning everyone. Today we'll cover the sprint status, blocker from the API team, and then review the design feedback from yesterday's session. The backend is on track for the Monday release window. There's one blocker on the authentication service that needs attention before we can close the sprint."
- Summary sections:
  - Executive Summary: "Daily standup covering sprint status, one critical blocker on the authentication service, and design feedback review."
  - Key Topics: API blocker, sprint status, Monday release, design feedback
  - Action Items (2 items): "Resolve auth service blocker (owner: backend team)" and "Share design feedback doc with product team"

**States to show:**

- Playhead at 04:18, second paragraph highlighted (lighter bg)
- "Key Topics" section expanded with 4 tags
- "Action Items" collapsed (showing chevron)
- Upgrade nudge banner visible (not dismissed)
- Export button showing lock icon (disabled state)
