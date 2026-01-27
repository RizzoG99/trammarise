import { describe, it, expect } from 'vitest';
import en from '../locales/en/translation.json';
import itLocale from '../locales/it/translation.json';
import es from '../locales/es/translation.json';
import de from '../locales/de/translation.json';

const locales = {
  it: itLocale,
  es,
  de,
};

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.keys(obj).reduce((res: string[], el) => {
    const val = obj[el];
    if (Array.isArray(val)) {
      return res;
    } else if (typeof val === 'object' && val !== null) {
      return [...res, ...getKeys(val as Record<string, unknown>, prefix + el + '.')];
    }
    return [...res, prefix + el];
  }, []);
}

describe('Translation Consistency', () => {
  const enKeys = getKeys(en);

  Object.entries(locales).forEach(([lang, translation]) => {
    it(`should have all keys in ${lang} matching English`, () => {
      const currentKeys = getKeys(translation);
      const missingKeys = enKeys.filter((k) => !currentKeys.includes(k));

      if (missingKeys.length > 0) {
        console.error(`Missing keys in ${lang}:`, missingKeys);
      }

      expect(missingKeys).toHaveLength(0);
    });
  });
});
