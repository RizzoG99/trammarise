# UI Components Analysis & Migration Guide

**Date**: 2026-01-08  
**Status**: In Progress  
**Purpose**: Document the relationship between legacy UI components and the new Storybook design system

---

## Overview

The codebase currently has **two component libraries**:

1. **Legacy Components** (`src/components/ui/`) - Actively used across the application
2. **New Design System** (`src/lib/components/`) - Components with Storybook stories and comprehensive tests

## Component Inventory

### 📦 Components with Dual Implementations (Duplicates)

These components exist in **both** locations with different implementations:

| Component | Legacy Path | New Path | Storybook Story | Tests | Status |
|-----------|------------|----------|----------------|-------|--------|
| **Button** | `src/components/ui/Button.tsx` | `src/lib/components/ui/Button/` | ✅ | ✅ | Needs migration |
| **Modal** | `src/components/ui/Modal.tsx` | `src/lib/components/ui/Modal/` | ✅ | ✅ | Needs migration |
| **LoadingSpinner** | `src/components/ui/LoadingSpinner.tsx` | `src/lib/components/ui/LoadingSpinner/` | ✅ | ✅ | Needs migration |
| **Snackbar** | `src/components/ui/Snackbar.tsx` | `src/lib/components/ui/Snackbar/` | ✅ | ✅ | Needs migration |
| **ThemeToggle** | `src/components/ui/ThemeToggle.tsx` | `src/lib/components/ui/ThemeToggle/` | ✅ | ✅ | Needs migration |
| **ToggleSwitch** | `src/components/ui/ToggleSwitch.tsx` | `src/lib/components/form/ToggleSwitch/` | ✅ | ✅ | Needs migration |
| **RadioCard** | `src/components/ui/RadioCard.tsx` | `src/lib/components/form/RadioCard/` | ✅ | ✅ | Needs migration |
| **SelectCard** | `src/components/ui/SelectCard.tsx` | `src/lib/components/form/SelectCard/` | ✅ | ✅ | Needs migration |
| **Input** | `src/components/ui/Input.tsx` | `src/lib/components/ui/Input/` | ✅ | ✅ | Needs migration |

**Impact**: 9 duplicated components causing confusion and maintenance overhead.

### 🔧 Legacy-Only Components (Production Use)

These components exist **only** in the legacy folder and are actively used:

| Component | Path | Usage | Storybook Story | Tests | Priority |
|-----------|------|-------|----------------|-------|----------|
| **GlassCard** | `src/components/ui/GlassCard.tsx` | High (20+ files) | ❌ | ❌ | 🔴 Critical |
| **Heading** | `src/components/ui/Heading.tsx` | High (15+ files) | ❌ | ❌ | 🔴 Critical |
| **Text** | `src/components/ui/Text.tsx` | High (20+ files) | ❌ | ❌ | 🔴 Critical |
| **RecordingButtons** | `src/components/ui/RecordingButtons.tsx` | Medium (1 file) | ❌ | ❌ | 🟡 Medium |
| **AILoadingOrb** | `src/components/ui/AILoadingOrb.tsx` | Low (1 file) | ❌ | ❌ | 🟢 Low |
| **Icon** | `src/components/ui/Icon.tsx` | Unknown | ❌ | ❌ | 🟢 Low |
| **FileSizeWarningModal** | `src/components/ui/FileSizeWarningModal.tsx` | Unknown | ❌ | ❌ | 🟢 Low |

**Impact**: 7 components need Storybook stories and tests to complete the design system.

### 📚 New Design System Only

Components that exist **only** in the new design system:

- None (all new components have legacy equivalents)

---

## Usage Analysis

### Legacy Components (`src/components/ui/`)

**Most Used Components**:
- **GlassCard**: ~20 imports (UploadPanel, RecordPanel, ChatModal, ProgressCircle, StepChecklist, etc.)
- **Text**: ~20 imports (across all feature modules)
- **Heading**: ~15 imports (page headers, card titles, etc.)
- **Button**: ~6 imports (ProcessingPage, ChatModal, DualActionButtons, etc.)

**Usage Pattern**: Legacy components are the **primary UI library** for the application.

### New Design System (`src/lib/components/`)

**Usage**: Primarily used in `PreviewPage.tsx` for demonstration purposes.

**Import Pattern**:
```typescript
import {
  Button,
  Input,
  LoadingSpinner,
  Modal,
  Snackbar,
  ThemeToggle,
  ToggleSwitch,
  RadioCard,
  SelectCard,
} from '@/lib';
```

---

## Key Differences

### 1. Button Component

**Legacy** (`src/components/ui/Button.tsx`):
- Simpler implementation (~50 lines)
- 9 variants: primary, secondary, success, danger, outline, small, large, circle, circle-thick
- Uses inline Tailwind classes
- Icon support via `icon` prop

**New** (`src/lib/components/ui/Button/Button.tsx`):
- More comprehensive (~120+ lines based on symbols)
- Enhanced TypeScript types
- Comprehensive test coverage (64+ tests)
- Storybook documentation
- Interactive examples

**Recommendation**: Migrate to new Button for better type safety and documentation.

### 2. Input Component

**Legacy** (`src/components/ui/Input.tsx`):
- Basic implementation
- Label, error, hint support
- Full dark mode

**New** (`src/lib/components/ui/Input/Input.tsx`):
- Same features as legacy
- Comprehensive test coverage (64+ tests)
- **NEW**: Storybook stories with form examples, controlled input demos, validation examples

**Recommendation**: Migrate to new Input for better documentation and test coverage.

### 3. GlassCard Component

**Legacy Only** (`src/components/ui/GlassCard.tsx`):
- Glass morphism design with blur effects
- 3 variants: light, dark, primary
- 3 blur levels: sm, md, lg
- CSS variable-based theming
- **Heavy usage**: 20+ imports across codebase

**Status**: ❌ No Storybook story  
**Recommendation**: **Priority 1** - Create comprehensive Storybook story showcasing all variants and blur levels.

---

## Migration Strategy

### Phase 1: Document Legacy Components (In Progress)
- [x] Create Input.stories.tsx
- [ ] Create GlassCard.stories.tsx
- [ ] Create Heading.stories.tsx  
- [ ] Create Text.stories.tsx
- [ ] Create RecordingButtons.stories.tsx
- [ ] Create AILoadingOrb.stories.tsx
- [ ] Create Icon.stories.tsx

### Phase 2: Standardize Duplicates
For each duplicated component:
1. Compare implementations (legacy vs new)
2. Choose the better implementation (prefer new for tests/docs)
3. Update all imports to use the chosen version
4. Delete the obsolete version

**Suggested Order**:
1. Input (already has stories) ✅
2. Button (high usage)
3. Modal
4. ThemeToggle
5. Snackbar
6. LoadingSpinner
7. Form components (ToggleSwitch, RadioCard, SelectCard)

### Phase 3: Consolidate Component Library
- Move all production components to `src/lib/components/`
- Delete `src/components/ui/` folder
- Update all imports throughout the codebase
- Update CLAUDE.md with single source of truth

### Phase 4: Complete Design System
- Ensure every component has:
  - ✅ TypeScript types
  - ✅ Comprehensive tests (80%+ coverage)
  - ✅ Storybook story with all variants
  - ✅ Dark mode support
  - ✅ Accessibility compliance (WCAG 2.1 AA)
  - ✅ JSDoc documentation

---

## Recommendations

### Immediate Actions (High Priority)

1. **Create GlassCard.stories.tsx** 🔴
   - Most used legacy component without Storybook
   - Showcase all 3 variants (light, dark, primary)
   - Showcase all 3 blur levels (sm, md, lg)
   - Include nested content examples

2. **Create Heading.stories.tsx** 🔴
   - 4 levels: hero, h1, h2, h3
   - Used in 15+ files
   - Typography documentation

3. **Create Text.stories.tsx** 🔴
   - Font size variants
   - Color variants
   - Used in 20+ files

4. **Create RecordingButtons.stories.tsx** 🟡
   - RecordButton, PauseButton, StopButton components
   - Interactive states (idle, recording, paused)
   - Accessibility features

### Medium Priority

5. **Migrate Button component**
   - Replace all legacy Button imports with new Button from `@/lib`
   - Delete `src/components/ui/Button.tsx`
   - Update 6 files

6. **Migrate Input component**
   - Replace all legacy Input imports with new Input from `@/lib`
   - Delete `src/components/ui/Input.tsx`
   - Currently no usage found (safe to migrate)

### Low Priority

7. **Create AILoadingOrb.stories.tsx** 🟢
   - Animated loading orb with SVG gradients
   - Size variants
   - Used in 1 file (PreviewPage)

8. **Create Icon.stories.tsx** 🟢
   - Lucide icon wrapper
   - Size variants
   - Material Icons support

---

## Testing Status

### Components with Tests ✅
- Button (64+ tests)
- Input (64+ tests)
- Modal (tests exist)
- LoadingSpinner (tests exist)
- Snackbar (tests exist)
- ThemeToggle (tests exist)
- ToggleSwitch (tests exist)
- RadioCard (tests exist)
- SelectCard (tests exist)

### Components without Tests ❌
- GlassCard
- Heading
- Text
- RecordingButtons
- AILoadingOrb
- Icon
- FileSizeWarningModal

**Target**: 300+ tests (currently achieved for new design system components)

---

## Design System Health Metrics

| Metric | Status | Target |
|--------|--------|--------|
| **Components with Stories** | 9/16 (56%) | 100% |
| **Components with Tests** | 9/16 (56%) | 100% |
| **Test Coverage** | High (new), Low (legacy) | 80%+ |
| **Dark Mode Support** | 16/16 (100%) | 100% |
| **Duplication** | 9 components | 0 |
| **Single Source of Truth** | ❌ Split | ✅ Unified |

---

## Next Steps

1. **Create Storybook stories for top 3 legacy components** (GlassCard, Heading, Text)
2. **Write tests for legacy components** (aim for 80%+ coverage)
3. **Plan migration sprint** to consolidate duplicates
4. **Update CLAUDE.md** with migration guide
5. **Create Component Migration Checklist** for team

---

## Notes

- **PreviewPage** (`src/pages/PreviewPage.tsx`) demonstrates the new design system
- **Component Creation Workflow** is documented in CLAUDE.md
- **Storybook 10.1.x** is configured and working
- **CI/CD** now validates Storybook builds (as of this session)
- **ESLint** now properly lints `.storybook` files (as of this session)

---

## Questions for Team Discussion

1. **Migration Timeline**: When should we consolidate the component libraries?
2. **Breaking Changes**: Are we willing to accept breaking changes for better architecture?
3. **Component Ownership**: Should legacy components be deprecated immediately or gradually?
4. **Testing Requirements**: Should we enforce 80%+ coverage for all components before migration?
5. **Documentation Standards**: Should every component require a Storybook story before production use?
