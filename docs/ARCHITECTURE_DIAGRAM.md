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

## Audio Storage Architecture

### Private Bucket Access Pattern

```mermaid
sequenceDiagram
    participant User
    participant WaveSurfer as WaveSurfer.js
    participant API as /api/audio/[sessionId]
    participant Auth as Clerk Auth
    participant DB as Supabase DB
    participant Storage as Private Bucket

    User->>WaveSurfer: Play audio
    WaveSurfer->>API: GET /api/audio/:sessionId<br/>(Authorization: Bearer token)

    API->>Auth: Verify JWT
    Auth-->>API: userId

    API->>DB: SELECT session WHERE id = :sessionId

    alt User owns session
        DB-->>API: session found, user_id matches
        API->>Storage: Download from private bucket
        Storage-->>API: Audio stream
        API-->>WaveSurfer: Stream audio bytes<br/>(Content-Type: audio/*)
        WaveSurfer-->>User: Audio plays
    else User doesn't own session
        DB-->>API: session.user_id ≠ userId
        API-->>WaveSurfer: 403 Forbidden
        WaveSurfer-->>User: Error: Access denied
    end

    Note over Storage: Bucket is PRIVATE<br/>Direct URLs don't work
```

### Hybrid Storage Strategy

```mermaid
flowchart LR
    subgraph Free [Free/BYOK Users - $0/month]
        F1[Upload Audio] --> F2[IndexedDB]
        F2 --> F3[Local Access Only]
        F3 --> F4[❌ No cloud sync<br/>✅ Full privacy]
        style F1 fill:#e3f2fd
        style F2 fill:#e3f2fd
        style F3 fill:#e3f2fd
        style F4 fill:#e3f2fd
    end

    subgraph Pro [Pro Users - ~$0.02/100 users]
        P1[Upload Audio] --> P2[IndexedDB]
        P1 --> P3[Supabase: Metadata Only]
        P2 --> P4[Local Playback]
        P3 --> P5[Cross-Device Results]
        P5 --> P6[⚠️ Can't re-process<br/>✅ View results anywhere]
        style P1 fill:#fff3e0
        style P2 fill:#fff3e0
        style P3 fill:#fff3e0
        style P4 fill:#fff3e0
        style P5 fill:#fff3e0
        style P6 fill:#fff3e0
    end

    subgraph Team [Team Users - ~$55.50/100 users]
        E1[Upload Audio] --> E2[IndexedDB]
        E1 --> E3[Supabase: Full Audio]
        E2 --> E4[Local Playback]
        E3 --> E5[Full Cross-Device Sync]
        E5 --> E6[✅ Re-process anywhere<br/>✅ Team sharing ready]
        style E1 fill:#f3e5f5
        style E2 fill:#f3e5f5
        style E3 fill:#f3e5f5
        style E4 fill:#f3e5f5
        style E5 fill:#f3e5f5
        style E6 fill:#f3e5f5
    end
```

### Storage Decision Flow

```mermaid
flowchart TD
    Start([User clicks Process Audio]) --> SetLoading[Show spinner: Processing...]
    SetLoading --> SaveLocal[Save to IndexedDB]
    SaveLocal --> CheckAuth{User<br/>Authenticated?}

    CheckAuth -->|No| LocalOnly[Skip cloud upload]
    CheckAuth -->|Yes| CheckTier{Subscription<br/>Tier?}

    CheckTier -->|Free| LocalOnly
    CheckTier -->|Pro| MetaOnly[Upload metadata only<br/>~10KB]
    CheckTier -->|Team| FullUpload[Upload full audio<br/>~50MB avg]

    LocalOnly --> LogLocal[Log: Local-only mode]
    MetaOnly --> LogPro[Log: Pro mode - metadata only]
    FullUpload --> LogTeam[Log: Team mode - full backup]

    LogLocal --> Success[Navigate to audio page]
    LogPro --> Success
    LogTeam --> Success

    SaveLocal -->|Error| ShowError[Show error message:<br/>Failed to save session]
    ShowError --> HideLoading[Hide spinner]

    Success --> HideLoading

    style Start fill:#90caf9
    style Success fill:#a5d6a7
    style ShowError fill:#ef9a9a
    style LocalOnly fill:#e3f2fd
    style MetaOnly fill:#fff3e0
    style FullUpload fill:#f3e5f5
```

### Cost Optimization Model

```mermaid
graph TB
    subgraph Pricing [Supabase Storage Pricing]
        P1[Storage: $0.021/GB/month]
        P2[Bandwidth: $0.09/GB egress]
    end

    subgraph Sessions [Per 100 Active Users/Month]
        S1[Avg session: 50MB audio]
        S2[Avg metadata: 10KB]
    end

    Pricing --> Free[Free Tier<br/>$0/month]
    Pricing --> Pro[Pro Tier<br/>$0.02/month]
    Pricing --> Team[Team Tier<br/>$55.50/month]

    Free --> F1[No cloud storage<br/>100% cost savings]
    Pro --> P3[Metadata only<br/>99% cost savings]
    Team --> T1[Full audio backup<br/>Premium features]

    style Free fill:#e3f2fd
    style Pro fill:#fff3e0
    style Team fill:#f3e5f5
    style F1 fill:#c8e6c9
    style P3 fill:#fff9c4
    style T1 fill:#f8bbd0
```

### Security Layers

```mermaid
flowchart TD
    Request[User Request] --> Layer1{Layer 1:<br/>Authentication}
    Layer1 -->|No JWT| Reject1[401 Unauthorized]
    Layer1 -->|Valid JWT| Layer2{Layer 2:<br/>Ownership Check}

    Layer2 -->|session.user_id ≠ userId| Reject2[403 Forbidden]
    Layer2 -->|Owns session| Layer3{Layer 3:<br/>RLS Policies}

    Layer3 -->|Policy denies| Reject3[403 Forbidden]
    Layer3 -->|Policy allows| Layer4{Layer 4:<br/>File Validation}

    Layer4 -->|Wrong MIME type| Reject4[400 Bad Request]
    Layer4 -->|File too large| Reject5[413 Payload Too Large]
    Layer4 -->|Valid file| Grant[✅ Stream audio]

    style Layer1 fill:#ffeb3b
    style Layer2 fill:#ffc107
    style Layer3 fill:#ff9800
    style Layer4 fill:#ff5722
    style Grant fill:#4caf50
    style Reject1 fill:#f44336
    style Reject2 fill:#f44336
    style Reject3 fill:#f44336
    style Reject4 fill:#f44336
    style Reject5 fill:#f44336
```

---

## Summary

All patterns work together to create a robust, maintainable architecture:

1. **State Machine** - Controls application flow
2. **Observer** - Communicates state changes
3. **Builder** - Creates valid configurations
4. **Repository** - Handles all API calls
5. **Adapter** - Processes different file formats
6. **Command** - Enables undo/redo
7. **Storage Strategy** - Optimizes costs while ensuring privacy

Each pattern has a specific responsibility and they interact seamlessly to provide a great developer experience.
