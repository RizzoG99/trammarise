import { useTranslation } from 'react-i18next';
import { Button } from '@/lib';
import { useState, useRef, useEffect } from 'react';

// Language configuration
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  const currentLang =
    LANGUAGES.find((l) => l.code === (i18n.resolvedLanguage || i18n.language)) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 px-3"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Language selection menu"
          className="absolute right-0 mt-2 min-w-[80px] py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 backdrop-blur-md"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = (i18n.resolvedLanguage || i18n.language) === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                aria-current={isSelected ? 'true' : undefined}
                className={`
                  w-full text-center px-4 py-2 text-sm font-medium
                  transition-colors duration-150 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-[var(--color-primary-alpha-10)] text-primary'
                      : 'text-[var(--color-text-primary)]'
                  }
                  ${!isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                `}
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.code.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
