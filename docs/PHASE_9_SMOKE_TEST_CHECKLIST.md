# Phase 9 - Manual Smoke Testing Checklist

**Date**: 2026-01-11
**Phase**: Component Migration Phase 9 (Final Validation)
**Purpose**: Verify all critical user flows work after component migration cleanup

---

## Automated Validation Results ✅

**ESLint**: ✅ PASSED (0 errors, 0 warnings)
**TypeScript Build**: ✅ PASSED (no type errors)
**Production Build**: ✅ PASSED (1954 modules transformed)
**Test Suite**: ✅ PASSED (513 tests across 18 test files)
**Storybook Build**: ✅ PASSED (all component stories compiled)

---

## Manual Smoke Testing Checklist

### 1. Development Server
- [ ] Run `npm run dev`
- [ ] Verify server starts without errors
- [ ] Verify both API server (port 3001) and Vite (port 5173) start
- [ ] Check browser console for errors
- [ ] Verify hot module reload (HMR) works

### 2. Upload/Record Page (`/`)
- [ ] Navigate to home page
- [ ] Verify page layout renders correctly
- [ ] Test file upload:
  - [ ] Click upload area
  - [ ] Select an audio file (MP3, WAV, etc.)
  - [ ] Verify file preview displays
  - [ ] Verify remove button works
- [ ] Test drag-and-drop:
  - [ ] Drag audio file to upload area
  - [ ] Verify file uploads successfully
- [ ] Test audio recording:
  - [ ] Click record button
  - [ ] Grant microphone permissions
  - [ ] Verify recording starts (waveform animation)
  - [ ] Click pause button
  - [ ] Click resume (pause button toggles)
  - [ ] Click stop button
  - [ ] Verify recording blob created
- [ ] Test configuration:
  - [ ] Select different languages
  - [ ] Select different content types
  - [ ] Select different processing modes
  - [ ] Upload context files (PDFs)
- [ ] Verify "Process Audio" button:
  - [ ] Disabled when no audio
  - [ ] Enabled when audio present
  - [ ] Navigates to audio editing page

### 3. Audio Editing Page (`/audio/:sessionId`)
- [ ] Verify session loads correctly
- [ ] Verify audio file restored from session
- [ ] Test WaveformPlayer:
  - [ ] Waveform visualization renders
  - [ ] Play button works
  - [ ] Pause button works
  - [ ] Seek by clicking waveform
  - [ ] Playback progress indicator
- [ ] Test audio trimming:
  - [ ] Create trim region (drag on waveform)
  - [ ] Verify scissors icon appears
  - [ ] Click scissors to apply trim
  - [ ] Verify region removed
- [ ] Verify playback controls:
  - [ ] Play/pause toggle
  - [ ] Volume control
  - [ ] Playback speed control
- [ ] Test navigation:
  - [ ] "Continue" button navigates to processing

### 4. Processing Page (`/processing/:sessionId`)
- [ ] Verify session configuration loaded
- [ ] Verify processing starts automatically
- [ ] Monitor progress indicator:
  - [ ] Compression step (if file > 24MB)
  - [ ] Transcription step
  - [ ] Summarization step
- [ ] Verify progress percentage updates
- [ ] Verify step checklist updates
- [ ] Test cancel button:
  - [ ] Click cancel during processing
  - [ ] Verify processing aborts
  - [ ] Verify returns to upload page
- [ ] Wait for completion
- [ ] Verify navigation to results page

### 5. Results Page (`/results/:sessionId`)
- [ ] Verify transcript displays
- [ ] Verify summary displays
- [ ] Verify markdown formatting in summary
- [ ] Test SearchableTranscript:
  - [ ] Type in search box
  - [ ] Verify highlights appear
  - [ ] Verify navigation between matches
- [ ] Test ActionButtons:
  - [ ] Copy to clipboard
  - [ ] Text-to-Speech (browser TTS)
  - [ ] Download as PDF
- [ ] Test ChatInterface:
  - [ ] Open chat modal
  - [ ] Type message
  - [ ] Send message
  - [ ] Verify AI response
  - [ ] Verify token usage meter
  - [ ] Test suggestion chips
  - [ ] Close modal

### 6. Storybook (`npm run storybook`)
- [ ] Run `npm run storybook`
- [ ] Verify Storybook starts on port 6006
- [ ] Navigate component categories:
  - [ ] Core UI components
  - [ ] Form components
  - [ ] Audio components
  - [ ] Chat components
- [ ] Test interactive stories:
  - [ ] Button variants
  - [ ] Modal open/close
  - [ ] Theme toggle
  - [ ] RecordingButtons workflow
- [ ] Verify autodocs pages render
- [ ] Test dark mode toggle in Storybook

### 7. Theme & Dark Mode
- [ ] Toggle theme in top-right corner
- [ ] Verify all pages support dark mode:
  - [ ] Upload page
  - [ ] Audio editing page
  - [ ] Processing page
  - [ ] Results page
- [ ] Verify components respect theme:
  - [ ] GlassCard
  - [ ] Buttons
  - [ ] Modals
  - [ ] Text/Heading colors
  - [ ] Background colors
- [ ] Verify theme persists on reload

### 8. Error Handling
- [ ] Test invalid file upload (non-audio)
- [ ] Test file too large (>500MB)
- [ ] Test empty file
- [ ] Test microphone permission denial
- [ ] Test network errors (API failures)
- [ ] Verify error messages display
- [ ] Verify Snackbar notifications

### 9. Responsive Design
- [ ] Test at mobile viewport (375px)
- [ ] Test at tablet viewport (768px)
- [ ] Test at desktop viewport (1440px)
- [ ] Verify grid layouts adapt:
  - [ ] Upload/Record split on mobile
  - [ ] Configuration grid columns
  - [ ] Results page layout
- [ ] Verify touch interactions work (if testing on device)

### 10. Browser Compatibility
- [ ] Test in Chrome/Chromium
- [ ] Test in Safari (especially for recording - uses audio/mp4)
- [ ] Test in Firefox
- [ ] Verify MediaRecorder API works in all browsers
- [ ] Verify WaveSurfer.js works in all browsers

---

## Critical Issues Checklist

If any of these fail, **DO NOT MERGE**:
- [ ] ESLint errors
- [ ] TypeScript compilation errors
- [ ] Test failures
- [ ] Production build failures
- [ ] Broken imports after cleanup
- [ ] Components not rendering
- [ ] Critical user flows broken

---

## Notes

- The stderr warning in tests (`Error accessing microphone: Error: Permission denied`) is expected - it's testing the error handling for denied permissions
- Storybook chunk size warnings are normal and do not affect functionality
- Session data is stored in sessionStorage and cleared when tab closes
- Files are stored in-memory and do not persist across refreshes

---

## Completion Criteria

Phase 9 is complete when:
- ✅ All automated checks pass (lint, build, tests, Storybook)
- ✅ Manual smoke tests verify critical flows work
- ✅ No regressions found
- ✅ Ready for Phase 10 (Documentation)

---

**Tested By**: _____________
**Date Tested**: _____________
**Result**: [ ] PASS  [ ] FAIL
**Issues Found**: _____________
