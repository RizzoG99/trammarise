/**
 * All supported language codes (ISO 639-1)
 */
export const LANGUAGE_CODES = [
  'en',
  'it',
  'es',
  'fr',
  'de',
  'pt',
  'nl',
  'ja',
  'zh',
] as const;

/**
 * Union type of all supported language codes
 */
export type LanguageCode = typeof LANGUAGE_CODES[number];

/**
 * Language option for the UI
 */
export interface LanguageOption {
  value: LanguageCode;
  label: string;
}

/**
 * Predefined language options for the configuration UI
 */
export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { value: 'en', label: 'English' },
  { value: 'it', label: 'Italian' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
] as const;

/**
 * Type guard to check if a string is a valid language code
 */
export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGE_CODES.includes(value as LanguageCode);
}
