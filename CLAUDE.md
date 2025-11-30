# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development
- **Start dev server**: `npm run dev` - Runs Vite dev server with hot module replacement
- **Build**: `npm run build` - TypeScript type-check (`tsc -b`) followed by Vite production build
- **Lint**: `npm run lint` - ESLint with TypeScript and React hooks rules
- **Preview**: `npm run preview` - Preview production build locally

## Architecture Overview

**Trammarise** is a React + TypeScript + Vite application for audio recording, playback, trimming, and processing (transcription/summarization planned).

### State Management Pattern
The app uses a single `AppState` that determines which view is rendered:
- **'initial'**: File upload or start recording
- **'recording'**: Active recording UI with duration timer
- **'audio'**: Audio playback, visualization, and trimming

The root `App.tsx` component manages this state and passes callbacks to child state components (`InitialState`, `RecordingState`, `AudioState`).

### Key Component Hierarchy
```
App (manages appState, audioFile, useAudioRecorder hook)
├── InitialState (file upload input, start recording button)
├── RecordingState (duration display, stop button)
└── AudioState (audio visualization & controls)
    ├── WaveformPlayer (WaveSurfer visualization with regions plugin)
    └── PlaybackControls (play/pause, timeline, trim button)
```

### Audio Processing Flow

1. **Recording**: `useAudioRecorder` hook manages MediaRecorder API, returns audioBlob when recording stops
2. **Playback & Visualization**: `useWaveSurfer` hook wraps WaveSurfer.js library, handles regions (for trimming)
3. **Trimming**: Uses WaveSurfer regions API to define trim boundaries, then `trimAudioBuffer` utility converts selection to trimmed audio
4. **Audio Utilities** (`src/utils/audio.ts`): Helper functions for audio buffer manipulation and WAV encoding

### Key Dependencies
- **React 19.2**: UI framework
- **wavesurfer.js 7.11**: Audio visualization with regions plugin for trimming
- **TypeScript 5.9**: Type safety
- **Vite 7.2**: Build tool and dev server
- **ESLint 9.39**: Linting (with React hooks and refresh plugins)

### Type Definitions
All types are in `src/types/audio.ts`:
- `AudioFile`: Represents uploaded/recorded audio (name + Blob)
- `AppState`: Union type for current view state
- `WaveSurferConfig`: Configuration object for waveform visualization

### Custom Hooks
- `useAudioRecorder`: Encapsulates Web Audio API (getUserMedia, MediaRecorder)
- `useWaveSurfer`: Encapsulates WaveSurfer initialization, playback control, and regions plugin management

### Component Patterns
- State components (`src/components/states/`) handle UI for specific app states
- Audio components (`src/components/audio/`) are reusable audio-specific controls
- UI components (`src/components/ui/`) are generic styled components (Button, icons)
- CSS modules co-located with components for scoped styling

## Development Notes

- The app currently shows an alert for "Process Audio" action—transcription/summarization is planned for next phase
- Audio trimming uses Web Audio API `AudioBuffer` operations, converted to WAV format via utility function
- WaveSurfer is configured with purple accent colors and responsive bar visualization
- ESLint is configured with React hooks and refresh rules; consider enabling type-aware rules for production
