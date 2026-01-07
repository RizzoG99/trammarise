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
The app uses a **route-based architecture** with React Router, managed in `src/app/App.tsx`:

```
/ (UploadRecordPage) → /audio/:sessionId (AudioEditingPage) → 
/processing/:sessionId (ProcessingPage) → /results/:sessionId (ResultsPage)
```

**Routes**:
- **`/`** (UploadRecordPage): File upload/recording + configuration (language, content type, processing mode)
- **`/audio/:sessionId`** (AudioEditingPage): Waveform visualization, playback, and trimming
- **`/configure/:sessionId`**: AI provider selection and API key setup (placeholder)
- **`/processing/:sessionId`** (ProcessingPage): Progress for compression, chunking, transcription, and summarization
- **`/results/:sessionId`** (ResultsPage): Displays transcript, summary, and interactive chat

**Session-Based Navigation**:
- Each workflow creates a unique `sessionId` (timestamp + random)
- Session data stored with `saveSession(sessionId, data)`
- Navigation uses `buildRoutePath(ROUTES.AUDIO, { sessionId })`

**Legacy Note**: `App.v1.tsx` contains the old state machine implementation (kept for reference)

### Key Component Architecture

**Route-Based Structure** (`src/app/routes/`):
```
App (React Router with AppLayout wrapper)
├── UploadRecordPage (upload/record + configuration)
│   ├── UploadPanel (file upload with drag-and-drop)
│   ├── RecordPanel (audio recording with controls)
│   │   ├── WaveformVisualization (animated bars)
│   │   └── RecordingButtons (RecordButton, PauseButton, StopButton)
│   ├── ContextUploadArea (PDF context files)
│   ├── LanguageSelector (50+ languages)
│   ├── ContentTypeSelector (meeting, lecture, etc.)
│   ├── ProcessingModeSelector (balanced, quality, speed)
│   └── ProcessAudioButton (navigate to audio editing)
│
├── AudioEditingPage (waveform playback & trimming)
│   └── AudioState
│       ├── WaveformPlayer (WaveSurfer.js visualization)
│       └── PlaybackControls (play/pause, trim controls)
│
├── ProcessingPage (multi-step progress indicator)
│   └── ProcessingState (shows compression, transcription, summarization)
│
└── ResultsPage (transcript, summary, chat)
    └── ResultsState
        ├── ChatInterface (interactive AI chat)
        └── ActionButtons (copy, TTS, PDF generation)
```

**Shared Components** (`src/components/ui/`):
- GlassCard, Button, Input, Heading, Text, Icon
- RecordingButtons (reusable audio control buttons)
- ThemeToggle (light/dark mode)

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
- `src/utils/session-manager.ts`: Session persistence with in-memory file cache (see Session Management below)
- `src/utils/constants.ts`: API timeouts, file size limits, validation constants
- `src/utils/pdf-generator.ts`: AI-powered PDF formatting and generation

### Session Management

**Location**: `src/utils/session-manager.ts`

The app uses a hybrid approach for session persistence:
- **Metadata** (language, contentType, processingMode, timestamps) stored in `sessionStorage`
- **Files** (audioFile, contextFiles) stored in **in-memory cache** (Map)

**Why?** Files and Blobs cannot be serialized to JSON/sessionStorage. They become empty objects when stringified.

**Trade-offs**:
- ✅ Works seamlessly for single-session workflows (upload → configure → process)
- ✅ No size limits (in-memory storage)
- ✅ Automatic cleanup when tab closes
- ❌ Files don't persist across page refreshes
- ❌ Limited to current browser tab

**Usage**:
```typescript
import { saveSession, loadSession, generateSessionId } from '../utils/session-manager';

// Save session
const sessionId = generateSessionId();
saveSession(sessionId, {
  audioFile: { name: 'audio.mp3', blob, file },
  contextFiles: [],
  language: 'en',
  contentType: 'meeting',
  processingMode: 'balanced',
  // ...
});

// Load session (files restored from cache)
const session = loadSession(sessionId);
```

**Note**: For persistence across refreshes, consider implementing IndexedDB storage in the future.

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

## Component Creation Workflow

When creating new UI components, follow this TDD-based workflow to ensure quality, consistency, and proper documentation:

### 1. Functional Analysis
Before writing any code, document the component's requirements:
- **Purpose**: What problem does this solve?
- **Props Interface**: All props with TypeScript types
- **Visual States**: Default, hover, active, disabled, loading, error
- **User Interactions**: Click, focus, keyboard navigation
- **Edge Cases**: Empty state, long content, rapid interactions
- **Accessibility**: ARIA labels, keyboard support, screen reader compatibility
- **Responsive Behavior**: How it adapts to mobile/tablet/desktop

### 2. Write Tests (TDD Approach)
Create `ComponentName.test.tsx` with Vitest + Testing Library covering:
- **Rendering**: Default props, all variants, different states
- **Interactions**: Click handlers, keyboard events, focus management
- **Edge Cases**: Null/undefined props, extreme values, rapid clicks
- **Accessibility**: ARIA attributes, keyboard navigation, focus indicators

**Test Structure**:
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => { /* ... */ });
  describe('Interactions', () => { /* ... */ });
  describe('Edge Cases', () => { /* ... */ });
  describe('Accessibility', () => { /* ... */ });
});
```

### 3. Implement Component
Build `ComponentName.tsx` to pass all tests:
- Use TypeScript for type safety
- Follow existing component patterns (GlassCard, Button, etc.)
- Use Tailwind classes with CSS variables (`var(--color-*)`)
- Support dark mode with `dark:` classes
- Add JSDoc comments for complex props

### 4. Create Storybook Story
Create `ComponentName.stories.tsx` for visual documentation:
- Use CSF v3 format with `tags: ['autodocs']`
- Include story for each variant/state
- Add interactive controls with `argTypes`
- Include usage code examples in story descriptions
- Group related stories (Core UI / Features / Forms)

**Story Template**:
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = { args: { /* ... */ } };
export const AllVariants: Story = { render: () => <>{/* ... */}</> };
```

### 5. Verify Against Mockups
- Compare implementation with mockup in `/docs/mockup/`
- Check colors match design system (Primary: #0A47C2, etc.)
- Verify spacing, typography, and animations
- Test in light and dark modes
- Test at mobile/tablet/desktop viewports in Storybook

### 6. Run Quality Checks
```bash
npm test                    # Run Vitest tests
npm run lint                # ESLint validation
npm run storybook           # Visual verification
npm run build               # Production build check
```

### Example: Creating a Button Component

**1. Functional Analysis**
- Purpose: Primary action trigger
- Props: `variant`, `children`, `onClick`, `disabled`, `icon`
- States: Default, Hover, Active, Disabled, Loading
- Interactions: Click, keyboard (Enter/Space), focus
- Edge Cases: Very long text, no children, rapid clicks
- Accessibility: ARIA role="button", focus ring, disabled state

**2. Tests** (`Button.test.tsx`)
```typescript
describe('Button', () => {
  it('renders children text');
  it('calls onClick when clicked');
  it('supports keyboard activation');
  it('shows loading spinner when loading=true');
  it('has proper ARIA attributes');
});
```

**3. Implementation** (`Button.tsx`)
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  // Implementation with Tailwind + accessibility
}
```

**4. Story** (`Button.stories.tsx`)
```typescript
export const Primary: Story = { args: { variant: 'primary', children: 'Click Me' } };
export const AllVariants: Story = { render: () => <>{/* Show all variants */}</> };
```

### Component Categories

**Core UI** (`src/components/ui/`): Button, Input, Modal, Card, etc.
**Features** (`src/features/*/components/`): Domain-specific components
**Layout** (`src/components/layout/`): Page structure components
**Audio** (`src/components/audio/`): Audio visualization & controls
**Forms** (`src/lib/components/form/`): Form controls & validation

### Quality Standards

- ✅ **Test Coverage**: Aim for 80%+ coverage on UI components
- ✅ **Accessibility**: WCAG 2.1 AA compliance
- ✅ **TypeScript**: No `any` types, strict mode enabled
- ✅ **Dark Mode**: All components support light/dark themes
- ✅ **Responsive**: Mobile-first approach with breakpoints
- ✅ **Documentation**: Props documented in TypeScript + Storybook

### Storybook Commands

- **Run Storybook**: `npm run storybook` - Start Storybook dev server on http://localhost:6006
- **Build Storybook**: `npm run build-storybook` - Generate static Storybook build

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