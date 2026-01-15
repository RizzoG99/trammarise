# i18n Translation Coverage TODO

This document tracks the translation coverage for the Trammarise application. The initial i18n implementation (PR #19) provides translations for core navigation and processing flows, but several components still need translation coverage.

## ✅ Completed (Phase 1)

- **Navigation**: Header, language switcher, navigation links
- **Home/Upload Page**: Upload panel, recording panel, configuration options
- **Processing Page**: Progress indicators, step checklist, status messages
- **Common Elements**: Buttons, loading states, error messages

**Coverage**: ~40% (9/23 major components)

## 🔄 Pending Translation

### High Priority

#### Results Page Components

- [ ] `ResultsPage.tsx` - Main results page layout
- [ ] `SearchableTranscript.tsx` - Transcript display and search
- [ ] `CollapsibleSection.tsx` - Summary sections
- [ ] Action buttons (Copy, TTS, PDF, Share)
- [ ] Chat interface messages

**Strings to translate**:

- "Transcript"
- "Summary"
- "Search transcript..."
- "No matches found"
- "Copy to clipboard"
- "Read aloud"
- "Export as PDF"
- "Share"
- Chat placeholder text

#### Audio Editing Page

- [ ] `AudioEditingPage.tsx` - Main editing page
- [ ] `WaveformPlayer.tsx` - Waveform controls
- [ ] `PlaybackControls.tsx` - Playback buttons
- [ ] Trim region controls

**Strings to translate**:

- "Audio Editor"
- "Trim Audio"
- "Playback Speed"
- "Volume"
- "Play / Pause"
- "Undo / Redo"
- "Reset"
- "Continue to Processing"

### Medium Priority

#### Configuration Selectors

- [ ] `LanguageSelector.tsx` - All 50+ language names
- [ ] `ContentTypeSelector.tsx` - Content type descriptions
- [ ] `ProcessingModeSelector.tsx` - Mode descriptions

**Strings to translate**:

- All language names (internationalized)
- Content type labels: "Meeting", "Lecture", "Interview", "Podcast", etc.
- Processing mode descriptions

#### Error Messages & Modals

- [ ] `FileSizeWarningModal.tsx` - Warning messages
- [ ] `ErrorBoundary.tsx` - Error fallback messages
- [ ] API error messages

### Low Priority

#### Feature Components

- [ ] `ContextUploadArea.tsx` - Context file upload
- [ ] PDF generation messages
- [ ] TTS feedback messages

## 📋 Translation Key Structure

Current structure follows this pattern:

```
{
  "common": { /* shared strings */ },
  "nav": { /* navigation */ },
  "header": { /* app header */ },
  "home": { /* upload/record page */ },
  "processing": { /* processing page */ },
  "languages": { /* language names */ }
}
```

**Proposed additions**:

```
{
  "audio": { /* audio editing page */ },
  "results": { /* results page */ },
  "chat": { /* chat interface */ },
  "errors": { /* error messages */ },
  "config": { /* configuration selectors */ }
}
```

## 🎯 Implementation Plan

### Phase 2: Core Features (Next PR)

- Audio editing page translation
- Results page translation
- Chat interface translation
- ~30% additional coverage

### Phase 3: Configuration & Polish

- Language selector translation (all 50+ languages)
- Content type descriptions
- Error messages
- ~20% additional coverage

### Phase 4: Edge Cases & Refinement

- Modal dialogs
- Tooltips
- Advanced features
- ~10% additional coverage

## 🛠️ How to Add Translations

1. **Identify strings**: Find hardcoded English strings in component
2. **Add to translation files**: Update all 4 language files (`en`, `it`, `es`, `de`)
3. **Replace in component**: Use `t('key')` instead of hardcoded string
4. **Update tests**: Use translation keys in test expectations
5. **Verify**: Check all languages display correctly

**Example**:

```typescript
// Before
<Button>Cancel</Button>

// After
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Button>{t('common.cancel')}</Button>

// In translation.json
{
  "common": {
    "cancel": "Cancel"  // en
    "cancel": "Annulla" // it
  }
}
```

## 📊 Current Statistics

- **Total Components**: 23 major components
- **Translated**: 9 components (39%)
- **Pending**: 14 components (61%)
- **Languages Supported**: 4 (EN, IT, ES, DE)
- **Translation Keys**: ~50 keys (target: ~150)

## 🔗 Related Files

- Translation files: `src/locales/{en,it,es,de}/translation.json`
- i18n config: `src/i18n.ts`
- Type definitions: `src/i18n.d.ts`
- Language switcher: `src/features/i18n/components/LanguageSwitcher.tsx`

---

**Created**: 2026-01-15
**Last Updated**: 2026-01-15
**Status**: Phase 1 Complete, Phase 2 Planned
