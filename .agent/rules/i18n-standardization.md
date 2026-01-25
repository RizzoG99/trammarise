---
description: Ensure all user-facing text is internationalized using the existing i18n infrastructure.
---

# Internationalization (i18n) Standardization Rule

## Trigger

Use this rule when:

1.  Adding new UI components that contain text.
2.  Modifying existing UI text.
3.  Reviewing code that involves user-facing strings.
4.  Fixing bugs related to missing translations or hardcoded strings.

## Standards

### 1. No Hardcoded Strings

- **Requirement:** Never use hardcoded string literals for user-facing text in JSX/TSX.
- **Incorrect:** `<h1>Welcome back</h1>`
- **Correct:** `<h1>{t('welcome.back')}</h1>`

### 2. Usage of `react-i18next`

- Ensure the `useTranslation` hook is used in functional components.

  ```typescript
  import { useTranslation } from 'react-i18next';

  export const MyComponent = () => {
    const { t } = useTranslation();
    return <div>{t('key.name')}</div>;
  };
  ```

### 3. Translation Keys

- **Naming Convention:** Use nested keys for better organization (e.g., `page.section.element`).
- **Placement:** Ensure the key exists in the default locale file (usually `src/locales/en.json` or similar).

### 4. Testing

- When writing tests for components with i18n, mock the `t` function or use a testing utility that handles translations.
- Do not assert on translation keys unless specifically testing the machinery; assert on the _content_ if using a configured i18n test provider, or mock returns if unit testing isolated components.

## Checklist

- [ ] Is `t()` used for all text?
- [ ] Are keys snake_case or camelCase (consistent with project style)?
- [ ] Are new keys added to the English translation file?
- [ ] Are dynamic values passed as arguments (e.g., `t('welcome', { name: user.name })`)?
