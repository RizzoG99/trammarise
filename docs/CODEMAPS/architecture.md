<!-- Generated: 2026-02-26 | Files scanned: 160+ | Token estimate: ~600 -->

# Architecture Overview

## System Type

Single-page React app (Vite 7.2) + Vercel serverless API. Audio transcription/summarization tool.

## Data Flow

```
User (Browser)
  └─ React SPA (Vite, port 5173)
       ├─ Clerk Auth ──────────────► Clerk API
       ├─ Supabase Client ──────────► Supabase DB
       └─ REST calls ───────────────► Vercel API (port 3001)
                                           ├─ OpenAI Whisper (transcribe)
                                           ├─ OpenAI GPT-4 / OpenRouter (summarize, chat)
                                           ├─ AssemblyAI (alt transcription)
                                           ├─ Stripe (payments)
                                           └─ FFmpeg (audio chunking)
```

## Processing Pipeline

```
1. Upload/Record audio
2. FFmpeg compress/chunk if >24MB (SharedArrayBuffer, CDN-loaded)
3. POST /api/transcribe → Whisper (300s timeout)
4. POST /api/summarize → GPT-4 / OpenRouter (content-type-aware prompt)
5. Results page: transcript + summary + interactive chat
```

## Auth & Subscription Flow

```
Clerk sign-in → OnboardingContext checks profile
  ├─ needsOnboarding=true → redirect /onboarding
  └─ complete → AppLayout with SubscriptionContext
                  └─ tier gates via useFeatureGate hook
```

## State Management

- **Session data**: IndexedDB (file blobs) + sessionStorage (metadata)
- **Auth state**: Clerk React hooks (`useUser`)
- **Subscription/tier**: `SubscriptionContext` (Supabase-backed)
- **Theme**: `ThemeContext` (CSS variables)
- **Onboarding gate**: `OnboardingContext`
- **App state machine**: `src/state/AppStateMachine.ts`

## Key Entry Points

- `src/main.tsx` — React mount, i18n init
- `src/app/App.tsx` — Clerk provider, routing, onboarding gate
- `src/app/AppLayout.tsx` — Layout shell with NavigationSidebar
