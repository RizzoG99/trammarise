import React from 'react';

/**
 * RadioCard component properties
 */
export interface RadioCardProps {
  /** Radio group name (all related cards should share same name) */
  name: string;
  /** Unique value for this radio option */
  value: string;
  /** Whether this option is selected */
  checked: boolean;
  /** Callback when this option is selected */
  onChange: (value: string) => void;
  /** Title text or element */
  title: React.ReactNode;
  /** Optional description text below title */
  description?: string;
  /** Optional badge element shown between title and radio indicator (e.g. a credits tag) */
  badge?: React.ReactNode;
  /** Size variant — 'md' (default) for standard cards, 'sm' for compact/inline usage */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
  /** Disable this radio option */
  disabled?: boolean;
}

/**
 * A card-style radio button for selecting from multiple options.
 *
 * Features:
 * - **Card layout** with title, optional description, and optional badge
 * - **Visual selection indicator** with colored border and background
 * - **Radio button dot** that appears when selected
 * - **Hover effects** for better interactivity
 * - **Dark mode support**
 * - **Accessible** with proper radio semantics
 * - **Keyboard navigation** support
 * - **Disabled state** support
 *
 * @example
 * ```tsx
 * // Basic radio group
 * const [plan, setPlan] = useState('basic');
 *
 * <RadioCard
 *   name="plan"
 *   value="basic"
 *   checked={plan === 'basic'}
 *   onChange={setPlan}
 *   title="Basic Plan"
 *   description="Perfect for individuals"
 * />
 *
 * // Compact with badge (e.g. processing mode selector)
 * <RadioCard
 *   size="sm"
 *   name="mode"
 *   value="balanced"
 *   checked={mode === 'balanced'}
 *   onChange={setMode}
 *   title="Balanced"
 *   description="Faster processing"
 *   badge={<span className="...">1 credit</span>}
 * />
 * ```
 */
export const RadioCard: React.FC<RadioCardProps> = ({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  badge,
  size = 'md',
  className = '',
  disabled = false,
}) => {
  const padding = size === 'sm' ? 'p-3' : 'p-4';
  const titleSize = size === 'sm' ? 'text-sm font-medium' : 'text-base font-semibold';

  const baseClasses = `
    block relative rounded-xl bg-bg-surface
    border-2 border-border
    transition-all duration-200 overflow-hidden
  `.trim();

  const interactiveClasses = disabled
    ? 'cursor-not-allowed opacity-50'
    : 'cursor-pointer hover:bg-bg-surface-hover hover:border-primary';

  const checkedClasses = checked
    ? 'bg-primary/10 border-primary shadow-[0_0_0_1px_var(--color-primary)]'
    : '';

  const labelClasses = `${baseClasses} ${interactiveClasses} ${checkedClasses} ${className}`.trim();

  const radioIndicatorClasses = `
    w-5 h-5 rounded-full border-2 relative transition-all duration-200 flex-shrink-0
    ${
      checked
        ? 'border-primary bg-primary after:content-[""] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-2 after:h-2 after:rounded-full after:bg-white'
        : 'border-border'
    }
  `.trim();

  return (
    <label className={labelClasses}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
        disabled={disabled}
        aria-label={typeof title === 'string' ? title : undefined}
      />
      <div className={padding}>
        <div className="flex justify-between items-center mb-1">
          <div className={`flex items-center gap-2 ${titleSize} text-text-primary`}>
            {title}
            {badge}
          </div>
          <div className={radioIndicatorClasses} aria-hidden="true" />
        </div>
        {description && (
          <div className="text-sm text-text-secondary leading-snug">{description}</div>
        )}
      </div>
    </label>
  );
};
