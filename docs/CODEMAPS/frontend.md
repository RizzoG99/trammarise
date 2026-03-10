<!-- Generated: 2026-02-26 | Files scanned: 120+ | Token estimate: ~700 -->

# Frontend Architecture

## Route Tree

```
/ (WelcomePage — public)
/onboarding        → OnboardingPage [gate: needsOnboarding]
/pricing           → PricingPage
  ── AppLayout (NavigationSidebar + header) ──
  /                → UploadRecordPage
  /audio/:id       → AudioEditingPage
  /configure/:id   → ConfigurationPlaceholder
  /processing/:id  → ProcessingPage
  /results/:id     → ResultsPage
  /history         → HistoryPage
  /setup-api-key   → ApiKeySetupPage
  /account         → AccountBillingPage
  /docs            → DocsPage
  /preview         → PreviewPage [DEV only]
  /debug/pdf       → PdfPreviewPage [DEV only]
```

## Feature Modules (src/features/)

```
upload/
  UploadRecordTabs.tsx     — responsive tab/grid toggle (upload|record)
  UploadPanel.tsx          — drag-drop file upload
  RecordPanel.tsx          — MediaRecorder with waveform
  CollapsibleConfigPanel   — inline config for upload flow
  SplitScreenLayout        — desktop two-column layout

configuration/
  ContentTypeSelector      — meeting/lecture/interview/podcast/etc.
  ProcessingModeSelector   — standard vs quality mode
  LanguageSelector         — 50+ languages + auto-detect
  NoiseProfileSelector     — acoustic environment
  SpeakerDiarizationToggle — speaker identification

processing/
  ProgressCircle           — animated progress ring
  StepChecklist            — transcribe → summarize steps
  TranscriptionErrorDialog — error recovery dialog
  SplitCardLayout          — two-column processing layout

results/
  ResultsLayout.tsx        — main results container
  SummaryPanel.tsx         — AI summary with sections
  TranscriptTabBar.tsx     — tab: full / speakers / searchable
  SearchableTranscript     — text search + highlight
  SpeakerTranscriptView    — diarized speaker segments
  AudioPlayerBar.tsx       — sticky audio player with sync
  ChatSidePanel.tsx        — slide-in AI chat
  ExportPDFDialog.tsx      — PDF export with template picker
  pdf/ResultPdfDocument    — @react-pdf/renderer document

history/
  HistoryDashboard         — session list + filters
  HistoryCard              — single session card
  HistoryFilters           — date/type/search filters
  DeleteConfirmModal       — confirm delete dialog

chat/
  ChatModal.tsx            — floating chat overlay
  SuggestionChips          — quick prompt chips
  TokenUsageMeter          — token count display

user-menu/
  CustomUserMenu           — avatar + dropdown
  ManageAccountModal       — tabs: profile/api-keys/usage
  TierBadge                — subscription tier indicator
```

## Component Library (src/lib/components/)

```
ui/
  Button, GlassCard, Modal, Input, Select, Alert, Badge
  LoadingSpinner, PageLoader, AILoadingOrb
  NavigationSidebar, StepIndicator, Tooltip, PricingCard
  Heading, Text, Snackbar, ProgressBar
  ThemeToggle, EmptyState, FileSizeWarningModal, RecordingButtons
form/
  RadioCard, SelectCard, ToggleSwitch
audio/
  WaveformPlayer, WaveformEditorWithUndo, PlaybackControls
chat/
  ChatInterface
```

## Context Providers (src/context/)

```
ClerkProvider            → auth state
ThemeContext             → dark/light mode + CSS vars
SubscriptionContext      → tier, usage limits
OnboardingContext        → needsOnboarding gate
HeaderContext            → dynamic page title
ApiKeyContext            → session-scoped API keys
```

## Key Hooks (src/hooks/)

```
useAudioRecorder         — MediaRecorder + blob capture
useAudioProcessing       — pipeline orchestration
useWaveSurfer            — WaveSurfer.js wrapper
useCommandHistory        — undo/redo (Command pattern)
useFeatureGate           — tier-based feature gating
useStorageMonitor        — IndexedDB quota tracking
useTheme, useHeader, useRouteState
```

## Design System

- Tailwind 4 with CSS variables (`--color-primary`, `--color-border`, etc.)
- Dark mode via `ThemeContext` (class-based)
- i18n: `react-i18next`, 4 locales (en/it/de/es) in `src/locales/`
- Icons: `lucide-react`
