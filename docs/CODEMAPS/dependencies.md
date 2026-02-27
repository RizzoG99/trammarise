<!-- Generated: 2026-02-26 | Files scanned: 5 | Token estimate: ~300 -->

# Dependencies & Integrations

## External Services

| Service        | Purpose                   | Integration                                    |
| -------------- | ------------------------- | ---------------------------------------------- |
| OpenAI Whisper | Transcription (always)    | `api/transcribe.ts`                            |
| OpenAI GPT-4   | Summarization + chat      | `api/providers/openai.ts`                      |
| OpenRouter     | Alt. summarization models | `api/providers/openrouter.ts`                  |
| AssemblyAI     | Async transcription (alt) | `api/providers/assemblyai.ts`                  |
| Clerk          | Auth (sign-in/up, JWT)    | `@clerk/clerk-react`, `@clerk/backend`         |
| Supabase       | Database + storage        | `@supabase/supabase-js`                        |
| Stripe         | Subscriptions + credits   | `@stripe/stripe-js`, `@stripe/react-stripe-js` |
| Vercel         | Serverless deployment     | `@vercel/node`                                 |

## Key Frontend Libraries

| Library             | Version | Purpose                                           |
| ------------------- | ------- | ------------------------------------------------- |
| React               | 19      | UI framework                                      |
| TypeScript          | 5.9     | Type safety                                       |
| Vite                | 7.2     | Build tool, dev server (port 5173)                |
| react-router-dom    | —       | Client-side routing                               |
| react-i18next       | —       | i18n (en/it/de/es)                                |
| Tailwind CSS        | 4       | Styling with CSS variables                        |
| WaveSurfer.js       | —       | Waveform visualization + regions plugin           |
| @react-pdf/renderer | —       | Client-side PDF generation                        |
| lucide-react        | —       | Icon library                                      |
| @ffmpeg/ffmpeg      | —       | WASM FFmpeg (CDN-loaded, needs CORS/COOP headers) |

## Key Backend Libraries

| Library            | Purpose                                |
| ------------------ | -------------------------------------- |
| openai             | Whisper + GPT-4 API client             |
| fluent-ffmpeg      | Server-side audio compression/chunking |
| busboy             | Multipart file upload parsing          |
| pdf-parse          | Context PDF text extraction            |
| pako               | Compression utilities                  |
| axios              | HTTP client for provider calls         |
| ai (Vercel AI SDK) | Streaming AI responses                 |

## Design Patterns (src/patterns/ + src/builders/ etc.)

| Pattern       | File                                     | Purpose                     |
| ------------- | ---------------------------------------- | --------------------------- |
| Repository    | `src/repositories/`                      | Centralized API + DB access |
| Builder       | `src/builders/ConfigurationBuilder.ts`   | Fluent AIConfiguration      |
| Observer      | `src/patterns/ProcessingEventEmitter.ts` | Progress events             |
| Command       | `src/hooks/useCommandHistory.ts`         | Undo/redo                   |
| Adapter       | `src/adapters/AudioAdapterRegistry.ts`   | Format handling             |
| State Machine | `src/state/AppStateMachine.ts`           | Validated state transitions |
| Strategy      | `api/providers/`                         | Pluggable AI providers      |

## Environment Variables Required

```
VITE_CLERK_PUBLISHABLE_KEY   — Clerk frontend key
CLERK_SECRET_KEY             — Clerk backend key
VITE_SUPABASE_URL            — Supabase project URL
VITE_SUPABASE_ANON_KEY       — Supabase anon key
SUPABASE_SERVICE_ROLE_KEY    — Supabase admin key
STRIPE_SECRET_KEY            — Stripe secret
STRIPE_WEBHOOK_SECRET        — Stripe webhook signing
```
