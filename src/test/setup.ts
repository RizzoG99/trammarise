import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Set Supabase environment variables for testing
// These are dummy values used only in test environment
if (!import.meta.env.VITE_SUPABASE_URL) {
  import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  import.meta.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
}

import enTranslation from '../locales/en/translation.json';

// Helper to get nested value from object
// Helper to get nested value from object
const getNestedValue = (obj: Record<string, unknown> | null, key: string): string => {
  if (!obj) return key;
  const val = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return null;
  }, obj);
  return typeof val === 'string' ? val : key;
};

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      let text = getNestedValue(enTranslation as unknown as Record<string, unknown>, key);

      // Basic interpolation support for tests
      if (options && typeof text === 'string') {
        Object.keys(options).forEach((prop) => {
          text = text.replace(`{{${prop}}}`, String(options[prop]));
        });
      }

      return text;
    },
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: 'en',
      resolvedLanguage: 'en',
      exists: (key: string) => {
        const val = getNestedValue(enTranslation as unknown as Record<string, unknown>, key);
        return val !== key && val !== null;
      },
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
  Trans: ({ i18nKey, children }: { i18nKey: string; children?: React.ReactNode }) => {
    return children || getNestedValue(enTranslation as unknown as Record<string, unknown>, i18nKey);
  },
}));

afterEach(() => {
  cleanup();
});
