# Phase 4: Legacy Component Analysis

**Date**: 2026-01-08
**Phase**: 4 of 10 (Option A Migration Plan)
**Status**: Analysis Complete - Ready for Migration

---

## Overview

Phase 4 focuses on migrating the remaining 4 legacy components from `src/components/ui/` to the design system in `src/lib/components/ui/`.

---

## Components to Migrate

### 1. RecordingButtons ⚡ HIGH PRIORITY

**Location**: `src/components/ui/RecordingButtons.tsx`
**Exports**: 3 components (RecordButton, PauseButton, StopButton)
**Imports**: 1 file

**Used By**:
- `src/features/upload/components/RecordPanel.tsx`

**Component Details**:
- **RecordButton**: Large circular button with pulse ring animation, primary action
- **PauseButton**: Gray circular button with pause/resume toggle
- **StopButton**: Red circular button with stop action

**Features**:
- Lucide icons (Mic, Pause, Play, Square)
- Hover effects with CSS variable colors
- Disabled states
- ARIA labels for accessibility
- Responsive sizing (larger when active)

**Migration Complexity**: Medium
- Need comprehensive tests for all 3 button states
- Storybook stories for all variants
- Preserve pulse ring animation
- Maintain hover/disabled states

---

### 2. AILoadingOrb 🎨 HIGH PRIORITY

**Location**:
- `src/components/ui/AILoadingOrb.tsx`
- `src/components/ui/AILoadingOrb.css`

**Imports**: 2 files

**Used By**:
- `src/components/states/ProcessingState.tsx`
- `src/pages/PreviewPage.tsx`

**Component Details**:
- Complex SVG-based animated orb
- Multi-layer blob animation with radial gradients
- Floating particles with independent animations
- Glow effects using SVG filters

**Features**:
- 3 animated gradient layers (purple-blue, pink-purple, cyan-blue)
- 4 floating particle effects
- Smooth morphing animations (2-5 second cycles)
- Dark mode support via CSS
- Accessibility: Respects `prefers-reduced-motion`
- Responsive sizing (default 120px)

**Migration Complexity**: High
- External CSS file needs to be preserved or converted to CSS Modules
- Complex SVG animations need testing
- Dark mode theming verification
- Accessibility testing critical

---

### 3. Icon ❓ LOW PRIORITY (POTENTIALLY UNUSED)

**Location**: `src/components/ui/Icon.tsx`
**Imports**: **0 files** ⚠️

**Used By**: None detected in search

**Component Details**:
- Simple wrapper for Lucide and Material icons
- Two variants: 'lucide' (default) and 'material'
- Props: name, icon component, size, className

**Migration Decision**:
- ⚠️ **Potentially unused** - no imports found
- Verify if component is actually used before migrating
- If unused, consider deleting instead of migrating
- If used, very simple migration (low complexity)

**Migration Complexity**: Low (if needed)

---

### 4. FileSizeWarningModal 📦 MEDIUM PRIORITY

**Location**: `src/components/ui/FileSizeWarningModal.tsx`
**Imports**: 1 file

**Used By**:
- `src/components/states/InitialState.tsx`

**Component Details**:
- Modal wrapper for file size warnings
- Uses existing Modal component from design system
- Two SVG icons: WarningIcon (amber), ErrorIcon (red)
- Displays file size status, estimated time, recommendations

**Features**:
- Conditional rendering based on `isTooLarge` flag
- Action buttons: Compress, Continue Anyway, Cancel
- Benefits of compression list
- Dark mode support
- TypeScript: Uses `FileSizeStatus` from `utils/fileSize`

**Migration Complexity**: Low-Medium
- Already uses Modal component (good sign)
- Simple data display logic
- Need tests for different states (warning vs error)
- Storybook stories for both variants

---

## Migration Priority Order

Based on usage and complexity:

1. **RecordingButtons** (HIGH) - Critical for recording feature
2. **AILoadingOrb** (HIGH) - Critical for processing UI
3. **FileSizeWarningModal** (MEDIUM) - Important for upload validation
4. **Icon** (LOW) - Verify usage first, potentially delete

---

## Migration Checklist

For each component:

### Pre-Migration
- [ ] Verify current imports and usage
- [ ] Read component implementation
- [ ] Identify external dependencies (CSS files, utils, etc.)
- [ ] Check for TypeScript types to migrate

### Migration Steps
- [ ] Create `src/lib/components/ui/ComponentName/` folder
- [ ] Copy component to `ComponentName.tsx`
- [ ] Create comprehensive tests in `ComponentName.test.tsx`
- [ ] Create Storybook stories in `ComponentName.stories.tsx`
- [ ] Create barrel export `index.ts`
- [ ] Update `src/lib/components/ui/index.ts`
- [ ] Run tests and verify all pass
- [ ] Build Storybook and verify visual correctness

### Post-Migration
- [ ] Update imports in consuming files to use `@/lib`
- [ ] Verify no broken imports
- [ ] Run full test suite
- [ ] Run production build
- [ ] Delete legacy component file
- [ ] Commit and push changes

---

## Expected Outcome

After Phase 4:
- ✅ All 4 legacy components migrated to design system
- ✅ Comprehensive test coverage (estimate +80 tests)
- ✅ Complete Storybook documentation (estimate +15 stories)
- ✅ Clean imports using `@/lib`
- ✅ Legacy files deleted from `src/components/ui/`

**Total Components in Design System**: 16 (12 current + 4 migrated)

---

## Files to Create (Estimate)

Assuming all 4 components migrate:
- 16 new files (4 components × 4 files each)

Files to modify:
- 3-4 import updates in consuming files
- 1 update to `src/lib/components/ui/index.ts`

Files to delete:
- 5 legacy files (RecordingButtons.tsx, AILoadingOrb.tsx, AILoadingOrb.css, Icon.tsx, FileSizeWarningModal.tsx)

---

## Next Steps

1. **Verify Icon usage** - Determine if it should be migrated or deleted
2. **Start with RecordingButtons** - Most critical, medium complexity
3. **Migrate AILoadingOrb** - High complexity, critical UI
4. **Migrate FileSizeWarningModal** - Low-medium complexity
5. **Handle Icon** - Delete or migrate based on verification

Ready to proceed with migration!
