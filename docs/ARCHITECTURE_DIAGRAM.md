# Trammarise Architecture Diagrams

Visual representations of the design patterns and system architecture.

## System Overview

```mermaid
graph TB
    subgraph App[Trammarise App]
        style App fill:#f9f9f9,stroke:#333,stroke-width:2px

        UI[UI Components]
        SM[State Machine]
        Events[Event System]
        Config[Configuration Builder]
        Repo[Repository / API Layer]
        Adapters[Audio Adapters]
        Command[Command History]

        UI <--> SM <--> Events
        SM --> Config
        Events --> Config
        Config --> Repo
        Repo --> Adapters
        Adapters --> Command
    end

    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    class UI,SM,Events,Config,Repo,Adapters,Command component;
```

## Pattern Interactions

```mermaid
sequenceDiagram
    participant User
    participant SM as State Machine
    participant Events as Event Emitter
    participant UI as UI Components
    participant Config as Config Builder
    participant Repo as Repository
    participant Adapter as Adapter Registry
    participant Command as Command Pattern

    User->>SM: Action (Start/Upload)
    SM->>Events: emit('state-change')
    Events->>UI: on('state-change') -> updateUI()

    User->>UI: Configure AI Settings
    UI->>Config: createConfigurationBuilder()
    Config-->>UI: Validated Config

    UI->>Repo: audioRepository.transcribe()
    Repo->>Adapter: processFile()
    Adapter-->>Repo: Processed Blob
    Repo-->>UI: Result (Transcript/Summary)

    User->>UI: Edit Audio (Trim)
    UI->>Command: execute(new AddTrimRegionCommand())
    Command-->>UI: Action Applied (Undo available)
```

## State Machine Transitions

```mermaid
stateDiagram-v2
    [*] --> initial

    initial --> recording: Start Recording
    initial --> audio: Upload File

    recording --> audio: Stop Recording
    recording --> initial: Cancel

    audio --> configuration: Process Audio
    audio --> initial: Reset/Delete

    configuration --> processing: Validate & Continue
    configuration --> audio: Back

    processing --> results: Complete
    processing --> configuration: Error

    results --> audio: Back to Audio
    results --> initial: New Session
```

## Repository Pattern Flow

```mermaid
flowchart TD
    Comp[Component] -->|Calls Method| Repo[AudioRepository]

    subgraph RepositoryOps [Repository Operations]
        direction TB
        Repo -->|transcribe| Fetch[fetchWithTimeout]
        Repo -->|summarize| Fetch
        Repo -->|chat| Fetch

        Fetch --> API[External API \n /api/...]
        API --> Val[Validate Response]
        Val --> Type[Return Typed Data]
    end

    Type -->|Returns Result| Comp
```

## Builder Pattern Flow

```mermaid
flowchart TD
    Start([Start Building]) --> Create[createConfigurationBuilder]
    Create --> Prov[withProvider]
    Prov -->|Validate| Mod[withModel]
    Mod -->|Validate| Key[withOpenAIKey]
    Key -->|Validate| Type[withContentType]
    Type --> Build{build}

    Build -->|Valid| Success([Return AIConfiguration])
    Build -->|Invalid| Error([Throw Error])
```

## Observer Pattern Flow

```mermaid
flowchart LR
    subgraph Emitter [Event Emitter]
        Listeners[Map: event -> Set/callback]
    end

    subgraph Components
        Sub[Subscribe: on]
        Pub[Publish: emit]
        Unsub[Unsubscribe: off]
    end

    Pub -->|Notify| Listeners
    Listeners -->|Trigger| Sub
```

## Command Pattern Flow (Undo/Redo)

```mermaid
flowchart TD
    User([User Action]) --> Create[Create Command\nnew AddTrimRegionCommand]
    Create --> Execute[execute]

    Execute --> Apply[Apply Change]
    Execute --> Push[Push to History]

    Push --> State{Current State}

    Undo([User Undo]) -->|Call undo| Pop[Pop/Move Index Back]
    Pop --> Reverse[Reverse Change]

    Redo([User Redo]) -->|Call redo| Fwd[Move Index Forward]
    Fwd --> Reapply[Re-apply Change]
```

## Adapter Pattern Flow

```mermaid
flowchart TD
    Upload([File Upload]) --> Registry[AudioAdapterRegistry.processFile]

    Registry --> Check{Check Priority Adapters}

    Check -->|Priority 100| MP3[MP3Adapter]
    Check -->|Priority 90| WAV[WAVAdapter]
    Check -->|Priority 80| WebM[WebMAdapter]
    Check -->|Priority...| Other[Other Adapters]

    MP3 -->|canHandle?| Valid{Valid?}
    WAV -->|canHandle?| Valid

    Valid -->|Yes| Selected[Selected Adapter]
    Valid -->|No| Next[Next Adapter]

    Selected --> Process[1. Validate\n2. Convert]
    Process --> Blob([Return Standardized Blob])
```

## Integration Example

```mermaid
job
    title Data Flow Integration

    section User Interaction
    Upload File: 1
    Configure AI: 2
    Click Process: 3
    Edit Audio: 8
    Undo/Redo: 9

    section Patterns
    Adapter Pattern: 1
    Builder Pattern: 2
    State Machine: 3, 7
    Observer Pattern: 4
    Repository Pattern: 5, 6
    Command Pattern: 8, 9

    section System
    Transcribe: 5
    Summarize: 6
    Show Results: 7
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
