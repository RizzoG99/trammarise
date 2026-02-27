<!-- Generated: 2026-02-26 | Files scanned: 45 | Token estimate: ~500 -->

# Backend Architecture

## API Routes (Vercel Serverless)

```
POST /api/transcribe          → transcribe.ts → providers/factory → OpenAI Whisper
POST /api/summarize           → summarize.ts → providers/ai-factory → GPT-4/OpenRouter
POST /api/chat                → chat.ts → providers/ai-factory → GPT-4/OpenRouter
GET  /api/validate-key        → validate-key.ts → OpenAI key check

GET  /api/audio/[sessionId]   → audio/[sessionId].ts → Supabase storage
GET  /api/sessions/list       → sessions/list.ts → Supabase DB
POST /api/sessions/create     → sessions/create.ts → Supabase DB
POST /api/sessions/upsert     → sessions/upsert.ts → Supabase DB
POST /api/sessions/import     → sessions/import.ts → Supabase DB
GET  /api/sessions/[id]       → sessions/[id].ts → Supabase DB

GET  /api/usage/current       → usage/current.ts → Supabase DB
GET  /api/subscriptions/current → subscriptions/current.ts → Supabase DB
GET  /api/credits/balance     → credits/balance.ts → Supabase DB
POST /api/credits/purchase    → credits/purchase.ts → Stripe

GET  /api/transcribe-job/[jobId]/status  → AssemblyAI job polling
POST /api/transcribe-job/[jobId]/cancel  → AssemblyAI job cancel
POST /api/stripe/create-checkout-session → Stripe checkout
GET  /api/user-settings/api-key          → encrypted key retrieval
POST /api/webhooks/clerk      → webhooks/clerk.ts → user provisioning
POST /api/webhooks/stripe     → webhooks/stripe.ts → subscription update
```

## Middleware Chain

```
auth.ts (Clerk JWT verify) → rate-limit.ts → usage-tracking.ts → handler
```

## AI Provider Strategy Pattern

```
api/providers/
  base.ts          — AIProvider interface
  factory.ts       — transcription provider factory
  ai-factory.ts    — summarize/chat provider factory
  openai.ts        — OpenAI implementation
  openrouter.ts    — OpenRouter implementation
  assemblyai.ts    — AssemblyAI async transcription
  openai-transcription-adapter.ts — Whisper adapter
```

## Audio Processing Utilities

```
api/utils/
  audio-chunker.ts      — split audio >24MB into chunks
  chunk-processor.ts    — parallel chunk transcription
  transcript-assembler.ts — merge chunk results
  ffmpeg-setup.ts       — FFmpeg binary config
  file-validator.ts     — MIME type + size validation
  job-manager.ts        — async job lifecycle (AssemblyAI)
  pdf-extractor.ts      — context PDF text extraction
  encryption.ts         — API key encryption at rest
  rate-limit-governor.ts — per-user rate limiting
  text-chunker.ts       — long text splitting for summaries
```
