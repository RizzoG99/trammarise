import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { Text } from '@/lib/components/ui';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  [key: string]: unknown;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  /** The currently selected value */
  value: string;
  /** Callback when an option is selected */
  onChange: (value: string) => void;
  /** Array of options or groups to display */
  options: SelectOption[] | SelectGroup[];
  /** Label for the select input */
  label?: string;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Enable search functionality within the dropdown */
  searchable?: boolean;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Custom class name for the container */
  className?: string;
  /** Error message to display */
  error?: string;
  /** Optional callback for external search handling */
  onSearch?: (query: string) => void;
  /** Custom renderer for options */
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  /** Custom renderer for the selected value */
  renderValue?: (option: SelectOption | null) => React.ReactNode;
}

/**
 * A custom Select component that replaces native <select>.
 * Supports search, icons, grouping, and custom styling.
 */
export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select an option',
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
  error,
  onSearch,
  renderOption,
  renderValue,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      // Small timeout to allow animation to start/render
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  // Handle external search
  useEffect(() => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      // Small timeout to ensure DOM is updated
      setTimeout(() => {
        const optionElements = containerRef.current?.querySelectorAll('[role="option"]');
        optionElements?.[highlightedIndex]?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }, 0);
    }
  }, [highlightedIndex, isOpen]);

  // Helper to check if options are grouped
  const isGrouped = (opts: SelectOption[] | SelectGroup[]): opts is SelectGroup[] => {
    return opts.length > 0 && 'options' in opts[0];
  };

  // Flatten options for easy finding of selected option
  const allOptions = useMemo(() => {
    if (isGrouped(options)) {
      return options.flatMap((group) => group.options);
    }
    return options as SelectOption[];
  }, [options]);

  // Find the selected option object
  const selectedOption = allOptions.find((opt) => opt.value === value);

  // Filter options based on search query (if not handled externally)
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;

    // If onSearch is provided, we assume the parent handles filtering
    // effectively, but strictly speaking checking onSearch existence isn't enough
    // usually external search implies options prop updates.
    // However, if onSearch NOT provided, we filter internally.
    if (onSearch) return options;

    const query = searchQuery.toLowerCase();

    if (isGrouped(options)) {
      return options
        .map((group) => ({
          ...group,
          options: group.options.filter((opt) => opt.label.toLowerCase().includes(query)),
        }))
        .filter((group) => group.options.length > 0);
    }

    return (options as SelectOption[]).filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchQuery, searchable, onSearch]);

  // Flatten filtered options for keyboard navigation
  const flattenedFilteredOptions = useMemo(() => {
    if (isGrouped(filteredOptions)) {
      return filteredOptions.flatMap((group) => group.options);
    }
    return filteredOptions as SelectOption[];
  }, [filteredOptions]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [flattenedFilteredOptions]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  // Render a single option
  const renderSingleOption = (option: SelectOption, index: number) => {
    const isSelected = option.value === value;
    const isHighlighted = index === highlightedIndex;

    if (renderOption) {
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => handleSelect(option.value)}
          onMouseEnter={() => setHighlightedIndex(index)}
          role="option"
          aria-selected={isSelected}
          className={`
            w-full px-3 py-2.5 rounded-md text-left text-sm
            transition-colors flex items-center justify-between group
            ${
              isHighlighted
                ? 'bg-primary/10 text-primary'
                : isSelected
                  ? 'bg-primary/5 text-primary'
                  : 'text-text-primary hover:bg-bg-surface-hover'
            }
          `}
        >
          {renderOption(option, isSelected)}
        </button>
      );
    }

    return (
      <button
        key={option.value}
        type="button"
        onClick={() => handleSelect(option.value)}
        onMouseEnter={() => setHighlightedIndex(index)}
        role="option"
        aria-selected={isSelected}
        className={`
          w-full px-3 py-2.5 rounded-md text-left text-sm
          transition-colors flex items-center justify-between group
          ${
            isHighlighted
              ? 'bg-primary/10 text-primary'
              : isSelected
                ? 'bg-primary/5 text-primary'
                : 'text-text-primary hover:bg-bg-surface-hover'
          }
        `}
      >
        <span className="flex items-center gap-2 flex-1 truncate">
          {option.icon}
          <span className={isSelected || isHighlighted ? 'font-medium' : ''}>{option.label}</span>
        </span>
        {isSelected && <Check className="w-4 h-4 text-primary" />}
      </button>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block mb-2">
          <Text variant="body" color="primary" className="font-medium">
            {label}
          </Text>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg text-left
          bg-bg-surface border
          text-text-primary
          focus:outline-none focus:border-primary
          transition-all flex items-center justify-between gap-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
          ${error ? 'border-accent-error' : 'border-border'}
          ${isOpen ? 'border-primary' : ''}
        `}
      >
        <span className={`flex-1 truncate ${!selectedOption ? 'text-text-tertiary' : ''}`}>
          {selectedOption ? (
            renderValue ? (
              renderValue(selectedOption)
            ) : (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            )
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {error && (
        <p className="mt-1 text-xs text-accent-error animate-[slideDown_0.2s_ease-out]">{error}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-bg-surface dark:bg-bg-secondary border border-[var(--color-border)] rounded-lg shadow-xl max-h-96 overflow-hidden animate-[fadeIn_0.1s_ease-out]">
          {searchable && (
            <div className="p-2 border-b border-[var(--color-border)] sticky top-0 bg-bg-surface">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0); // Reset to first option when search changes
                  }}
                  onKeyDown={(e) => {
                    const maxIndex = flattenedFilteredOptions.length - 1;

                    switch (e.key) {
                      case 'ArrowDown':
                        e.preventDefault();
                        setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex));
                        break;
                      case 'ArrowUp':
                        e.preventDefault();
                        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                        break;
                      case 'Enter':
                        e.preventDefault();
                        if (flattenedFilteredOptions[highlightedIndex]) {
                          handleSelect(flattenedFilteredOptions[highlightedIndex].value);
                        }
                        break;
                      case 'Escape':
                        e.preventDefault();
                        setIsOpen(false);
                        break;
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className="
                    w-full pl-10 pr-8 py-2 rounded-md
                    bg-bg-primary
                    border border-[var(--color-border)]
                    text-sm text-text-primary
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                    placeholder:text-text-tertiary
                  "
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[300px] p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-text-secondary text-sm">No options found</div>
            ) : isGrouped(filteredOptions) ? (
              // Render Groups
              (() => {
                let flatIndex = 0;
                return filteredOptions.map((group, groupIndex) => (
                  <div
                    key={group.label}
                    className={groupIndex > 0 ? 'border-t border-border mt-1 pt-1' : ''}
                  >
                    <div className="px-3 py-2 text-xs font-medium text-text-tertiary uppercase tracking-wider bg-bg-primary/50">
                      {group.label}
                    </div>
                    {group.options.map((option) => {
                      const currentIndex = flatIndex++;
                      return renderSingleOption(option, currentIndex);
                    })}
                  </div>
                ));
              })()
            ) : (
              // Render Flat List
              (filteredOptions as SelectOption[]).map((option, index) =>
                renderSingleOption(option, index)
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
