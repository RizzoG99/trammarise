import { useMemo } from 'react';
import { Select, type SelectGroup, type SelectOption } from '@/lib/components/ui';
import { EXTENDED_LANGUAGE_OPTIONS } from '../../../types/languages-extended';

export interface EnhancedLanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Enhanced Language Selector with 50+ languages
 *
 * Features:
 * - Uses shared Select component
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
  // Prepare grouped options for Select component
  const languageOptions = useMemo(() => {
    const popular: SelectOption[] = [];
    const others: SelectOption[] = [];

    EXTENDED_LANGUAGE_OPTIONS.forEach((lang) => {
      const option: SelectOption = {
        value: lang.value,
        label: lang.label,
        nativeName: lang.nativeName, // Custom property for rendering
      };

      if (lang.popular) {
        popular.push(option);
      } else {
        others.push(option);
      }
    });

    const groups: SelectGroup[] = [];

    if (popular.length > 0) {
      groups.push({
        label: 'Popular',
        options: popular,
      });
    }

    if (others.length > 0) {
      groups.push({
        label: 'All Languages',
        options: others,
      });
    }

    return groups;
  }, []);

  // Custom renderer for options in the dropdown
  const renderOption = (option: SelectOption, isSelected: boolean) => (
    <>
      <span className="flex-1">
        <span className={isSelected ? 'font-medium' : ''}>{option.label}</span>
        {option.value !== 'auto' && (option.nativeName as string) && (
          <span className="text-text-secondary ml-2 text-sm">({option.nativeName as string})</span>
        )}
      </span>
      {isSelected && <span className="text-primary text-sm">✓</span>}
    </>
  );

  // Custom renderer for the selected value trigger
  const renderValue = (option: SelectOption | null) => {
    if (!option) return <span>Select a language</span>;
    return (
      <span className="flex-1 truncate">
        {option.label}
        {option.value !== 'auto' && (option.nativeName as string) && (
          <span className="text-text-secondary ml-2 text-sm">({option.nativeName as string})</span>
        )}
      </span>
    );
  };

  return (
    <Select
      className="w-full"
      label="Language"
      value={value}
      onChange={onChange}
      options={languageOptions}
      disabled={disabled}
      searchable
      searchPlaceholder="Search languages..."
      renderOption={renderOption}
      renderValue={renderValue}
    />
  );
}
