# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CONTRIBUTING.md with comprehensive contribution guidelines
- SECURITY.md with security policy and vulnerability reporting process
- CHANGELOG.md for tracking project changes
- Coverage directory to ESLint ignore list

### Changed
- Updated ESLint configuration to ignore coverage files

### Fixed
- ESLint warnings in coverage directory

## [0.1.0] - 2026-01-14

### Added
- Initial release of Trammarise
- Audio recording with Web Audio API (MediaRecorder)
- File upload with drag-and-drop support
- Interactive waveform visualization with WaveSurfer.js
- Audio trimming with regions plugin
- Multi-AI provider support:
  - OpenAI (GPT-4) for summarization
  - Claude (3.5 Sonnet) via OpenRouter
  - Deepseek via OpenRouter
- OpenAI Whisper transcription (universal for all providers)
- Content type selection (Meeting, Lecture, Interview, Podcast, Voice Memo, Other)
- Processing mode selection (Balanced, Quality, Speed)
- Language selection (50+ languages)
- Context file upload (PDF, TXT, images) for enhanced summarization
- Interactive chat interface for follow-up questions
- Text-to-speech for reading transcripts and summaries
- PDF export with AI-formatted content
- Large file handling with FFmpeg compression and chunking
- Session-based navigation with React Router
- Dark/light theme support
- Comprehensive test suite (787 tests)
- Storybook component documentation
- Component library in `src/lib/components/`
- Design patterns implementation:
  - Repository Pattern for API calls
  - Builder Pattern for configuration
  - Observer Pattern for processing events
  - Command Pattern for undo/redo
  - Adapter Pattern for audio formats
  - State Machine Pattern for app state
- Vercel serverless deployment
- CI/CD with GitHub Actions
- ESLint and TypeScript strict mode
- Responsive design (mobile-first)
- Accessibility features (ARIA labels, keyboard navigation)

### Security
- API keys stored in sessionStorage only (cleared on tab close)
- No API keys saved to disk or cloud
- Direct communication with AI provider APIs
- CORS headers for SharedArrayBuffer (FFmpeg support)
- Input validation for file uploads
- Request timeouts for API calls

---

## Version History

- **0.1.0** (2026-01-14) - Initial release

---

## How to Update

To update to the latest version:

```bash
git pull origin main
npm install
npm run build
```

For production deployments on Vercel, the latest version is automatically deployed on push to `main`.

---

## Migration Guides

### Upgrading from Pre-Release to 0.1.0

This is the first official release. If you were using a pre-release version:

1. Clear browser sessionStorage (API keys will need to be re-entered)
2. Pull latest changes: `git pull origin main`
3. Install dependencies: `npm install`
4. Rebuild: `npm run build`

No breaking changes in data structures or APIs.

---

## Deprecation Notices

None at this time.

---

## Contributors

Thank you to all contributors who made this release possible!

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to future releases.
