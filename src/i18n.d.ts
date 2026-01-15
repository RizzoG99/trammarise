import 'react-i18next';
import translationEN from './locales/en/translation.json';

// Extend react-i18next module to add type safety
declare module 'react-i18next' {
  interface CustomTypeOptions {
    // Set default namespace
    defaultNS: 'translation';
    // Add resources type
    resources: {
      translation: typeof translationEN;
    };
  }
}
