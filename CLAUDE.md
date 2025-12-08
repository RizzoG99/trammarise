# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development
- **Start dev server**: `npm run dev` - Runs both API server (tsx) and Vite dev server concurrently
- **Start API only**: `npm run dev:api` - Runs Express API dev server on port 3001
- **Start Vite only**: `npm run dev:vite` - Runs Vite dev server with HMR
- **Start with Vercel CLI**: `npm run dev:vercel` - Alternative using Vercel dev environment
- **Build**: `npm run build` - TypeScript type-check (`tsc -b`) followed by Vite production build
- **Lint**: `npm run lint` - ESLint with TypeScript and React hooks rules
- **Preview**: `npm run preview` - Preview production build locally
- **Setup FFmpeg**: `npm run setup:ffmpeg` - Run FFmpeg setup script for audio processing

### Deployment
The app is deployed on Vercel. API routes in `/api` are serverless functions. Note:
- Transcription API has 300s max duration (configured in vercel.json)
- Other API routes have 60s max duration
- CORS headers configured for SharedArrayBuffer (required for FFmpeg)

## Architecture Overview

**Trammarise** is a React + TypeScript + Vite application for audio recording, transcription, and AI-powered summarization with multi-provider support.

### State Flow
The app uses a linear state machine with 6 states managed in `App.tsx`:

```
initial → recording → audio → configuration → processing → results
   ↑                             ↑                            ↓
   └─────────────────────────────┴────────────────────────────┘
```

- **initial**: File upload or start recording
- **recording**: Active recording with duration timer
- **audio**: Waveform visualization, playback, and trimming
- **configuration**: AI provider selection and API key setup
- **processing**: Shows progress for compression, chunking, transcription, and summarization
- **results**: Displays transcript, summary, and interactive chat

### Key Component Architecture

```
App (orchestrates state, audio processing pipeline)
├── InitialState (file upload, recording trigger)
├── RecordingState (duration display, stop button)
├── AudioState (playback & editing)
│   ├── WaveformPlayer (WaveSurfer.js visualization)
│   └── PlaybackControls (play/pause, trim controls)
├── ConfigurationState (AI provider selection)
│   └── ConfigurationForm (API key inputs, validation)
├── ProcessingState (multi-step progress indicator)
└── ResultsState (transcript, summary, chat)
    ├── ChatInterface (interactive AI chat)
    └── ActionButtons (copy, TTS, PDF generation)
```

### Audio Processing Pipeline

1. **Input**: File upload OR Web Audio API recording (MediaRecorder)
2. **Large File Handling** (>24MB or non-MP3):
   - FFmpeg compression (dynamic import, loaded from CDN)
   - Chunking into <24MB segments
3. **Transcription**: OpenAI Whisper API (processes each chunk sequentially)
4. **Summarization**: Selected AI provider (OpenAI GPT-4 or OpenRouter models)
5. **Interactive Chat**: Continue conversation with full transcript/summary context

**Cancellation Support**: Processing can be aborted via `AbortController` at any step.

### Multi-Provider AI Architecture

The app uses the **Strategy Pattern** for AI provider abstraction:

```
api/providers/
├── base.ts          # AIProvider interface
├── factory.ts       # createProvider() factory
├── openai.ts        # GPT-4 implementation
└── openrouter.ts    # OpenRouter multi-model implementation
```

**Key Interface** (`api/providers/base.ts`):
```typescript
interface AIProvider {
  name: string;
  summarize(params: SummarizeParams): Promise<string>;
  chat(params: ChatParams): Promise<string>;
  validateApiKey(apiKey: string): Promise<boolean>;
}
```

**Providers**:
- `openai`: Uses GPT-4 for summarization and chat
- `openrouter`: Supports multiple models (Claude, Deepseek, etc.) via OpenRouter API

**Transcription**: Always uses OpenAI Whisper API regardless of summarization provider.

### API Routes (Vercel Serverless)

- `/api/transcribe.ts` - OpenAI Whisper transcription (300s timeout)
- `/api/summarize.ts` - AI summarization with content type context and optional PDF context
- `/api/chat.ts` - Interactive chat with transcript/summary context
- `/api/validate-key.ts` - API key validation for providers
- `/api/generate-pdf.ts` - AI-formatted PDF generation with jsPDF

### Key Dependencies

- **React 19.2**: UI framework
- **TypeScript 5.9**: Type safety
- **Vite 7.2**: Build tool and dev server
- **WaveSurfer.js 7.11**: Audio waveform visualization with regions plugin
- **@ffmpeg/ffmpeg 0.12.15**: Browser-based audio compression/chunking
- **Vercel Serverless**: API endpoints
- **OpenAI SDK**: Whisper transcription, GPT-4 chat
- **@openrouter/sdk**: Multi-model AI support
- **jsPDF**: PDF generation
- **React Markdown**: Formatted summary rendering
- **Lucide React**: Icon library

### Type Definitions

All types are centralized in `src/types/audio.ts`:
- `AppState`: Union type for app state machine
- `AIProvider`: 'openai' | 'openrouter'
- `AIConfiguration`: User-selected AI config (provider, model, keys, content type)
- `ProcessingResult`: Final result with transcript, summary, chat history
- `ProcessingStateData`: Progress tracking for multi-step processing

### Custom Hooks

- `useAudioRecorder`: MediaRecorder API wrapper, handles permissions and recording
- `useWaveSurfer`: WaveSurfer.js initialization, playback control, regions plugin
- `useSpeechSynthesis`: Browser TTS for reading transcripts/summaries
- `useTheme`: Dark/light theme persistence

### Utilities

- `src/utils/api.ts`: API client with timeout support, request validation
- `src/utils/audio.ts`: Audio buffer manipulation, WAV encoding
- `src/utils/audio-processor.ts`: FFmpeg integration for compression/chunking
- `src/utils/audioCompression.ts`: Legacy compression utility
- `src/utils/session-storage.ts`: API key storage (sessionStorage, cleared on tab close)
- `src/utils/constants.ts`: API timeouts, file size limits, validation constants
- `src/utils/pdf-generator.ts`: AI-powered PDF formatting and generation

### API Key Security

- **Storage**: sessionStorage only (cleared when tab closes)
- **Scope**: Never saved to disk, localStorage, or server
- **Transmission**: Keys sent directly to AI provider APIs via Vercel serverless functions
- **Validation**: API keys validated before processing via `/api/validate-key`

### Content Type Context

The app supports specialized summarization based on content type:
- Meeting
- Lecture
- Interview
- Podcast
- Voice Memo
- Other

Each type provides tailored prompts to the AI for optimal summary structure.

### FFmpeg Integration

- **Loading**: Dynamic import + CDN loading (only when needed for large files)
- **Use Case**: Compresses audio >24MB and chunks into processable segments
- **Error Handling**: Graceful fallback messages if CDN unavailable
- **CORS Requirements**: SharedArrayBuffer requires specific headers (configured in vercel.json)

### Development Notes

- Vite dev server runs on port 5173 (default)
- API dev server runs on port 3001 (Express)
- Use `concurrently` to run both servers in development
- For Vercel local development, use `vercel dev` instead
- WaveSurfer regions plugin enables audio trimming (drag to select, click scissors icon)
- CSS uses Tailwind 4 with custom CSS variables for theming
- ESLint configured with React 19 hooks and refresh rules

## Design Patterns

The codebase implements several design patterns for maintainability and scalability. See `docs/DESIGN_PATTERNS.md` for detailed documentation.

### 1. Repository Pattern
**Location**: `src/repositories/AudioRepository.ts`
- Centralizes all API calls (transcribe, summarize, chat, PDF generation)
- Provides consistent error handling, timeouts, and response validation
- Singleton instance: `audioRepository`
- **Usage**: `await audioRepository.transcribe({ audioBlob, apiKey, language })`

### 2. Builder Pattern
**Location**: `src/builders/ConfigurationBuilder.ts`
- Fluent API for creating `AIConfiguration` objects
- Built-in validation with `ConfigurationValidationError`
- **Usage**: `createConfigurationBuilder().withProvider('openai').withModel('gpt-4').build()`

### 3. Observer Pattern
**Locations**:
- Generic: `src/patterns/EventEmitter.ts`
- Specialized: `src/patterns/ProcessingEventEmitter.ts`

Decouples event emitters from listeners for reactive programming:
- `EventEmitter<T>`: Generic type-safe event emitter
- `ProcessingEventEmitter`: Specialized for audio processing workflow
- Events: `progress`, `step-change`, `complete`, `error`, `cancel`
- **Usage**: `processingEventEmitter.on('progress', ({ step, progress }) => ...)`

### 4. Command Pattern
**Locations**:
- Base: `src/patterns/Command.ts`
- Commands: `src/commands/AudioCommands.ts`
- Hook: `src/hooks/useCommandHistory.ts`

Enables undo/redo functionality:
- `CommandHistory`: Manages command execution and history
- `useCommandHistory()`: React hook for easy integration
- Built-in commands: `AddTrimRegionCommand`, `RemoveTrimRegionCommand`, `ChangePlaybackSpeedCommand`, `ChangeVolumeCommand`
- `MacroCommand`: Combine multiple commands
- **Usage**: `const { execute, undo, redo, canUndo, canRedo } = useCommandHistory()`

### 5. Adapter Pattern
**Locations**:
- Interface: `src/adapters/AudioAdapter.ts`
- Implementations: `src/adapters/AudioFormatAdapters.ts`
- Registry: `src/adapters/AudioAdapterRegistry.ts`

Handles different audio formats with unified interface:
- Adapters: `MP3Adapter`, `WAVAdapter`, `WebMAdapter`, `M4AAdapter`, `OGGAdapter`, `FLACAdapter`, `GenericAudioAdapter`
- Priority-based selection (higher priority checked first)
- Automatic validation and format conversion
- Singleton registry: `audioAdapterRegistry`
- **Usage**: `await audioAdapterRegistry.processFile(uploadedFile)`

### 6. State Machine Pattern
**Location**: `src/state/AppStateMachine.ts`
- Explicit state transitions with validation
- Guard conditions and transition callbacks
- Event emission on state changes
- Singleton instance: `appStateMachine`
- Valid transitions enforced at runtime
- **Usage**: `await appStateMachine.transition('audio')`

### State Flow with Validation
```
initial → recording → audio → configuration → processing → results
   ↑         ↓         ↓            ↓             ↓          ↓
   └─────────┴─────────┴────────────┴─────────────┴──────────┘
```

All state transitions are validated. Invalid transitions throw errors.

### Integration Example
```typescript
// Use repository for API calls
const { transcript } = await audioRepository.transcribe({ ... });

// Build configuration
const config = createConfigurationBuilder()
  .withProvider('openai')
  .withModel('gpt-4')
  .build();

// Subscribe to processing events
processingEventEmitter.on('progress', ({ progress }) => {
  console.log(`Progress: ${progress}%`);
});

// Transition states safely
await appStateMachine.transition('processing');

// Process audio with adapter
const processedBlob = await audioAdapterRegistry.processFile(file);

// Use command pattern for undo/redo
const { execute, undo, redo } = useCommandHistory();
await execute(new AddTrimRegionCommand(...));
```

### Refactored Code
- `src/App.refactored.tsx`: Example App.tsx using all patterns
- `src/components/audio/WaveformEditorWithUndo.tsx`: Example component with undo/redo
- `docs/DESIGN_PATTERNS.md`: Comprehensive pattern documentation
