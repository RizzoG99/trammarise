import type { LanguageCode } from '../../../types/languages';
import { LANGUAGE_OPTIONS } from '../../../types/languages';
import { Text } from '@/lib';

export interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div>
      <label htmlFor="language-select" className="block mb-2">
        <Text variant="body" color="primary" className="font-medium">
          Language
        </Text>
      </label>
      <select
        id="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value as LanguageCode)}
        className="
          w-full px-4 py-3 rounded-lg
          bg-[var(--color-bg-surface)] border border-border
          text-text-primary
          focus:outline-none focus:border-primary
          transition-colors
        "
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
