# Trammarise Architecture Diagrams

Visual representations of the design patterns and system architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Trammarise App                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐      ┌────────────────┐      ┌──────────────┐ │
│  │  UI Components │◄─────┤ State Machine  │─────►│ Event System │ │
│  └────────────────┘      └────────────────┘      └──────────────┘ │
│         │                        │                       │         │
│         │                        ▼                       │         │
│         │              ┌──────────────────┐              │         │
│         └─────────────►│  Configuration   │◄─────────────┘         │
│                        │     Builder      │                        │
│                        └──────────────────┘                        │
│                                 │                                  │
│                                 ▼                                  │
│                        ┌──────────────────┐                        │
│                        │   Repository     │                        │
│                        │   (API Layer)    │                        │
│                        └──────────────────┘                        │
│                                 │                                  │
│                                 ▼                                  │
│                        ┌──────────────────┐                        │
│                        │  Audio Adapters  │                        │
│                        │  (File Handlers) │                        │
│                        └──────────────────┘                        │
│                                 │                                  │
│                                 ▼                                  │
│                        ┌──────────────────┐                        │
│                        │  Command History │                        │
│                        │  (Undo/Redo)     │                        │
│                        └──────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Pattern Interactions

```
┌──────────────┐
│  User Action │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                    State Machine                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │ initial → recording → audio → config → results    │  │
│  └────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Emits: state-change event
       ▼
┌──────────────────────────────────────────────────────────┐
│                    Event Emitter                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │ on('state-change', (data) => updateUI())          │  │
│  └────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Updates UI based on state
       ▼
┌──────────────────────────────────────────────────────────┐
│                   UI Components                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ InitialState, RecordingState, AudioState, etc.    │  │
│  └────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ User configures AI settings
       ▼
┌──────────────────────────────────────────────────────────┐
│                Configuration Builder                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │ createConfigurationBuilder()                       │  │
│  │   .withProvider('openai')                          │  │
│  │   .withModel('gpt-4')                              │  │
│  │   .build() → validated config                      │  │
│  └────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Uses config for API calls
       ▼
┌──────────────────────────────────────────────────────────┐
│                     Repository                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ audioRepository.transcribe({ ... })                │  │
│  │ audioRepository.summarize({ ... })                 │  │
│  │ audioRepository.chat({ ... })                      │  │
│  └────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ Processes audio file
       ▼
┌──────────────────────────────────────────────────────────┐
│                  Audio Adapter Registry                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │ MP3 → MP3Adapter (priority: 100)                   │  │
│  │ WAV → WAVAdapter (priority: 90)                    │  │
│  │ WebM → WebMAdapter (priority: 80)                  │  │
│  │ Detects format → Validates → Converts if needed   │  │
│  └────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ User edits audio (trim, speed, volume)
       ▼
┌──────────────────────────────────────────────────────────┐
│                   Command Pattern                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │ execute(new AddTrimRegionCommand())                │  │
│  │ undo() → Reverses last command                     │  │
│  │ redo() → Re-applies undone command                 │  │
│  │ History: [cmd1, cmd2, cmd3, ...]                   │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## State Machine Transitions

```
                    ┌─────────────┐
                    │   initial   │ (File upload or record)
                    └──────┬──────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          │ Start Recording                 │ Upload File
          ▼                                 ▼
    ┌──────────┐                      ┌─────────┐
    │recording │──Stop Recording─────►│  audio  │
    └──────────┘                      └────┬────┘
          │                                │
          │ Cancel                         │ Process Audio
          └────────┐                       ▼
                   │              ┌─────────────────┐
                   │              │ configuration   │
                   │              └────┬────────────┘
                   │                   │
                   │                   │ Validate & Continue
                   │                   ▼
                   │              ┌──────────┐
                   │         ┌───┤processing│
                   │         │   └────┬─────┘
                   │         │        │
                   │    Error│        │ Complete
                   │         │        ▼
                   │         │   ┌─────────┐
                   │         └──►│ results │
                   │             └────┬────┘
                   │                  │
                   │                  │ Back to Audio / New Recording
                   │                  ▼
                   └──────────────►(initial)
```

## Repository Pattern Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       Component                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Calls repository method
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AudioRepository                               │
│                                                                 │
│  transcribe(config) ─┐                                          │
│  summarize(config)  ─┼─► fetchWithTimeout()                     │
│  chat(config)       ─┤         │                                │
│  generatePDF(config)─┤         │ Timeout wrapper                │
│  validateApiKey()   ─┘         ▼                                │
│                          fetch('/api/...')                      │
│                                │                                │
│                                ▼                                │
│                         Validate response                       │
│                                │                                │
│                                ▼                                │
│                         Return typed data                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Returns validated result
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Component                                 │
│            { transcript, summary, response }                    │
└─────────────────────────────────────────────────────────────────┘
```

## Builder Pattern Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Component                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Start building
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ConfigurationBuilder                               │
│                                                                 │
│  createConfigurationBuilder()                                   │
│    │                                                            │
│    ▼                                                            │
│  withProvider('openai') ───► Validate provider                  │
│    │                                                            │
│    ▼                                                            │
│  withModel('gpt-4') ───────► Validate model                     │
│    │                                                            │
│    ▼                                                            │
│  withOpenAIKey('sk-...') ─► Validate key format                 │
│    │                                                            │
│    ▼                                                            │
│  withContentType('meeting')                                     │
│    │                                                            │
│    ▼                                                            │
│  build() ──────────────────► Full validation                    │
│    │                              │                             │
│    │                              ▼                             │
│    │                     ┌────────────────┐                     │
│    │                     │ Valid config?  │                     │
│    │                     └────┬───────┬───┘                     │
│    │                          │       │                         │
│    │                     Yes  │       │ No                      │
│    ▼                          ▼       ▼                         │
│  AIConfiguration    Return config   Throw error                │
└─────────────────────────────────────────────────────────────────┘
```

## Observer Pattern Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Event Emitter                                │
│                                                                 │
│  listeners: Map<event, Set<callback>>                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           │ on()            │ emit()          │ off()
           ▼                 ▼                 ▼
    ┌───────────┐     ┌───────────┐     ┌──────────┐
    │ Subscribe │     │  Notify   │     │Unsubscribe│
    │           │     │           │     │           │
    │ listener1 │     │ listener1 │     │ listener1 │
    │ listener2 │     │ listener2 │     │           │
    │ listener3 │     │ listener3 │     │           │
    └───────────┘     └───────────┘     └──────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ProcessingEventEmitter Example                      │
│                                                                 │
│  Processing Code                     UI Component               │
│  ──────────────                      ────────────               │
│                                                                 │
│  start()                                                        │
│    │                                                            │
│    │ emit('progress')               on('progress')             │
│    ├────────────────────────────────►  setProgress()           │
│    │                                                            │
│  changeStep('transcribing')                                     │
│    │                                                            │
│    │ emit('step-change')            on('step-change')          │
│    ├────────────────────────────────►  setStep()               │
│    │                                                            │
│  updateProgress(50)                                             │
│    │                                                            │
│    │ emit('progress')               on('progress')             │
│    ├────────────────────────────────►  setProgress(50)         │
│    │                                                            │
│  complete()                                                     │
│    │                                                            │
│    │ emit('complete')               on('complete')             │
│    └────────────────────────────────►  showResults()           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Command Pattern Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Command History                              │
│                                                                 │
│  history: [cmd1, cmd2, cmd3, cmd4, cmd5]                        │
│  currentIndex: 4 ────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘

User Action: Add Trim Region
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  const cmd = new AddTrimRegionCommand(wavesurfer, 0, 10)        │
│  execute(cmd)                                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. cmd.execute() ─────► Add region to wavesurfer              │
│  2. Add cmd to history                                          │
│  3. currentIndex++                                              │
│                                                                 │
│  history: [cmd1, cmd2, cmd3, cmd4, cmd5, cmd6]                 │
│  currentIndex: 5 ────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘

User clicks "Undo"
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  undo()                                                         │
│    │                                                            │
│    ▼                                                            │
│  1. history[currentIndex].undo() ─► Remove region              │
│  2. currentIndex--                                              │
│                                                                 │
│  history: [cmd1, cmd2, cmd3, cmd4, cmd5, cmd6]                 │
│  currentIndex: 4 ────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘

User clicks "Redo"
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  redo()                                                         │
│    │                                                            │
│    ▼                                                            │
│  1. currentIndex++                                              │
│  2. history[currentIndex].execute() ─► Re-add region           │
│                                                                 │
│  history: [cmd1, cmd2, cmd3, cmd4, cmd5, cmd6]                 │
│  currentIndex: 5 ────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## Adapter Pattern Flow

```
                        File Upload
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              AudioAdapterRegistry.processFile()                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Find appropriate adapter
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Check adapters by priority:                                    │
│                                                                 │
│  Priority 100: MP3Adapter    ─► canHandle(file)?               │
│                                      │                          │
│                                      ├─ Yes → Use MP3Adapter    │
│                                      └─ No  → Next adapter      │
│                                                                 │
│  Priority 90:  WAVAdapter    ─► canHandle(file)?               │
│  Priority 80:  WebMAdapter   ─► canHandle(file)?               │
│  Priority 70:  M4AAdapter    ─► canHandle(file)?               │
│  Priority 60:  OGGAdapter    ─► canHandle(file)?               │
│  Priority 50:  FLACAdapter   ─► canHandle(file)?               │
│  Priority -1:  GenericAdapter ─► Fallback                       │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Selected adapter
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Selected Adapter                             │
│                                                                 │
│  1. validate(file) ─────► Check file integrity                  │
│       │                                                         │
│       ▼                                                         │
│  2. convert(file) ──────► Convert if needed                     │
│       │                                                         │
│       ▼                                                         │
│  3. Return Blob ────────► Standardized audio blob              │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Validated & converted blob
                             ▼
                    Ready for processing
```

## Integration Example

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Workflow                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
                     1. Upload audio file
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │ AudioAdapterRegistry.processFile()     │ ◄── Adapter Pattern
         └────────────────┬───────────────────────┘
                          │
                          ▼
                  2. Configure AI settings
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │ ConfigurationBuilder.build()           │ ◄── Builder Pattern
         └────────────────┬───────────────────────┘
                          │
                          ▼
                  3. Click "Process"
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │ appStateMachine.transition()           │ ◄── State Machine
         └────────────────┬───────────────────────┘
                          │
                          ▼
                  4. Processing starts
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │ processingEventEmitter.emit()          │ ◄── Observer Pattern
         └────────────────┬───────────────────────┘
                          │
                          ▼
                  5. Transcribe audio
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │ audioRepository.transcribe()           │ ◄── Repository Pattern
         └────────────────┬───────────────────────┘
                          │
                          ▼
                  6. Summarize transcript
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │ audioRepository.summarize()            │ ◄── Repository Pattern
         └────────────────┬───────────────────────┘
                          │
                          ▼
                  7. Show results
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │ appStateMachine.transition('results')  │ ◄── State Machine
         └────────────────┬───────────────────────┘
                          │
                          ▼
                  8. Edit audio (trim)
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │ execute(AddTrimRegionCommand)          │ ◄── Command Pattern
         └────────────────┬───────────────────────┘
                          │
                          ▼
                  9. Undo/Redo available
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │ undo() / redo()                        │ ◄── Command Pattern
         └────────────────────────────────────────┘
```

## Data Flow

```
┌──────────┐
│ UI Layer │  (React Components)
└────┬─────┘
     │
     │ User interactions
     ▼
┌───────────────┐
│ Pattern Layer │  (State Machine, Commands, Events)
└────┬──────────┘
     │
     │ Validated actions
     ▼
┌──────────────┐
│ Logic Layer  │  (Repository, Builder, Adapters)
└────┬─────────┘
     │
     │ API calls
     ▼
┌───────────────┐
│ API Layer    │  (Vercel Serverless Functions)
└────┬──────────┘
     │
     │ External APIs
     ▼
┌───────────────┐
│ External     │  (OpenAI, OpenRouter, etc.)
└──────────────┘
```

## Summary

All patterns work together to create a robust, maintainable architecture:

1. **State Machine** - Controls application flow
2. **Observer** - Communicates state changes
3. **Builder** - Creates valid configurations
4. **Repository** - Handles all API calls
5. **Adapter** - Processes different file formats
6. **Command** - Enables undo/redo

Each pattern has a specific responsibility and they interact seamlessly to provide a great developer experience.
