import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en/translation.json';
import translationIT from './locales/it/translation.json';
import translationES from './locales/es/translation.json';
import translationDE from './locales/de/translation.json';

const resources = {
  en: { translation: translationEN },
  it: { translation: translationIT },
  es: { translation: translationES },
  de: { translation: translationDE },
};

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'it', 'es', 'de'],
    
    // Language detection options
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Keys or params to lookup language from
      lookupLocalStorage: 'i18nextLng',
      // Cache user language on
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    // React i18next options
    react: {
      useSuspense: true,
    }
  });

export default i18n;
