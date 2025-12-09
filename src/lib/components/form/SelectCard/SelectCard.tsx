import React from 'react';

/**
 * SelectCard component properties
 */
export interface SelectCardProps {
  /** Unique value for this card */
  value: string;
  /** Label text displayed on card */
  label: string;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Whether this card is selected */
  selected: boolean;
  /** Callback when card is clicked */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Optional description text below label */
  description?: string;
  /** Disable interaction */
  disabled?: boolean;
}

/**
 * A selectable card component, ideal for displaying options in a grid layout.
 *
 * Features:
 * - **Icon support** for visual identification
 * - **Selection indicator** (dot in corner when selected)
 * - **Hover effects** with lift animation
 * - **Selected state** with colored border and background
 * - **Dark mode support**
 * - **Accessible** with proper button semantics and aria-pressed
 * - **Flexible layout** works well in grids
 * - **Optional description** for additional context
 *
 * @example
 * ```tsx
 * // Icon grid selection
 * const [selected, setSelected] = useState('video');
 *
 * <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
 *   <SelectCard
 *     value="video"
 *     label="Video"
 *     icon={<VideoIcon />}
 *     selected={selected === 'video'}
 *     onClick={() => setSelected('video')}
 *   />
 *   <SelectCard
 *     value="audio"
 *     label="Audio"
 *     icon={<AudioIcon />}
 *     selected={selected === 'audio'}
 *     onClick={() => setSelected('audio')}
 *   />
 * </div>
 * ```
 *
 * @param props - SelectCard properties
 * @param props.value - Unique identifier for this card
 * @param props.label - Text displayed on the card
 * @param props.icon - Optional icon element to display above label
 * @param props.selected - Whether this card is currently selected
 * @param props.onClick - Callback invoked when card is clicked
 * @param props.className - Additional CSS classes to apply
 * @param props.description - Optional description text below label
 * @param props.disabled - If true, prevents interaction and applies disabled styling
 *
 * @returns SelectCard button element
 */
export const SelectCard: React.FC<SelectCardProps> = ({
  value,
  label,
  icon,
  selected,
  onClick,
  className = '',
  description,
  disabled = false,
}) => {
  const baseClasses = `
    flex flex-col items-center justify-center gap-3 p-5
    bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
    rounded-xl transition-all relative overflow-hidden h-full w-full
    text-slate-900 dark:text-white
  `.trim();

  const interactiveClasses = disabled
    ? 'cursor-not-allowed opacity-50'
    : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 hover:-translate-y-0.5';

  const selectedClasses = selected
    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 shadow-md'
    : '';

  const buttonClasses = `${baseClasses} ${interactiveClasses} ${selectedClasses} ${className}`.trim();

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      aria-pressed={selected}
      aria-label={label}
      disabled={disabled}
      value={value}
    >
      {icon && (
        <div className="text-3xl flex items-center justify-center text-slate-900 dark:text-white">
          {icon}
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-center leading-tight">
          {label}
        </span>
        {description && (
          <span className="text-xs text-slate-500 dark:text-slate-400 text-center leading-tight">
            {description}
          </span>
        )}
      </div>
      {selected && !disabled && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 shadow-sm" />
      )}
    </button>
  );
};
