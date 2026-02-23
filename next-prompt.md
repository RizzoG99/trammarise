---
page: results-diarization-v2
---

A refreshed results page with speaker diarization enabled — the Pro-tier "gold standard" view.

This is the next evolution of speaker-diarization-results.html, updated to match the new design system.

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
   - Left panel (40%): Summary card with collapsible sections (Executive Summary, Key Decisions, Action Items), each showing speaker attribution inline
   - Right panel (60%): Full transcript scroll with speaker-colored segments. Show 3 distinct speakers: "Alex Chen" (blue pill), "Maria Santos" (purple pill), "David Kim" (green pill). Active segment highlighted during playback (lighter bg + left border). Timestamps shown on hover.
4. Speaker legend row (above transcript) — avatar initials + color badge + total speaking time %
5. Floating "Chat with AI" FAB button (bottom-right, primary blue, glowing shadow)
6. Export button in header (ghost style) — unlocked for Pro users

**Content to use:**

- File: "Product_Roadmap_Q2_2025.mp3" (47:23 duration)
- Alex Chen: "The key priority for Q2 is completing the speaker diarization feature before the June release window..."
- Maria Santos: "I agree. From the engineering side, we're estimating 3 weeks for the Whisper integration and another week for testing..."
- David Kim: "Sales is seeing strong demand for the feature — three enterprise prospects specifically asked about multi-speaker support..."

**States to show:**

- Segment 3 (David's quote) actively highlighted (playhead at 08:42)
- "Action Items" section in summary expanded with 2 checkboxes
- Chat FAB pulsing subtly
