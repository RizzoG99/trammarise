# Component Migration Plan - Option A: Complete Migration

**Date Started**: 2026-01-08
**Date Completed**: 2026-01-11
**Status**: ✅ COMPLETE
**Goal**: Establish `src/lib/components/` as the single source of truth for all reusable components

---

## Migration Strategy

### Phase 1: Preparation ✅
- [x] Audit all component locations
- [x] Identify all import statements
- [x] Create migration plan document
- [x] Create comprehensive Storybook stories for legacy components

### Phase 2: Move Unique Legacy Components to Design System
Move components that only exist in legacy to `src/lib/components/ui/`:

- [ ] **GlassCard** (20+ imports)
  - Move `src/components/ui/GlassCard.tsx` → `src/lib/components/ui/GlassCard/GlassCard.tsx`
  - Move `src/lib/components/ui/GlassCard/GlassCard.stories.tsx` (already exists)
  - Create `src/lib/components/ui/GlassCard/index.ts` export
  - Write tests: `src/lib/components/ui/GlassCard/GlassCard.test.tsx`

- [ ] **Heading** (15+ imports)
  - Move `src/components/ui/Heading.tsx` → `src/lib/components/ui/Heading/Heading.tsx`
  - Move `src/lib/components/ui/Heading/Heading.stories.tsx` (already exists)
  - Create `src/lib/components/ui/Heading/index.ts` export
  - Write tests: `src/lib/components/ui/Heading/Heading.test.tsx`

- [ ] **Text** (20+ imports)
  - Move `src/components/ui/Text.tsx` → `src/lib/components/ui/Text/Text.tsx`
  - Move `src/lib/components/ui/Text/Text.stories.tsx` (already exists)
  - Create `src/lib/components/ui/Text/index.ts` export
  - Write tests: `src/lib/components/ui/Text/Text.test.tsx`

- [ ] **RecordingButtons** (1 import)
  - Move `src/components/ui/RecordingButtons.tsx` → `src/lib/components/ui/RecordingButtons/RecordingButtons.tsx`
  - Create index.ts, tests, stories

- [ ] **AILoadingOrb** (1 import)
  - Move `src/components/ui/AILoadingOrb.tsx` + `.css` → `src/lib/components/ui/AILoadingOrb/`
  - Create index.ts, tests, stories

- [ ] **Icon** (unknown imports)
  - Move `src/components/ui/Icon.tsx` → `src/lib/components/ui/Icon/Icon.tsx`
  - Create index.ts, tests, stories

- [ ] **FileSizeWarningModal** (unknown imports)
  - Move `src/components/ui/FileSizeWarningModal.tsx` → `src/lib/components/ui/FileSizeWarningModal/`
  - Create index.ts, tests, stories

### Phase 3: Consolidate Duplicated Components
For each of the 9 duplicated components, keep the NEW version (better tests/docs):

- [ ] **Button** (6 imports from legacy)
  - Delete `src/components/ui/Button.tsx`
  - Keep `src/lib/components/ui/Button/` (has tests + stories)

- [ ] **Input** (0 imports found - safe to delete legacy)
  - Delete `src/components/ui/Input.tsx`
  - Keep `src/lib/components/ui/Input/` (has tests + stories)

- [ ] **Modal** (imports from legacy)
  - Delete `src/components/ui/Modal.tsx`
  - Keep `src/lib/components/ui/Modal/` (has tests + stories)

- [ ] **LoadingSpinner** (imports from legacy)
  - Delete `src/components/ui/LoadingSpinner.tsx`
  - Keep `src/lib/components/ui/LoadingSpinner/` (has tests + stories)

- [ ] **Snackbar** (imports from legacy)
  - Delete `src/components/ui/Snackbar.tsx`
  - Keep `src/lib/components/ui/Snackbar/` (has tests + stories)

- [ ] **ThemeToggle** (imports from legacy)
  - Delete `src/components/ui/ThemeToggle.tsx`
  - Keep `src/lib/components/ui/ThemeToggle/` (has tests + stories)

- [ ] **ToggleSwitch** (imports from legacy)
  - Delete `src/components/ui/ToggleSwitch.tsx`
  - Keep `src/lib/components/form/ToggleSwitch/` (has tests + stories)

- [ ] **RadioCard** (imports from legacy)
  - Delete `src/components/ui/RadioCard.tsx`
  - Keep `src/lib/components/form/RadioCard/` (has tests + stories)

- [ ] **SelectCard** (imports from legacy)
  - Delete `src/components/ui/SelectCard.tsx`
  - Keep `src/lib/components/form/SelectCard/` (has tests + stories)

### Phase 4: Migrate Audio Components
Move audio components to `src/lib/components/audio/`:

- [ ] **PlaybackControls**
  - Move `src/components/audio/PlaybackControls.tsx` → `src/lib/components/audio/PlaybackControls/`
  - Create index.ts, tests, stories

- [ ] **WaveformPlayer**
  - Move `src/components/audio/WaveformPlayer.tsx` → `src/lib/components/audio/WaveformPlayer/`
  - Create index.ts, tests, stories

- [ ] **WaveformEditorWithUndo**
  - Move `src/components/audio/WaveformEditorWithUndo.tsx` → `src/lib/components/audio/WaveformEditorWithUndo/`
  - Create index.ts, tests, stories

### Phase 5: Migrate Chat Components
Move chat components to `src/lib/components/chat/`:

- [ ] **ChatInterface**
  - Move `src/components/results/ChatInterface.tsx` → `src/lib/components/chat/ChatInterface/`
  - Create index.ts, tests, stories

- [ ] **Decision**: Should feature-specific chat components stay in `src/features/chat/`?
  - ChatModal (feature-specific, consider keeping in features)
  - TokenUsageMeter (feature-specific, consider keeping in features)

### Phase 6: Update All Imports
Update import statements across the entire codebase:

**Pattern Changes**:
```typescript
// OLD (legacy)
import { Button } from '../../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';

// NEW (design system)
import { Button, GlassCard } from '@/lib';
// OR for specific imports:
import { Button } from '@/lib/components/ui/Button';
```

**Files to Update** (preliminary list):
- [ ] `src/App.refactored.tsx` (8 imports)
- [ ] `src/app/App.tsx` (3 imports)
- [ ] `src/app/AppLayout.tsx` (1 import)
- [ ] `src/app/routes/AudioEditingPage.tsx` (3 imports)
- [ ] `src/app/routes/ProcessingPage.tsx` (3 imports)
- [ ] `src/app/routes/ResultsPage.tsx` (2 imports)
- [ ] `src/app/routes/UploadRecordPage.tsx` (3 imports)
- [ ] `src/features/audio-editing/components/DualActionButtons.tsx` (1 import)
- [ ] `src/features/audio-editing/components/UndoRedoToolbar.tsx` (3 imports)
- [ ] `src/features/configuration/components/LanguageSelector.tsx` (1 import)
- [ ] `src/features/configuration/components/ContentTypeSelector.tsx` (1 import)
- [ ] `src/features/configuration/components/CostTransparencyCard.tsx` (2 imports)
- [ ] `src/features/chat/components/TokenUsageMeter.tsx` (1 import)
- [ ] `src/features/chat/components/ChatModal.tsx` (4 imports)
- [ ] `src/features/processing/components/ProgressCircle.tsx` (3 imports)
- [ ] `src/features/processing/components/StepChecklist.tsx` (3 imports)
- [ ] `src/features/results/components/StickyAudioPlayer.tsx` (2 imports)
- [ ] `src/features/results/components/SearchableTranscript.tsx` (3 imports)
- [ ] `src/features/upload/components/FilePreview.tsx` (1 import)
- [ ] `src/features/upload/components/RecordPanel.tsx` (3 imports)
- [ ] `src/features/upload/components/CollapsibleConfigPanel.tsx` (2 imports)
- [ ] `src/features/upload/components/UploadPanel.tsx` (3 imports)
- [ ] `src/features/upload/components/ContextUploadArea.tsx` (1 import)
- [ ] `src/pages/PreviewPage.tsx` (already using `@/lib`)

**Total Files to Update**: ~24 files

### Phase 7: Update Exports in `src/lib/components/index.ts`

- [ ] Add GlassCard, Heading, Text exports
- [ ] Add RecordingButtons, AILoadingOrb, Icon exports
- [ ] Uncomment and add audio component exports
- [ ] Uncomment and add chat component exports

### Phase 8: Clean Up Legacy Folders

- [ ] Delete `src/components/ui/` folder entirely
- [ ] Delete `src/components/audio/` folder
- [ ] Delete `src/components/results/ChatInterface.tsx`
- [ ] Verify no broken imports remain

### Phase 9: Testing & Validation

- [ ] Run `npm run lint` - ensure no errors
- [ ] Run `npm test` - ensure all tests pass
- [ ] Run `npm run build` - ensure production build succeeds
- [ ] Run `npm run build-storybook` - ensure Storybook builds
- [ ] Manual smoke test: Run dev server and test key flows

### Phase 10: Documentation Updates

- [ ] Update `CLAUDE.md` with new component structure
- [ ] Update `docs/UI_COMPONENTS_ANALYSIS.md` with migration results
- [ ] Update `docs/COMPONENT_MIGRATION_STATUS.md` - mark as completed
- [ ] Create migration completion report

---

## Import Path Standardization

After migration, all imports will use the centralized `@/lib` export:

```typescript
// ✅ CORRECT: Use centralized exports
import { 
  Button, 
  Input, 
  Modal, 
  GlassCard, 
  Heading, 
  Text,
  ToggleSwitch,
  RadioCard,
  SelectCard
} from '@/lib';

// ✅ ALSO CORRECT: Direct imports for tree-shaking
import { Button } from '@/lib/components/ui/Button';
import { GlassCard } from '@/lib/components/ui/GlassCard';

// ❌ INCORRECT: Legacy paths (will be deleted)
import { Button } from '../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
```

---

## Risk Mitigation

### Breaking Changes
- **Component API differences**: Audit props between legacy and new versions
- **Style differences**: Verify visual consistency after migration
- **Behavioral differences**: Test interactive components thoroughly

### Rollback Plan
- Create git branch: `feature/complete-component-migration`
- Commit frequently with descriptive messages
- Keep PR open until all tests pass
- Easy rollback if issues arise

### Testing Strategy
1. **Unit tests**: Existing 300+ tests should catch regressions
2. **Visual testing**: Use Storybook to verify all component states
3. **Manual testing**: Test critical user flows (upload, record, process, results)
4. **Build validation**: CI pipeline will catch build errors

---

## Success Criteria

✅ Migration complete when:
- [ ] All imports use `@/lib` paths
- [ ] `src/components/ui/` folder deleted
- [ ] `src/components/audio/` folder deleted (components moved)
- [ ] All tests pass (300+ tests)
- [ ] All builds succeed (app + Storybook)
- [ ] No legacy component imports remain
- [ ] Documentation updated

---

## Timeline Estimate

- **Phase 1 (Prep)**: ✅ Complete
- **Phase 2 (Move unique components)**: ~2-3 hours (7 components with tests)
- **Phase 3 (Consolidate duplicates)**: ~1 hour (delete + verify)
- **Phase 4 (Audio migration)**: ~1.5 hours (3 components with tests)
- **Phase 5 (Chat migration)**: ~1 hour (1-2 components)
- **Phase 6 (Update imports)**: ~2 hours (24 files)
- **Phase 7 (Update exports)**: ~15 minutes
- **Phase 8 (Cleanup)**: ~30 minutes
- **Phase 9 (Testing)**: ~1 hour
- **Phase 10 (Documentation)**: ~30 minutes

**Total Estimated Time**: ~10 hours of focused work

---

## Current Status

- ✅ **Phase 1**: Complete (Preparation - analysis, planning, initial stories)
- ✅ **Phase 2**: Complete (Moved unique legacy components to design system)
- ✅ **Phase 3**: Complete (Consolidated duplicated components)
- ✅ **Phase 4**: Complete (Migrated audio components)
- ✅ **Phase 5**: Complete (Migrated chat components)
- ✅ **Phase 6**: Complete (Updated all imports - already done in previous phases)
- ✅ **Phase 7**: Complete (Updated exports - already done in previous phases)
- ✅ **Phase 8**: Complete (Cleaned up legacy folders)
- ✅ **Phase 9**: Complete (Final validation and testing)
- ✅ **Phase 10**: Complete (Documentation updates)

**All 10 phases completed successfully!**

**Final Results**:
- 20+ components migrated to `src/lib/components/`
- 513 tests passing across 18 test files
- All legacy folders deleted (`src/components/ui/`, `src/components/audio/`)
- Centralized imports using `@/lib` alias
- Full Storybook coverage for all components
- Zero TypeScript errors, zero ESLint errors
- Production build successful

---

## Notes

- Keep `src/features/` components where they are (feature-specific, not reusable)
- `src/components/states/` components can stay (page-level state components)
- `src/components/layout/`, `src/components/preview/`, `src/components/forms/` - audit later
- Use git branch for safety: `git checkout -b feature/complete-component-migration`

---

## Decision Log

**2026-01-08**: User selected Option A - Complete Migration
**2026-01-08**: Migration plan created, beginning execution
