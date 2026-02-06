/**
 * Extended language support (50+ languages)
 * Based on OpenAI Whisper and AssemblyAI support
 */

export interface ExtendedLanguageOption {
  value: string;
  label: string;
  nativeName: string;
  region?: string;
  popular?: boolean;
}

/**
 * Comprehensive list of supported languages
 * Organized by popularity/usage
 */
export const EXTENDED_LANGUAGE_OPTIONS: readonly ExtendedLanguageOption[] = [
  // Auto-detect option
  { value: 'auto', label: 'Auto-detect', nativeName: 'Auto-detect', popular: true },

  // Most popular languages
  { value: 'en', label: 'English', nativeName: 'English', popular: true },
  { value: 'es', label: 'Spanish', nativeName: 'Español', popular: true },
  { value: 'fr', label: 'French', nativeName: 'Français', popular: true },
  { value: 'de', label: 'German', nativeName: 'Deutsch', popular: true },
  { value: 'it', label: 'Italian', nativeName: 'Italiano', popular: true },
  { value: 'pt', label: 'Portuguese', nativeName: 'Português', popular: true },
  { value: 'zh', label: 'Chinese (Mandarin)', nativeName: '中文', popular: true },
  { value: 'ja', label: 'Japanese', nativeName: '日本語', popular: true },
  { value: 'ko', label: 'Korean', nativeName: '한국어', popular: true },
  { value: 'ru', label: 'Russian', nativeName: 'Русский', popular: true },
  { value: 'ar', label: 'Arabic', nativeName: 'العربية', popular: true },
  { value: 'hi', label: 'Hindi', nativeName: 'हिन्दी', popular: true },

  // European languages
  { value: 'nl', label: 'Dutch', nativeName: 'Nederlands', region: 'Europe' },
  { value: 'pl', label: 'Polish', nativeName: 'Polski', region: 'Europe' },
  { value: 'tr', label: 'Turkish', nativeName: 'Türkçe', region: 'Europe' },
  { value: 'uk', label: 'Ukrainian', nativeName: 'Українська', region: 'Europe' },
  { value: 'sv', label: 'Swedish', nativeName: 'Svenska', region: 'Europe' },
  { value: 'no', label: 'Norwegian', nativeName: 'Norsk', region: 'Europe' },
  { value: 'da', label: 'Danish', nativeName: 'Dansk', region: 'Europe' },
  { value: 'fi', label: 'Finnish', nativeName: 'Suomi', region: 'Europe' },
  { value: 'el', label: 'Greek', nativeName: 'Ελληνικά', region: 'Europe' },
  { value: 'cs', label: 'Czech', nativeName: 'Čeština', region: 'Europe' },
  { value: 'ro', label: 'Romanian', nativeName: 'Română', region: 'Europe' },
  { value: 'hu', label: 'Hungarian', nativeName: 'Magyar', region: 'Europe' },
  { value: 'bg', label: 'Bulgarian', nativeName: 'Български', region: 'Europe' },
  { value: 'hr', label: 'Croatian', nativeName: 'Hrvatski', region: 'Europe' },
  { value: 'sk', label: 'Slovak', nativeName: 'Slovenčina', region: 'Europe' },
  { value: 'sl', label: 'Slovenian', nativeName: 'Slovenščina', region: 'Europe' },
  { value: 'et', label: 'Estonian', nativeName: 'Eesti', region: 'Europe' },
  { value: 'lv', label: 'Latvian', nativeName: 'Latviešu', region: 'Europe' },
  { value: 'lt', label: 'Lithuanian', nativeName: 'Lietuvių', region: 'Europe' },

  // Asian languages
  { value: 'th', label: 'Thai', nativeName: 'ไทย', region: 'Asia' },
  { value: 'vi', label: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Asia' },
  { value: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Asia' },
  { value: 'ms', label: 'Malay', nativeName: 'Bahasa Melayu', region: 'Asia' },
  { value: 'ta', label: 'Tamil', nativeName: 'தமிழ்', region: 'Asia' },
  { value: 'te', label: 'Telugu', nativeName: 'తెలుగు', region: 'Asia' },
  { value: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Asia' },
  { value: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', region: 'Asia' },
  { value: 'mr', label: 'Marathi', nativeName: 'मराठी', region: 'Asia' },
  { value: 'bn', label: 'Bengali', nativeName: 'বাংলা', region: 'Asia' },
  { value: 'ur', label: 'Urdu', nativeName: 'اردو', region: 'Asia' },
  { value: 'fa', label: 'Persian', nativeName: 'فارسی', region: 'Asia' },
  { value: 'he', label: 'Hebrew', nativeName: 'עברית', region: 'Middle East' },

  // Americas
  {
    value: 'pt-BR',
    label: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    region: 'Americas',
  },

  // Additional languages
  { value: 'af', label: 'Afrikaans', nativeName: 'Afrikaans', region: 'Africa' },
  { value: 'ca', label: 'Catalan', nativeName: 'Català', region: 'Europe' },
  { value: 'cy', label: 'Welsh', nativeName: 'Cymraeg', region: 'Europe' },
  { value: 'eu', label: 'Basque', nativeName: 'Euskara', region: 'Europe' },
  { value: 'gl', label: 'Galician', nativeName: 'Galego', region: 'Europe' },
  { value: 'is', label: 'Icelandic', nativeName: 'Íslenska', region: 'Europe' },
  { value: 'ka', label: 'Georgian', nativeName: 'ქართული', region: 'Europe' },
  { value: 'sw', label: 'Swahili', nativeName: 'Kiswahili', region: 'Africa' },
  { value: 'tl', label: 'Tagalog (Filipino)', nativeName: 'Tagalog', region: 'Asia' },
] as const;

/**
 * Get popular languages for quick access
 */
export const POPULAR_LANGUAGES = EXTENDED_LANGUAGE_OPTIONS.filter((lang) => lang.popular);

/**
 * Get languages by region
 */
export function getLanguagesByRegion(region: string): readonly ExtendedLanguageOption[] {
  return EXTENDED_LANGUAGE_OPTIONS.filter((lang) => lang.region === region);
}

/**
 * Check if auto-detect is selected
 */
export function isAutoDetect(languageCode: string): boolean {
  return languageCode === 'auto';
}

/**
 * Get language option by code
 */
export function getLanguageOption(code: string): ExtendedLanguageOption | undefined {
  return EXTENDED_LANGUAGE_OPTIONS.find((lang) => lang.value === code);
}

/**
 * Search languages by name
 */
export function searchLanguages(query: string): readonly ExtendedLanguageOption[] {
  const lowerQuery = query.toLowerCase();
  return EXTENDED_LANGUAGE_OPTIONS.filter(
    (lang) =>
      lang.label.toLowerCase().includes(lowerQuery) ||
      lang.nativeName.toLowerCase().includes(lowerQuery) ||
      lang.value.toLowerCase().includes(lowerQuery)
  );
}
