# Trammarise - Functional Analysis

## 1. System Overview

**Purpose**: Web-based audio transcription and AI-powered summarization platform
**Architecture**: Client-side application using user-provided OpenAI API keys
**Primary Focus**: Mobile-first responsive design

---

## 2. Core Features & User Flows

### 2.1 API Key Management
**Setup Page**
- Dedicated onboarding page with step-by-step documentation
- Visual guide for obtaining OpenAI API key
- Secure local storage of API key (browser-based, never server-side)
- Validation mechanism to verify key authenticity
- Option to update/change API key

**Functional Requirements**:
- Clear instructions with screenshots/video
- API key input field with visibility toggle
- Connection test button
- Error handling for invalid keys
- Privacy notice explaining client-side usage

---

### 2.2 Audio Input Module

**Option A: File Upload**
- Supported formats: MP3, WAV, M4A, OGG (typical audio formats)
- File size validation and limits
- Drag-and-drop functionality
- File preview with basic metadata (duration, size, format)

**Option B: Direct Recording**
- Browser-based microphone access
- Recording controls: Start, Pause, Resume, Stop
- Real-time duration counter
- Waveform visualization
- Playback preview before processing
- Re-record option

**Functional Requirements**:
- Permission handling for microphone access
- Audio quality settings for recording
- Browser compatibility checks
- Mobile-optimized recording interface
- Maximum recording duration limits

---

### 2.3 Context Enhancement System

**Document Upload**
- Supported formats: PDF, DOCX, TXT, MD
- Multiple file upload support
- File size limits per document
- Preview of uploaded documents
- Remove/replace functionality

**Image Upload**
- Supported formats: JPG, PNG, HEIC
- OCR text extraction for context
- Thumbnail previews
- Multiple image support

**Functional Requirements**:
- Clear indication of optional feature
- Total context size calculation
- Processing of documents into text format
- Validation of file types
- Mobile-friendly upload interface

---

### 2.4 Audio Selection Tool

**Waveform Editor**
- Visual waveform representation
- Selection handles (start/end markers)
- Zoom in/out controls
- Playback of selected portion
- Time indicators (MM:SS format)
- Reset to full audio option

**Functional Requirements**:
- Touch-friendly controls for mobile
- Precise selection (down to seconds)
- Visual feedback for selected region
- Audio preview for selected portion

---

### 2.5 Processing Configuration

**Language Selection**
- Dropdown with common languages
- Auto-detection option (with confirmation)
- Custom language input

**Meeting Type Selection**
- Predefined categories:
  - Lesson/Lecture
  - Daily Meeting/Standup
  - Interview
  - Conference Call
  - Brainstorming Session
  - General/Other
- Custom type input option

**Quality Mode Selection**
- **Balanced Mode**:
  - Faster processing
  - Lower token consumption
  - Standard quality output
  - Cost indicator
  
- **Quality Mode**:
  - Enhanced accuracy
  - Higher token consumption
  - Detailed summarization
  - Cost indicator (e.g., "2-3x tokens")

**Functional Requirements**:
- Clear explanation of differences
- Token cost estimation
- Warning for quality mode costs
- Default to balanced mode
- Save preferences option

---

### 2.6 Processing & Waiting Experience

**Loading State**
- Animated progress indicator
- Stage indicators:
  1. Uploading audio
  2. Transcribing
  3. Analyzing context
  4. Generating summary
- Estimated time remaining
- Cancellation option
- Background processing notice (can't navigate away)

**Functional Requirements**:
- Smooth animations (optimized for mobile)
- Progress percentage
- Error handling with retry option
- Network status monitoring

---

### 2.7 Results Display

**Transcription Section**
- Full text transcription
- Timestamp markers (optional toggle)
- Speaker identification (if multiple speakers)
- Text formatting (paragraphs)
- Search within transcription
- Copy to clipboard

**Summary Section**
- Structured summary based on meeting type
- Key points/highlights
- Action items (if applicable)
- Collapsible sections
- Copy to clipboard

**Audio Playback**
- Embedded player
- Sync transcription highlighting with playback
- Speed controls
- Jump to timestamp from transcription

**Functional Requirements**:
- Responsive layout for mobile/desktop
- Clear visual separation of sections
- Smooth scrolling
- Text selection enabled

---

### 2.8 Interactive Chat Refinement

**AI Chat Interface**
- Chat window (modal or sidebar)
- Context-aware: knows about the transcription/summary
- Example prompts:
  - "Make the summary shorter"
  - "Focus more on technical details"
  - "Extract only action items"
  - "Translate to [language]"
- Chat history for session
- Regenerate summary button

**Functional Requirements**:
- Real-time streaming responses
- Token usage display
- Mobile-friendly chat interface
- Clear indication of API calls
- Error handling for API limits

---

### 2.9 Export Functionality

**PDF Generation**
- Professional formatting
- Sections:
  - Metadata (date, duration, language, type)
  - Summary
  - Full transcription
  - Optional: context documents summary
- Customization options:
  - Include/exclude sections
  - Add custom notes
  - Branding/logo option

**Additional Formats** (Optional)
- Plain text (.txt)
- Markdown (.md)
- JSON (raw data)

**Functional Requirements**:
- Client-side PDF generation (e.g., jsPDF)
- Download triggers browser download
- Filename with timestamp
- Preview before download

---

## 3. Mobile-First Considerations

### 3.1 UI/UX Priorities
- **Touch Targets**: Minimum 44x44px buttons
- **Simplified Navigation**: Bottom navigation bar or hamburger menu
- **Progressive Disclosure**: Show advanced options only when needed
- **Vertical Scrolling**: Single-column layouts
- **Gesture Support**: Swipe actions where appropriate

### 3.2 Performance Optimization
- Lazy loading of components
- Optimized image/audio processing
- Service workers for offline capabilities
- Chunked file uploads for large files

### 3.3 Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 4. Technical Architecture Recommendations

### 4.1 Frontend Stack
**Based on your existing Trammarise setup**:
- React + TypeScript
- WaveSurfer.js (audio visualization)
- Tailwind CSS (mobile-first styling)
- Zustand/Context API (state management)

### 4.2 Key Libraries
- **Audio Processing**: WaveSurfer.js, RecordRTC
- **File Handling**: react-dropzone
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **API Integration**: OpenAI SDK
- **Form Management**: React Hook Form
- **Animations**: Framer Motion

### 4.3 Data Flow
```
User Input → Local Processing → OpenAI API (user's key) → Results Display → Export
```

**No Backend Required** (unless you add features like):
- User accounts
- Storage of transcriptions
- Usage analytics

---

## 5. User Stories & Acceptance Criteria

### US-1: API Key Setup
**As a** new user  
**I want to** easily set up my OpenAI API key  
**So that** I can start using the transcription service

**Acceptance Criteria**:
- Clear step-by-step guide visible
- API key validation works
- Error messages are helpful
- Key is stored securely in browser

### US-2: Audio Recording
**As a** mobile user  
**I want to** record audio directly from my phone  
**So that** I don't need to upload files

**Acceptance Criteria**:
- Recording works on iOS and Android
- Can pause and resume recording
- Can preview before processing
- Quality settings available

### US-3: Context Documents
**As a** user transcribing a technical meeting  
**I want to** upload relevant documentation  
**So that** the AI has better context for acronyms and terms

**Acceptance Criteria**:
- Can upload multiple PDFs/images
- See preview of uploaded files
- Can remove files before processing
- Clear indication this is optional

### US-4: Portion Selection
**As a** user with a long recording  
**I want to** process only a specific section  
**So that** I save time and tokens

**Acceptance Criteria**:
- Visual waveform displayed
- Can select start/end points easily on mobile
- Can preview selected portion
- Can reset to full audio

### US-5: Quality Selection
**As a** user on a budget  
**I want to** choose between processing quality levels  
**So that** I can control my API costs

**Acceptance Criteria**:
- Clear explanation of differences
- Estimated cost shown for each option
- Default to balanced mode
- Warning for quality mode costs

### US-6: Results Interaction
**As a** user reviewing results  
**I want to** refine the summary through chat  
**So that** I get exactly the output I need

**Acceptance Criteria**:
- Chat interface is accessible
- Can request modifications
- Changes apply in real-time
- Token usage is visible

### US-7: PDF Export
**As a** user  
**I want to** download a professional PDF  
**So that** I can share results with others

**Acceptance Criteria**:
- PDF includes all key sections
- Formatting is clean and professional
- Download works on mobile browsers
- Filename is descriptive

---

## 6. Edge Cases & Error Handling

### 6.1 API Key Issues
- Invalid key format
- Expired/revoked key
- Insufficient credits
- Rate limits exceeded

### 6.2 Audio Processing
- Unsupported format
- File too large
- Silent/no audio detected
- Corrupted file

### 6.3 Context Documents
- Unsupported format
- File too large
- OCR fails on image
- Text extraction fails

### 6.4 Network Issues
- Upload interrupted
- API timeout
- No internet connection
- Slow connection handling

### 6.5 Browser Compatibility
- Microphone access denied
- Unsupported browser
- Storage quota exceeded
- JavaScript disabled

### 6.6 Concurrent Audio Input Operations
**Scenario**: User performs multiple audio input actions simultaneously

**Upload File While Recording**:
- Behavior: Recording automatically stops
- Priority: Uploaded file takes precedence
- State: Recording timer resets, partial recording discarded
- Visual feedback: FilePreview shows uploaded file
- Rationale: User's explicit file selection indicates intent to use that file

**Start Recording While File Uploaded**:
- Behavior: Uploaded file automatically cleared
- Priority: Recording takes precedence
- State: FilePreview disappears, recording timer starts
- Visual feedback: Recording indicator active
- Rationale: User's explicit recording action indicates intent to create new audio

**Remove File While Recording**:
- Behavior: Recording automatically stops and resets
- Priority: Remove action takes precedence
- State: Recording timer resets to 00:00:00, recording state cleared
- Visual feedback: Both panels return to initial state
- Rationale: User's explicit removal indicates intent to start fresh

**Test Cases**:
- TC-1: Start recording → Upload file mid-recording → Verify recording stops, uploaded file active
- TC-2: Upload file → Start recording → Verify file removed, recording active
- TC-3: Start recording → Remove file via FilePreview → Verify recording stops and resets
- TC-4: Upload file → Remove file → Start recording → Verify clean state
- TC-5: Record → Stop → Upload file → Verify recording replaced with uploaded file

**Handling Strategy**:
- Automatic conflict resolution (no user prompts)
- Latest user action takes precedence
- Clean state transitions with no orphaned data
- Visual feedback for all state changes
- No data loss on explicit user actions

---

## 7. Security & Privacy Considerations

### 7.1 API Key Security
- Store in localStorage/sessionStorage (never cookies)
- Never send to your servers
- Clear on logout
- Encryption at rest option

### 7.2 Audio Privacy
- Client-side processing only
- No server storage of audio
- Clear data retention policy
- GDPR compliance notice

### 7.3 Document Handling
- Temporary processing only
- Auto-delete after session
- No tracking of content
- Clear privacy policy

---

## 8. Future Enhancement Opportunities

### Phase 2 Features
- User accounts (optional)
- Save/load previous transcriptions
- Collaboration features (share links)
- Custom AI prompts/templates
- Multi-language interface
- Speaker diarization
- Custom vocabulary/glossary
- Integration with cloud storage (Drive, Dropbox)
- Batch processing
- API usage analytics dashboard