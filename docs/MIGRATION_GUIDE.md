# Migration Guide: Adopting Design Patterns

This guide helps you migrate from the current implementation to the new pattern-based architecture.

## Overview

The new architecture introduces 6 design patterns:
1. **Repository Pattern** - API abstraction
2. **Builder Pattern** - Configuration construction
3. **Observer Pattern** - Event handling
4. **Command Pattern** - Undo/redo
5. **Adapter Pattern** - Audio format handling
6. **State Machine Pattern** - State management

## Migration Steps

### Step 1: Update API Calls (Repository Pattern)

**Current Code** (`src/utils/api.ts`):
```typescript
import { transcribeAudio, summarizeTranscript, chatWithAI } from './utils/api';

const { transcript } = await transcribeAudio(audioBlob, apiKey, language, filename);
const { summary } = await summarizeTranscript(transcript, contentType, provider, apiKey);
const { response } = await chatWithAI(transcript, summary, message, history, provider, apiKey);
```

**New Code** (`src/repositories/AudioRepository.ts`):
```typescript
import { audioRepository } from './repositories/AudioRepository';

const { transcript } = await audioRepository.transcribe({
  audioBlob,
  apiKey,
  language,
  filename,
});

const { summary } = await audioRepository.summarize({
  transcript,
  contentType,
  provider,
  apiKey,
  model,
  contextFiles,
  language,
});

const { response } = await audioRepository.chat({
  transcript,
  summary,
  message,
  history,
  provider,
  apiKey,
  model,
});
```

**Benefits**:
- Centralized API logic
- Consistent error handling
- Easy to mock for testing
- Type-safe interfaces

---

### Step 2: Update Configuration Building (Builder Pattern)

**Current Code**:
```typescript
const config: AIConfiguration = {
  mode: 'simple',
  provider: 'openai',
  model: 'gpt-4',
  openaiKey: 'sk-...',
  contentType: 'meeting',
  language: 'en',
};
```

**New Code**:
```typescript
import { createConfigurationBuilder } from './builders/ConfigurationBuilder';

const config = createConfigurationBuilder()
  .asSimpleMode('openai', 'gpt-4', 'sk-...')
  .withContentType('meeting')
  .withLanguage('en')
  .build(); // Validates and builds

// Or for advanced mode
const advancedConfig = createConfigurationBuilder()
  .asAdvancedMode('anthropic/claude-3.5-sonnet', 'sk-...', 'or-...')
  .withContentType('lecture')
  .addContextFile(pdfFile)
  .build();
```

**Benefits**:
- Fluent API
- Built-in validation
- Easier to read and maintain

---

### Step 3: Update Progress Tracking (Observer Pattern)

**Current Code** (Callback props):
```typescript
function handleProgress(step: string, progress: number) {
  setProcessingData({ step, progress });
}

await processAudio(file, handleProgress);
```

**New Code** (Event listeners):
```typescript
import { processingEventEmitter } from './patterns/ProcessingEventEmitter';

// Subscribe once in useEffect
useEffect(() => {
  const unsubscribe = processingEventEmitter.on('progress', ({ step, progress }) => {
    setProcessingData({ step, progress });
  });

  return unsubscribe; // Cleanup
}, []);

// In processing code, emit events
processingEventEmitter.start();
processingEventEmitter.changeStep('transcribing');
processingEventEmitter.updateProgress(50, 'Halfway there');
processingEventEmitter.complete(transcript, summary);
```

**Benefits**:
- Decoupled components
- Multiple listeners possible
- Easier to test
- Better separation of concerns

---

### Step 4: Add Undo/Redo (Command Pattern)

This is a new feature, so there's no "current code" to replace.

**Implementation**:
```typescript
import { useCommandHistory } from './hooks/useCommandHistory';
import { AddTrimRegionCommand } from './commands/AudioCommands';

function MyComponent() {
  const { execute, undo, redo, canUndo, canRedo } = useCommandHistory();

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
      <button onClick={handleAddRegion}>Add Region</button>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </>
  );
}
```

**See**: `src/components/audio/WaveformEditorWithUndo.tsx` for complete example

---

### Step 5: Update File Processing (Adapter Pattern)

**Current Code**:
```typescript
// Direct file upload, hope format is correct
setAudioFile({ name: file.name, blob: file, file });
```

**New Code**:
```typescript
import { audioAdapterRegistry } from './adapters/AudioAdapterRegistry';

try {
  // Automatically validates and converts if needed
  const processedBlob = await audioAdapterRegistry.processFile(file);

  setAudioFile({
    name: file.name,
    blob: processedBlob,
    file: file,
  });
} catch (error) {
  console.error('Unsupported format:', error);
  setSnackbarMessage(error.message);
}

// Check format before processing
if (!audioAdapterRegistry.isSupported(file)) {
  alert('Unsupported format');
}
```

**Benefits**:
- Format validation
- Automatic conversion
- Better error messages
- Easy to add new formats

---

### Step 6: Update State Management (State Machine Pattern)

**Current Code** (Manual state management):
```typescript
const [appState, setAppState] = useState<AppState>('initial');

// Direct state changes (no validation)
setAppState('recording');
setAppState('audio');
```

**New Code** (State machine):
```typescript
import { appStateMachine } from './state/AppStateMachine';

const [appState, setAppState] = useState(appStateMachine.getState());

// Subscribe to state changes
useEffect(() => {
  const unsubscribe = appStateMachine.on('state-change', ({ to }) => {
    setAppState(to);
  });

  const unsubscribeError = appStateMachine.on('transition-error', ({ error }) => {
    console.error('Invalid transition:', error);
  });

  return () => {
    unsubscribe();
    unsubscribeError();
  };
}, []);

// Validated state transitions
try {
  await appStateMachine.transition('recording');
  await appStateMachine.transition('audio');
} catch (error) {
  // Invalid transition
  console.error(error);
}

// Check before transitioning
if (appStateMachine.canTransition('processing')) {
  await appStateMachine.transition('processing');
}
```

**Benefits**:
- Prevents invalid transitions
- Clear state flow
- Event-driven updates
- Easy to debug

---

## Complete Migration Example

### Before: `src/App.tsx`
```typescript
function App() {
  const [appState, setAppState] = useState<AppState>('initial');

  const handleProcess = async (config: AIConfiguration) => {
    setAppState('processing');

    const { transcript } = await transcribeAudio(audioBlob, config.openaiKey);
    const { summary } = await summarizeTranscript(transcript, config.contentType, config.provider, config.apiKey);

    setAppState('results');
  };
}
```

### After: `src/App.refactored.tsx`
```typescript
import { appStateMachine } from './state/AppStateMachine';
import { processingEventEmitter } from './patterns/ProcessingEventEmitter';
import { audioRepository } from './repositories/AudioRepository';
import { createConfigurationBuilder } from './builders/ConfigurationBuilder';
import { audioAdapterRegistry } from './adapters/AudioAdapterRegistry';

function App() {
  const [appState, setAppState] = useState(appStateMachine.getState());

  // Subscribe to state machine
  useEffect(() => {
    const unsubscribe = appStateMachine.on('state-change', ({ to }) => {
      setAppState(to);
    });
    return unsubscribe;
  }, []);

  // Subscribe to processing events
  useEffect(() => {
    const unsubProgress = processingEventEmitter.on('progress', ({ step, progress }) => {
      setProcessingData({ step, progress });
    });

    const unsubComplete = processingEventEmitter.on('complete', ({ transcript, summary }) => {
      setResult({ transcript, summary, chatHistory: [], configuration: config });
      appStateMachine.transition('results');
    });

    return () => {
      unsubProgress();
      unsubComplete();
    };
  }, []);

  const handleProcess = async (config: AIConfiguration) => {
    await appStateMachine.transition('processing');
    processingEventEmitter.start();

    try {
      const { transcript } = await audioRepository.transcribe({
        audioBlob,
        apiKey: config.openaiKey,
      });

      processingEventEmitter.changeStep('summarizing');

      const { summary } = await audioRepository.summarize({
        transcript,
        contentType: config.contentType,
        provider: config.provider,
        apiKey: config.apiKey,
      });

      processingEventEmitter.complete(transcript, summary);
    } catch (error) {
      processingEventEmitter.error(error as Error, false);
      await appStateMachine.transition('configuration');
    }
  };
}
```

---

## Gradual Migration Strategy

You don't have to migrate everything at once. Here's a recommended order:

### Phase 1: Foundation (Low Risk)
1. **Adapter Pattern**: Start using `audioAdapterRegistry` for file uploads
2. **Repository Pattern**: Replace direct API calls one by one

### Phase 2: Architecture (Medium Risk)
3. **Builder Pattern**: Use for new configurations, keep old ones working
4. **Observer Pattern**: Add event listeners alongside existing callbacks

### Phase 3: Advanced Features (High Value)
5. **State Machine**: Migrate state management (requires testing)
6. **Command Pattern**: Add undo/redo to audio editor

### Testing Strategy

For each pattern migration:
1. Keep old code in place initially
2. Add new pattern implementation
3. Test thoroughly
4. Gradually replace old code
5. Remove old code once stable

---

## Compatibility Notes

### Backward Compatibility

All patterns are designed to work alongside existing code:
- `audioRepository` wraps the same API endpoints
- State machine can coexist with manual `setState`
- Event emitters can supplement callback props
- Adapters are optional for file processing

### Breaking Changes

None! All new patterns are additive. You can migrate incrementally.

### TypeScript Support

All patterns have full TypeScript support:
- Generic types for event emitters
- Strong typing for repositories
- Builder pattern validates at compile time
- Command interfaces ensure type safety

---

## Troubleshooting

### "State transition failed"
- Check that the transition is valid in `AppStateMachine`
- Use `appStateMachine.getValidTransitions()` to see allowed transitions
- Verify guard conditions if defined

### "Configuration validation failed"
- Check required fields (provider, model, openaiKey, etc.)
- Use try-catch around `builder.build()`
- Review error message for missing fields

### "Unsupported audio format"
- Check if format is in `audioAdapterRegistry.getSupportedTypes()`
- Add custom adapter if needed
- Fall back to FFmpeg processing for unknown formats

### Event listeners not firing
- Ensure you subscribed before emitting
- Check event name spelling
- Return cleanup function in `useEffect`

---

## Benefits Summary

| Pattern | Benefit | Impact |
|---------|---------|--------|
| Repository | Centralized API logic | High |
| Builder | Type-safe config creation | Medium |
| Observer | Decoupled event handling | High |
| Command | Undo/redo functionality | Medium |
| Adapter | Format flexibility | Medium |
| State Machine | Validated transitions | High |

---

## Next Steps

1. Review `docs/DESIGN_PATTERNS.md` for detailed documentation
2. Study `src/App.refactored.tsx` for complete example
3. Try `src/components/audio/WaveformEditorWithUndo.tsx` for undo/redo
4. Start with Phase 1 migration (Adapter + Repository)
5. Test thoroughly before moving to Phase 2

For questions or issues, refer to the pattern documentation or create an issue in the repository.
