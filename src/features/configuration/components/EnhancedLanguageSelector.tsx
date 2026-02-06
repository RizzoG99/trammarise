import { useState, useMemo } from 'react';
import { Search, Globe, ChevronDown } from 'lucide-react';
import { Text } from '@/lib';
import {
  EXTENDED_LANGUAGE_OPTIONS,
  POPULAR_LANGUAGES,
  searchLanguages,
  type ExtendedLanguageOption,
} from '../../../types/languages-extended';

export interface EnhancedLanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Enhanced Language Selector with 50+ languages
 *
 * Features:
 * - Auto-detection support
 * - Search functionality
 * - Popular languages section
 * - Grouped by region
 * - Native language names
 */
export function EnhancedLanguageSelector({
  value,
  onChange,
  disabled = false,
}: EnhancedLanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get selected language option
  const selectedLanguage = useMemo(() => {
    return EXTENDED_LANGUAGE_OPTIONS.find((lang) => lang.value === value) || POPULAR_LANGUAGES[0];
  }, [value]);

  // Filter languages by search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return EXTENDED_LANGUAGE_OPTIONS;
    }
    return searchLanguages(searchQuery);
  }, [searchQuery]);

  // Group languages by popular vs all
  const popularLanguages = useMemo(() => {
    return filteredLanguages.filter((lang) => lang.popular);
  }, [filteredLanguages]);

  const otherLanguages = useMemo(() => {
    return filteredLanguages.filter((lang) => !lang.popular);
  }, [filteredLanguages]);

  const handleSelect = (language: ExtendedLanguageOption) => {
    onChange(language.value);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      {/* Label */}
      <label htmlFor="language-selector" className="block mb-2">
        <Text variant="body" color="primary" className="font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Language
        </Text>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        id="language-selector"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg text-left
          bg-[var(--color-bg-surface)] border border-border
          text-text-primary
          focus:outline-none focus:border-primary
          transition-colors
          flex items-center justify-between gap-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-border-hover cursor-pointer'}
        `}
      >
        <span className="flex-1 truncate">
          {selectedLanguage.label}
          {selectedLanguage.value !== 'auto' && (
            <span className="text-text-secondary ml-2 text-sm">
              ({selectedLanguage.nativeName})
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />

          {/* Dropdown Content */}
          <div className="absolute z-20 w-full mt-2 bg-bg-surface border border-border rounded-lg shadow-xl max-h-96 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-border sticky top-0 bg-bg-surface">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search languages..."
                  className="
                    w-full pl-10 pr-3 py-2 rounded-md
                    bg-bg-primary border border-border
                    text-text-primary placeholder:text-text-tertiary
                    focus:outline-none focus:border-primary
                    text-sm
                  "
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Language List */}
            <div className="overflow-y-auto max-h-[300px]">
              {filteredLanguages.length === 0 ? (
                <div className="p-4 text-center text-text-secondary text-sm">
                  No languages found
                </div>
              ) : (
                <>
                  {/* Popular Languages */}
                  {popularLanguages.length > 0 && !searchQuery && (
                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-text-tertiary uppercase tracking-wider bg-bg-primary">
                        Popular
                      </div>
                      {popularLanguages.map((language) => (
                        <button
                          key={language.value}
                          type="button"
                          onClick={() => handleSelect(language)}
                          className={`
                            w-full px-4 py-2.5 text-left hover:bg-bg-hover
                            transition-colors flex items-center justify-between
                            ${language.value === value ? 'bg-primary/10 text-primary' : ''}
                          `}
                        >
                          <span className="flex-1">
                            <span className="font-medium">{language.label}</span>
                            {language.value !== 'auto' && (
                              <span className="text-text-secondary ml-2 text-sm">
                                {language.nativeName}
                              </span>
                            )}
                          </span>
                          {language.value === value && (
                            <span className="text-primary text-sm">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Other Languages */}
                  {otherLanguages.length > 0 && !searchQuery && (
                    <div>
                      <div className="px-3 py-2 text-xs font-medium text-text-tertiary uppercase tracking-wider bg-bg-primary border-t border-border">
                        All Languages
                      </div>
                      {otherLanguages.map((language) => (
                        <button
                          key={language.value}
                          type="button"
                          onClick={() => handleSelect(language)}
                          className={`
                            w-full px-4 py-2.5 text-left hover:bg-bg-hover
                            transition-colors flex items-center justify-between text-sm
                            ${language.value === value ? 'bg-primary/10 text-primary' : ''}
                          `}
                        >
                          <span className="flex-1">
                            <span>{language.label}</span>
                            <span className="text-text-secondary ml-2">{language.nativeName}</span>
                          </span>
                          {language.value === value && <span className="text-primary">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search Results (no grouping) */}
                  {searchQuery && (
                    <div>
                      {filteredLanguages.map((language) => (
                        <button
                          key={language.value}
                          type="button"
                          onClick={() => handleSelect(language)}
                          className={`
                            w-full px-4 py-2.5 text-left hover:bg-bg-hover
                            transition-colors flex items-center justify-between
                            ${language.value === value ? 'bg-primary/10 text-primary' : ''}
                          `}
                        >
                          <span className="flex-1">
                            <span className="font-medium">{language.label}</span>
                            {language.value !== 'auto' && (
                              <span className="text-text-secondary ml-2 text-sm">
                                {language.nativeName}
                              </span>
                            )}
                          </span>
                          {language.value === value && (
                            <span className="text-primary text-sm">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
