# 🗺️ Trammarise Feature Roadmap

This document outlines the planned trajectory for upcoming features, ensuring all agreed-upon ideas are captured and structured for sequential implementation.

## 📦 Phase 1: Internationalization (i18n)
**Goal:** Make the application accessible to a global audience.

### Requirements
- **Core Library**: `i18next` + `react-i18next`.
- **Languages**:
  - 🇺🇸 English (Default)
  - 🇮🇹 Italian
  - 🇪🇸 Spanish
  - 🇩🇪 German
- **Features**:
  - Auto-detection user's browser language.
  - Language Switcher component in `AppHeader`.
  - Persist preference in `localStorage`.

### Implementation Steps
1. Install dependencies (`i18next`, `react-i18next`, `i18next-browser-languagedetector`).
2. Configure `src/i18n.ts`.
3. Create locale JSON files (`src/locales/{en,it,es,de}.json`).
4. Build `LanguageSwitcher` component.
5. Refactor existing components to use `useTranslation()` hook.

---

## ⚙️ Phase 2: Configuration Page
**Goal:** Provide a centralized place for users to manage API keys and advanced settings.

### Requirements
- **Route**: `/configure` (replacing current placeholder).
- **Settings Categories**:
  - **AI Providers**: Manage API keys for OpenAI, Anthropic, DeepSeek, etc.
  - **Models**: Select default models for transcription and summarization.
  - **Appearance**: Theme toggle (if not in header), density settings.
  - **Storage**: Manage local storage usage (clear cache).

### Implementation Steps
1. Create `src/features/configuration/ConfigurationPage.tsx`.
2. Implement secure inputs for API keys (masked view).
3. Connect to `useSessionStorage` or a new `useSettings` hook for persistent config.
4. Update `App.tsx` routing.

---

## 📤 Phase 3: Knowledge Base Integrations
**Goal:** Allow users to export summaries directly to their second brain tools.

### Requirements
- **Targets**:
  - **Notion**: Export as a new Page in a database.
  - **Obsidian**: Export as Markdown file (download with specific YAML frontmatter or URI scheme).
  - **Markdown**: Generic copy/download (already partially exists).

### Implementation Steps
1. **Obsidian**:
   - Implement "Copy to Obsidian URI" feature (`obsidian://new?name=...&content=...`).
   - Add "Download as Vault File" option.
2. **Notion**:
   - (MVP) "Copy as Notion Block" (formatted clipboard).
   - (Advanced) Notion API integration (requires backend proxy or user token input).

---

## 🗓️ Execution Order
1. **i18n** (Immediate start) - Foundational change affecting all UI.
2. **Configuration Page** - Prerequisite for advanced API management.
3. **Exports** - Value-add feature on top of generated results.
