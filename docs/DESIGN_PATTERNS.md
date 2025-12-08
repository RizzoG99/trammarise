# Design Patterns Implementation Guide

This document explains the design patterns implemented in Trammarise and how to use them effectively.

## Table of Contents

1. [Repository Pattern](#1-repository-pattern)
2. [Builder Pattern](#2-builder-pattern)
3. [Observer Pattern](#3-observer-pattern)
4. [Command Pattern](#4-command-pattern)
5. [Adapter Pattern](#5-adapter-pattern)
6. [State Machine Pattern](#6-state-machine-pattern)
7. [Integration Examples](#integration-examples)

---

## 1. Repository Pattern

**Purpose**: Centralize all API calls with consistent error handling, timeout management, and response validation.

**Location**: `src/repositories/AudioRepository.ts`

### Usage

```typescript
import { audioRepository } from '@/repositories/AudioRepository';

// Transcribe audio
const { transcript } = await audioRepository.transcribe({
  audioBlob: myAudioBlob,
  apiKey: 'sk-...',
  language: 'en',
  filename: 'audio.mp3',
});

// Summarize transcript
const { summary } = await audioRepository.summarize({
  transcript: 'My transcript...',
  contentType: 'meeting',
  provider: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-4',
  language: 'en',
});

// Chat with AI
const { response } = await audioRepository.chat({
  transcript: 'My transcript...',
  summary: 'My summary...',
  message: 'What are the key points?',
  history: [],
  provider: 'openai',
  apiKey: 'sk-...',
});

// Validate API key
const isValid = await audioRepository.validateApiKey('openai', 'sk-...');
```

### Benefits

- **Centralized**: All API logic in one place
- **Type-safe**: Strong TypeScript interfaces for all methods
- **Timeout handling**: Automatic timeout for all requests
- **Error handling**: Consistent error handling and validation
- **Testable**: Easy to mock for unit tests

---

## 2. Builder Pattern

**Purpose**: Create complex `AIConfiguration` objects with validation and fluent interface.

**Location**: `src/builders/ConfigurationBuilder.ts`

### Usage

```typescript
import { createConfigurationBuilder } from '@/builders/ConfigurationBuilder';

// Simple mode configuration
const config = createConfigurationBuilder()
  .asSimpleMode('openai', 'gpt-4', 'sk-...')
  .withContentType('meeting')
  .withLanguage('en')
  .build();

// Advanced mode configuration
const advancedConfig = createConfigurationBuilder()
  .asAdvancedMode('anthropic/claude-3.5-sonnet', 'sk-...', 'or-...')
  .withContentType('lecture')
  .withLanguage('es')
  .addContextFile(myPdfFile)
  .build();

// Build from existing config
const newConfig = ConfigurationBuilder
  .fromConfiguration(existingConfig)
  .withLanguage('fr')
  .build();
```

### Validation

The builder validates all required fields and throws `ConfigurationValidationError` if validation fails:

```typescript
try {
  const config = createConfigurationBuilder().build();
} catch (error) {
  if (error instanceof ConfigurationValidationError) {
    console.error('Config validation failed:', error.message);
  }
}
```

### Benefits

- **Fluent API**: Chain methods for readable code
- **Validation**: Automatic validation on `build()`
- **Immutable**: Each method returns a new builder instance
- **Type-safe**: Full TypeScript support

---

## 3. Observer Pattern

**Purpose**: Decouple event emitters from listeners, enabling reactive programming.

**Location**: `src/patterns/EventEmitter.ts`, `src/patterns/ProcessingEventEmitter.ts`

### Generic Event Emitter

```typescript
import { EventEmitter } from '@/patterns/EventEmitter';

// Define event map
interface MyEvents {
  'user-login': { userId: string; timestamp: number };
  'user-logout': { userId: string };
}

// Create emitter
const emitter = new EventEmitter<MyEvents>();

// Subscribe to events
const unsubscribe = emitter.on('user-login', (data) => {
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

// Subscribe once
emitter.once('user-logout', (data) => {
  console.log(`User ${data.userId} logged out`);
});

// Emit events
emitter.emit('user-login', { userId: '123', timestamp: Date.now() });

// Unsubscribe
unsubscribe();
```

### Processing Event Emitter

Specialized emitter for audio processing workflow:

```typescript
import { processingEventEmitter } from '@/patterns/ProcessingEventEmitter';

// Subscribe to progress updates
processingEventEmitter.on('progress', ({ step, progress, message }) => {
  console.log(`${step}: ${progress}% - ${message}`);
});

// Subscribe to step changes
processingEventEmitter.on('step-change', ({ previousStep, currentStep }) => {
  console.log(`Changed from ${previousStep} to ${currentStep}`);
});

// Subscribe to completion
processingEventEmitter.on('complete', ({ transcript, summary, duration }) => {
  console.log(`Processing complete in ${duration}ms`);
});

// Subscribe to errors
processingEventEmitter.on('error', ({ error, step, recoverable }) => {
  console.error(`Error at ${step}:`, error);
});

// In your processing code
processingEventEmitter.start();
processingEventEmitter.changeStep('transcribing');
processingEventEmitter.updateProgress(50, 'Halfway there...');
processingEventEmitter.complete(transcript, summary);
```

### Benefits

- **Decoupling**: Emitters don't need to know about listeners
- **Reactive**: UI updates automatically when events occur
- **Type-safe**: Strong typing for event data
- **Flexible**: Multiple listeners per event
- **Cleanup**: Easy unsubscribe with returned function

---

## 4. Command Pattern

**Purpose**: Encapsulate operations as objects, enabling undo/redo functionality.

**Location**: `src/patterns/Command.ts`, `src/commands/AudioCommands.ts`

### Using the Command History Hook

```typescript
import { useCommandHistory } from '@/hooks/useCommandHistory';
import { AddTrimRegionCommand } from '@/commands/AudioCommands';

function AudioEditor() {
  const { execute, undo, redo, canUndo, canRedo, undoDescription, redoDescription } =
    useCommandHistory(50);

  const handleAddRegion = async () => {
    const command = new AddTrimRegionCommand(
      wavesurfer,
      regionsPlugin,
      startTime,
      endTime
    );
    await execute(command);
  };

  return (
    <>
      <button onClick={undo} disabled={!canUndo}>
        Undo {undoDescription}
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo {redoDescription}
      </button>
      <button onClick={handleAddRegion}>
        Add Trim Region
      </button>
    </>
  );
}
```

### Creating Custom Commands

```typescript
import type { Command } from '@/patterns/Command';

class MyCustomCommand implements Command {
  private oldValue: any;

  constructor(private target: any, private newValue: any) {
    this.oldValue = target.value;
  }

  async execute(): Promise<void> {
    this.target.value = this.newValue;
  }

  async undo(): Promise<void> {
    this.target.value = this.oldValue;
  }

  getDescription(): string {
    return `Change value to ${this.newValue}`;
  }
}
```

### Macro Commands

Combine multiple commands into one:

```typescript
import { MacroCommand } from '@/commands/AudioCommands';

const macro = new MacroCommand(
  [
    new AddTrimRegionCommand(wavesurfer, regionsPlugin, 0, 10),
    new ChangePlaybackSpeedCommand(wavesurfer, 1.5),
    new ChangeVolumeCommand(wavesurfer, 0.8),
  ],
  'Setup audio editing'
);

await execute(macro);
// Undo will reverse all three commands
```

### Benefits

- **Undo/Redo**: Built-in support for operation reversal
- **History**: Track all operations
- **Macro operations**: Combine multiple commands
- **Testable**: Commands are easy to test in isolation

---

## 5. Adapter Pattern

**Purpose**: Handle different audio formats with a unified interface.

**Location**: `src/adapters/AudioAdapter.ts`, `src/adapters/AudioFormatAdapters.ts`

### Usage

```typescript
import { audioAdapterRegistry } from '@/adapters/AudioAdapterRegistry';

// Process any audio file
try {
  const processedBlob = await audioAdapterRegistry.processFile(uploadedFile);
  // processedBlob is guaranteed to be in a supported format
} catch (error) {
  console.error('Unsupported format:', error);
}

// Check if format is supported
if (audioAdapterRegistry.isSupported(file)) {
  // Process file
}

// Get supported types
const supportedTypes = audioAdapterRegistry.getSupportedTypes();
console.log('Supported formats:', supportedTypes);
```

### Creating Custom Adapters

```typescript
import { BaseAudioAdapter } from '@/adapters/AudioAdapter';

class AACAAdapter extends BaseAudioAdapter {
  canHandle(file: File): boolean {
    return file.type === 'audio/aac' || file.name.endsWith('.aac');
  }

  async convert(file: File): Promise<Blob> {
    // Convert AAC to MP3 if needed
    return file;
  }

  getName(): string {
    return 'AACAAdapter';
  }

  getSupportedTypes(): string[] {
    return ['audio/aac'];
  }

  getPriority(): number {
    return 40;
  }
}

// Register the adapter
audioAdapterRegistry.register(new AACAAdapter());
```

### Benefits

- **Format abstraction**: Handle multiple formats transparently
- **Priority system**: Higher priority adapters checked first
- **Validation**: Automatic file validation
- **Extensible**: Easy to add new format support

---

## 6. State Machine Pattern

**Purpose**: Manage application state transitions with validation and events.

**Location**: `src/state/AppStateMachine.ts`

### Usage

```typescript
import { appStateMachine } from '@/state/AppStateMachine';

// Subscribe to state changes
appStateMachine.on('state-change', ({ from, to }) => {
  console.log(`State changed: ${from} -> ${to}`);
});

// Subscribe to errors
appStateMachine.on('transition-error', ({ error }) => {
  console.error('Invalid transition:', error);
});

// Transition to new state
try {
  await appStateMachine.transition('recording');
} catch (error) {
  // Invalid transition
}

// Check if transition is valid
if (appStateMachine.canTransition('audio')) {
  await appStateMachine.transition('audio');
}

// Get current state
const currentState = appStateMachine.getState();

// Get valid transitions from current state
const validTransitions = appStateMachine.getValidTransitions();
console.log('Can transition to:', validTransitions);

// Get state history
const history = appStateMachine.getHistory();

// Reset to initial state
appStateMachine.reset();

// Visualize state machine
console.log(appStateMachine.visualize());
```

### Adding Guards and Callbacks

```typescript
// Add a transition with guard condition
appStateMachine.addTransition({
  from: 'audio',
  to: 'processing',
  guard: async () => {
    // Only allow if audio file exists
    return audioFile !== null;
  },
  onTransition: async () => {
    // Start processing when transitioning
    console.log('Starting processing...');
  },
});
```

### Valid State Transitions

```
initial → recording → audio → configuration → processing → results
   ↑         ↓         ↓            ↓             ↓          ↓
   └─────────┴─────────┴────────────┴─────────────┴──────────┘
```

### Benefits

- **Type-safe**: TypeScript ensures valid states
- **Validation**: Prevents invalid state transitions
- **Events**: React to state changes reactively
- **Guards**: Conditional transitions
- **History**: Track state changes
- **Visualization**: Debug state machine

---

## Integration Examples

### Complete Workflow Example

```typescript
import { useEffect, useState } from 'react';
import { appStateMachine } from '@/state/AppStateMachine';
import { processingEventEmitter } from '@/patterns/ProcessingEventEmitter';
import { audioRepository } from '@/repositories/AudioRepository';
import { createConfigurationBuilder } from '@/builders/ConfigurationBuilder';
import { audioAdapterRegistry } from '@/adapters/AudioAdapterRegistry';

function AudioProcessingWorkflow() {
  const [state, setState] = useState(appStateMachine.getState());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Subscribe to state changes
    const unsubState = appStateMachine.on('state-change', ({ to }) => {
      setState(to);
    });

    // Subscribe to progress updates
    const unsubProgress = processingEventEmitter.on('progress', ({ progress }) => {
      setProgress(progress);
    });

    return () => {
      unsubState();
      unsubProgress();
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    // Use adapter to process file
    const processedBlob = await audioAdapterRegistry.processFile(file);

    // Transition to audio state
    await appStateMachine.transition('audio');
  };

  const handleProcess = async () => {
    // Build configuration
    const config = createConfigurationBuilder()
      .withProvider('openai')
      .withModel('gpt-4')
      .withOpenAIKey('sk-...')
      .withContentType('meeting')
      .build();

    // Transition to processing
    await appStateMachine.transition('processing');

    // Start processing
    processingEventEmitter.start();

    try {
      // Transcribe
      const { transcript } = await audioRepository.transcribe({
        audioBlob: processedBlob,
        apiKey: config.openaiKey,
        language: 'en',
      });

      // Summarize
      const { summary } = await audioRepository.summarize({
        transcript,
        contentType: config.contentType,
        provider: config.provider,
        apiKey: config.openaiKey,
        model: config.model,
      });

      // Complete
      processingEventEmitter.complete(transcript, summary);
      await appStateMachine.transition('results');
    } catch (error) {
      processingEventEmitter.error(error as Error, false);
      await appStateMachine.transition('configuration');
    }
  };

  return (
    <div>
      <p>Current State: {state}</p>
      <p>Progress: {progress}%</p>
      <button onClick={() => handleFileUpload(file)}>Upload</button>
      <button onClick={handleProcess}>Process</button>
    </div>
  );
}
```

### Testing with Patterns

```typescript
import { describe, it, expect, vi } from 'vitest';
import { AudioRepository } from '@/repositories/AudioRepository';

describe('AudioRepository', () => {
  it('should transcribe audio', async () => {
    const repository = new AudioRepository();

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ transcript: 'Hello world' }),
    });

    const result = await repository.transcribe({
      audioBlob: new Blob(),
      apiKey: 'test-key',
    });

    expect(result.transcript).toBe('Hello world');
  });
});
```

---

## Best Practices

### 1. Repository Pattern
- Use the singleton `audioRepository` instance
- Don't bypass the repository with direct fetch calls
- Add retry logic in the repository, not in components

### 2. Builder Pattern
- Always call `build()` last
- Use try-catch for validation errors
- Use `fromConfiguration()` to modify existing configs

### 3. Observer Pattern
- Always unsubscribe in cleanup functions (React useEffect)
- Don't emit events synchronously in tight loops
- Use specific event types instead of generic ones

### 4. Command Pattern
- Keep commands small and focused
- Store minimal state needed for undo
- Use macro commands for related operations

### 5. Adapter Pattern
- Set priority correctly (higher = checked first)
- Always validate files in adapters
- Return the original file if no conversion needed

### 6. State Machine Pattern
- Define all valid transitions upfront
- Use guards for conditional transitions
- Subscribe to events in React components

---

## Migration Guide

### From Old API to Repository Pattern

**Before:**
```typescript
const response = await fetch('/api/transcribe', {
  method: 'POST',
  body: formData,
});
const data = await response.json();
```

**After:**
```typescript
const { transcript } = await audioRepository.transcribe({
  audioBlob: myBlob,
  apiKey: myKey,
});
```

### From Direct State to State Machine

**Before:**
```typescript
setAppState('audio');
```

**After:**
```typescript
await appStateMachine.transition('audio');
```

### From Callback Props to Event Emitter

**Before:**
```typescript
<Component onProgress={(p) => setProgress(p)} />
```

**After:**
```typescript
processingEventEmitter.on('progress', ({ progress }) => {
  setProgress(progress);
});
```

---

## Conclusion

These design patterns provide a robust foundation for building maintainable and scalable applications. Each pattern solves specific problems and can be used independently or combined for powerful workflows.

For more examples, see the refactored `App.refactored.tsx` file.
