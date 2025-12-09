import React from 'react';

/**
 * ToggleSwitch component properties
 */
export interface ToggleSwitchProps {
  /** Label text displayed next to the switch */
  label: string;
  /** Current checked state */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Disable the toggle */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Optional description text below label */
  description?: string;
}

/**
 * A toggle switch component for binary on/off states.
 *
 * Features:
 * - **Animated transition** between on/off states
 * - **Visual feedback** with color changes (indigo when on, gray when off)
 * - **Dark mode support** with proper contrast
 * - **Hover effects** for better interactivity
 * - **Disabled state** support
 * - **Accessible** with proper click target and keyboard support
 * - **Optional description** for additional context
 *
 * @example
 * ```tsx
 * // Basic toggle
 * <ToggleSwitch
 *   label="Enable notifications"
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 * />
 *
 * // With description
 * <ToggleSwitch
 *   label="Dark Mode"
 *   description="Use dark theme for better visibility at night"
 *   checked={isDarkMode}
 *   onChange={setIsDarkMode}
 * />
 *
 * // Disabled state
 * <ToggleSwitch
 *   label="Premium Feature"
 *   checked={false}
 *   onChange={() => {}}
 *   disabled={true}
 * />
 * ```
 *
 * @param props - ToggleSwitch properties
 * @param props.label - Text label displayed next to the switch
 * @param props.checked - Current checked state (true = on, false = off)
 * @param props.onChange - Callback invoked with new checked state when toggled
 * @param props.disabled - If true, prevents interaction and applies disabled styling
 * @param props.className - Additional CSS classes to apply to wrapper
 * @param props.description - Optional description text shown below label
 *
 * @returns ToggleSwitch element
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  description,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const wrapperClasses = `
    flex items-start gap-3 py-2 select-none
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}
    ${className}
  `.trim();

  const trackClasses = `
    relative w-11 h-6 rounded-full transition-colors border
    ${checked
      ? 'bg-indigo-600 border-indigo-600'
      : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'}
    ${!disabled && !checked ? 'group-hover:border-slate-400 dark:group-hover:border-slate-500' : ''}
  `.trim();

  const thumbClasses = `
    absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full
    transition-transform shadow-sm
    ${checked ? 'translate-x-5' : ''}
  `.trim();

  return (
    <div
      className={wrapperClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <div className={trackClasses}>
        <div className={thumbClasses} />
      </div>
      <div className="flex-1">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {label}
        </span>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
