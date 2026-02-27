<!-- Generated: 2026-02-26 | Files scanned: 10 | Token estimate: ~300 -->

# Data Architecture

## Storage Layers

```
Browser
  sessionStorage  — lightweight metadata (sessionId, config, result)
  IndexedDB       — audio blobs, context files (persisted across navigations)
  In-memory Map   — temporary Blob URLs (cleared on refresh)

Server
  Supabase PostgreSQL — sessions, users, subscriptions, usage, credits
  Supabase Storage    — audio file uploads (optional, via /api/audio)
```

## Session Data Structure (src/types/routing.ts)

```typescript
SessionData {
  sessionId: string
  audioFile: AudioFile           // { name, blob, file, url? }
  contextFiles: File[]
  language: string               // LanguageCode | 'auto'
  contentType: ContentType       // meeting|lecture|interview|podcast|voice_memo|other
  processingMode: ProcessingMode // standard|quality
  noiseProfile?: string          // quiet|meeting_room|cafe|outdoor|phone
  enableSpeakerDiarization?: boolean
  speakersExpected?: number      // 2-10
  selectionMode?: 'full'|'selection'
  regionStart?: number           // audio trim region (seconds)
  regionEnd?: number
  configuration?: AIConfiguration
  result?: ProcessingResult
  createdAt: number
  updatedAt: number
}
```

## AI Configuration (src/types/audio.ts)

```typescript
AIConfiguration {
  mode: 'simple' | 'advanced'
  provider: 'openai' | 'openrouter'
  model: string
  openaiKey: string             // always required (Whisper)
  openrouterKey?: string        // advanced mode only
  contentType: string
  language: LanguageCode
  noiseProfile?: string
  enableSpeakerDiarization?: boolean
  speakersExpected?: number
  knownSpeakers?: string[]
}
```

## Database Types (src/types/database.ts)

Supabase-generated types covering:

- `sessions` — transcription session records
- `users` — Clerk-synced user profiles
- `subscriptions` — Stripe subscription state
- `usage` — per-user usage metering
- `credits` — credit balance + transactions

## Session Management Utilities

```
src/utils/session-manager.ts   — CRUD for sessions in IndexedDB + migration from sessionStorage
src/utils/session-storage.ts   — sessionStorage read/write helpers
src/utils/storage-manager.ts   — IndexedDB quota management
src/utils/indexeddb.ts         — raw IndexedDB wrapper
src/repositories/SessionRepository.ts — server-side session CRUD (Supabase)
src/repositories/AudioRepository.ts   — audio API calls (transcribe, summarize, chat)
```
