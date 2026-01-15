# Feature Requirements: Internationalization (i18n)

## 🎯 Feature Summary
Implement comprehensive multi-language support for the Trammarise application, allowing users to switch between English, Italian, Spanish, and German. The app will automatically detect the user's browser language on first visit.

## ✅ Core Requirements
1.  **Language Support**: English (default), Italian, Spanish, German.
2.  **Auto-detection**: Automatically set language based on browser settings.
3.  **Manual Switching**: User can change language via a switcher in the `AppHeader`.
4.  **Persistence**: Selected language should be saved (localStorage) and persist across sessions.
5.  **Performance**: Loading translations should not negatively impact Time to Interactive (TTI).

## 📖 Use Cases

### Primary Scenarios
1.  **First Visit (Auto-detect)**:
    -   User visits app with browser set to Italian.
    -   App loads in Italian automatically.
2.  **Manual Switch**:
    -   User clicks flag/globe icon in Header.
    -   Selects "Deutsch".
    -   UI updates immediately to German.
    -   Selection persists on reload.
3.  **Fallback**:
    -   User visits with browser set to French (unsupported).
    -   App loads in English (fallback).

## 🏗️ Technical Specification

### Dependencies
-   `i18next`: Core translation framework.
-   `react-i18next`: React bindings.
-   `i18next-browser-languagedetector`: For auto-detection and persistence.

### File Structure
```
src/
  i18n/
    config.ts          # i18n initialization
    locales/
      en/translation.json
      it/translation.json
      es/translation.json
      de/translation.json
  components/
    features/
      language/
        LanguageSwitcher.tsx  # New component
```

### Data Flow
1.  `main.tsx` imports `i18n/config.ts` (init).
2.  `App` rendering waits for i18n init (optional `Suspense`).
3.  Components use `useTranslation()` hook.
4.  `LanguageSwitcher` calls `i18n.changeLanguage()`.

### Architecture Impact
-   **AppHeader**: Will house the `LanguageSwitcher`.
-   **Strict Mode**: Ensure types safe translation keys (TypeScript magic).

## 🎨 UI/UX Requirements
-   **Location**: Right side of `AppHeader`, near the GitHub link/Theme toggle.
-   **Interface**: Dropdown menu or row of Flags? -> **Dropdown** with current language icon is standard and saves space on mobile.
-   **Icons**: Use `lucide-react` icons (Globe) + Text code (EN, IT, etc.).

## ⚠️ Risks & Mitigations
-   **Maintenance**: Hardcoded strings might be missed during implementation.
    -   *Mitigation*: Systematic pass through `src/app`, `src/components`, `src/features`.
-   **Bundle Size**: Including all translations in main bundle.
    -   *Mitigation*: Translation files are text-only and small. Can use `i18next-http-backend` later if size grows > 50kb. auto-splitting is preferred.

## 📅 Implementation Plan
1.  **Setup**: Install deps and configure `src/i18n/config.ts`.
2.  **Locales**: Create JSON files and populate with initial strings (e.g., Header, Home).
3.  **Switcher**: Build `LanguageSwitcher` component.
4.  **Integration**: Add Switcher to `AppHeader`.
5.  **Extraction**: Systematically replace text in components with `t('key')`.

---

## ❓ Open Questions
- None. (User confirmed languages and location).

