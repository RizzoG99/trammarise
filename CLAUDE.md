**Context7 MCP**: Always use Context7 for library docs, API references, and setup instructions (React, TypeScript, Vite,
WaveSurfer.js, FFmpeg, OpenAI, etc.).

## Commands

- `npm run dev` - Start dev server (API + Vite)
- `npm test` - Run frontend tests only (React components, jsdom environment)
- `npm run api-test` - Run API tests only (endpoints, utils, Node.js environment)
- `npm run test:all` - Run all tests (frontend + API)
- `npm test path/to/file.test.tsx` - Test specific file
- `npm run build` - Build production
- `npm run lint` - ESLint validation
- `npm run storybook` - Visual component docs

## Architecture

**App**: React 19 + TypeScript 5.9 + Vite 7.2 audio transcription/summarization tool with multi-provider AI support.

**Routes** (`src/app/routes/`):

- `/` - UploadRecordPage (upload/record + config)
- `/audio/:sessionId` - AudioEditingPage (waveform trim with WaveSurfer.js regions)
- `/processing/:sessionId` - ProcessingPage (progress tracking)
- `/results/:sessionId` - ResultsPage (transcript, summary, chat)

**Components** (`src/lib/components/`): Import from `@/lib`

- UI: Button, GlassCard, Modal, LoadingSpinner, ThemeToggle, etc.
- Form: ToggleSwitch, RadioCard, SelectCard
- Audio: WaveformPlayer, PlaybackControls, WaveformEditorWithUndo
- Chat: ChatInterface

**Processing Pipeline**:

1. File upload OR MediaRecorder recording
2. FFmpeg compression/chunking if >24MB (CDN-loaded, requires CORS headers for SharedArrayBuffer)
3. OpenAI Whisper transcription (300s timeout)
4. AI summarization (OpenAI GPT-4 or OpenRouter models) with content type context
5. Interactive chat

**AI Providers** (`api/providers/`):

- Strategy pattern: `base.ts` interface, `factory.ts`, `openai.ts`, `openrouter.ts`
- Transcription always uses OpenAI Whisper

**API Routes** (`/api`):

- `transcribe.ts` - Whisper (300s timeout)
- `summarize.ts` - AI summary with content type
- `chat.ts` - Chat with context
- `validate-key.ts` - Key validation
- `generate-pdf.ts` - PDF generation

**Session Management** (`src/utils/session-manager.ts`):

- Metadata in sessionStorage, files in in-memory Map
- ⚠️ Files don't persist across refreshes (Blobs can't serialize to JSON)
- Consider IndexedDB for future persistence

**API Key Security**: sessionStorage only, cleared on tab close, never saved to disk/server

**Content Types**: Meeting, Lecture, Interview, Podcast, Voice Memo, Other (tailored AI prompts)

**Types**: `src/types/audio.ts` (AppState, AIProvider, AIConfiguration, ProcessingResult)

**Hooks**: useAudioRecorder, useWaveSurfer, useSpeechSynthesis, useTheme

**Utilities**: `src/utils/` (api.ts, audio.ts, audio-processor.ts, session-storage.ts, session-manager.ts, constants.ts,
pdf-generator.ts)

**Design Patterns**: See `docs/DESIGN_PATTERNS.md` for details

- Repository: `src/repositories/AudioRepository.ts` (centralized API calls)
- Builder: `src/builders/ConfigurationBuilder.ts` (fluent AIConfiguration)
- Observer: `src/patterns/ProcessingEventEmitter.ts` (progress events)
- Command: `src/hooks/useCommandHistory.ts` (undo/redo)
- Adapter: `src/adapters/AudioAdapterRegistry.ts` (format handling)
- State Machine: `src/state/AppStateMachine.ts` (validated transitions)

## Critical Rules

**PR Workflow** - ⚠️ NEVER push to main directly!

1. Create branch: `feature/`, `fix/`, `refactor/`, `test/`, `docs/`
2. Push and create PR: `gh pr create`
3. Squash merge after approval: `gh pr merge --squash --delete-branch`

**Component Creation** - TDD workflow:

1. Analyze requirements (props, states, a11y, edge cases)
2. Write tests first (Vitest + Testing Library)
3. Implement with TypeScript + Tailwind + dark mode
4. Create Storybook story (CSF v3, `tags: ['autodocs']`)
5. Verify mockups (`/docs/mockup/`), run `npm test && npm run lint && npm run build`

See detailed workflow in comments (removed for brevity).

**Quality Standards**:

- 80%+ test coverage, WCAG 2.1 AA, strict TypeScript, dark mode support, mobile-first

**WaveSurfer**: Regions plugin for trimming, no internal wrapper (width constraint fix)

**Development**:

- Vite: port 5173, API: port 3001, Tailwind 4 with CSS variables
- Vercel serverless deployment, CORS for SharedArrayBuffer

**Token Optimization** (applies to Claude):

- Use `offset/limit` on Read, `head_limit` on Grep
- Test specific files: `npm test File.test.tsx 2>&1 | tail -5`
- Chain commands: `npm test && npx tsc --noEmit | tail -10`
- Trust Edit/Write tools (don't re-read to verify)
- Use Serena symbol tools (`find_symbol`, `rename_symbol`) for refactoring

## Design Context

### Users

Mixed audience of knowledge workers: professionals capturing meetings, academics transcribing lectures,
journalists and researchers conducting interviews, podcasters, and students. Often time-pressured —
they need a tool that gets out of the way and delivers reliable results without friction or surprise.
The job to be done: **turn spoken audio into organized, usable text and insights as fast as possible.**
Familiarity with AI tools varies widely; the UI must earn trust from non-technical users while feeling
sharp and capable to power users.

### Brand Personality

**Precise · Elegant · Intelligent**

- **Precise**: No visual noise. Information hierarchy is exact. Spacing, alignment, and sizing signal
  care and competence.
- **Elegant**: Glassmorphism is restrained and purposeful — refinement, not decoration. Generous
  whitespace over crowded density.
- **Intelligent**: Progressive disclosure, smart defaults, contextual UI states. The interface
  anticipates needs without overwhelming.

Emotional goal: **Calm confidence.** Every interaction should communicate "this will work reliably —
I can trust this tool." Trust is earned through processing transparency, clear feedback, and the
visible quality of the craft itself.

### Aesthetic Direction

Dark mode is the primary canvas (`#101622` midnight background). Both modes supported. The visual
language is AI-forward and developer-adjacent — drawing from **Perplexity / Cursor** (crisp
typography, focused dark UI, minimal chrome) and **Otter.ai / Descript** (clean transcript layout,
practical audio controls, professional feel).

- **Glass layering**: bg → surface → elevated → overlay — each layer uses `backdrop-blur` and
  subtle borders, never hard fills
- **Typography**: Inter for body/UI, Space Grotesk for display headings — crisp, modern, legible
- **Color**: Ocean Gloss Blue (`#3b82f6`) as the single accent; use sparingly for interactive
  elements and CTAs. Avoid rainbow palettes.
- **Radius**: `rounded-xl` / `rounded-2xl` for cards and surfaces; `rounded-lg` for inputs/buttons
- **Motion**: Subtle only — waveform animations, loading pulses. No decorative motion.
- **Anti-references**: Avoid anything that feels enterprise SaaS (heavy blue fills, tables
  everywhere), consumer-app playful (bright gradients, rounded-full bubbles), or complex (multiple
  competing accent colors, dense sidebars).

### Design Principles

1. **Calm through clarity** — Every screen communicates "you are in control." Visible progress,
   unambiguous states, no mystery loading.
2. **Precision as personality** — The quality of spacing, alignment, and sizing IS the brand.
   Sloppy pixels break trust as fast as bugs do.
3. **Elegance over decoration** — Glass effects and accent color are purposeful. If it doesn't
   serve user focus, remove it.
4. **Intelligence shown, not told** — Smart defaults, contextual hints, and progressive disclosure
   reveal capability without adding complexity.
5. **Dark-first consistency** — Maintain the glass hierarchy across every component. Never
   introduce flat fills or light-mode assumptions into the dark canvas.
