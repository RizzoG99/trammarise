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
  /** Additional CSS classes */
  className?: string;
  /** Disable this radio option */
  disabled?: boolean;
}

/**
 * A card-style radio button for selecting from multiple options.
 *
 * Features:
 * - **Card layout** with title and optional description
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
 * // Radio group for selecting plan
 * const [plan, setPlan] = useState('basic');
 *
 * <div>
 *   <RadioCard
 *     name="plan"
 *     value="basic"
 *     checked={plan === 'basic'}
 *     onChange={setPlan}
 *     title="Basic Plan"
 *     description="Perfect for individuals"
 *   />
 *   <RadioCard
 *     name="plan"
 *     value="pro"
 *     checked={plan === 'pro'}
 *     onChange={setPlan}
 *     title="Pro Plan"
 *     description="Best for teams"
 *   />
 * </div>
 * ```
 *
 * @param props - RadioCard properties
 * @param props.name - Radio group name (all options in group share this)
 * @param props.value - Unique value identifying this option
 * @param props.checked - Whether this option is currently selected
 * @param props.onChange - Callback invoked with value when selected
 * @param props.title - Title text or React element displayed prominently
 * @param props.description - Optional description text shown below title
 * @param props.className - Additional CSS classes to apply
 * @param props.disabled - If true, prevents selection and applies disabled styling
 *
 * @returns RadioCard label element with hidden radio input
 */
export const RadioCard: React.FC<RadioCardProps> = ({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  className = '',
  disabled = false,
}) => {
  const baseClasses = `
    block relative rounded-xl bg-bg-surface
    border-2 border-border
    transition-all duration-200 overflow-hidden
  `.trim();

  const interactiveClasses = disabled
    ? 'cursor-not-allowed opacity-50'
    : 'cursor-pointer hover:bg-bg-surface-hover hover:border-primary/50';

  const checkedClasses = checked
    ? 'bg-primary/10 border-primary shadow-[0_0_0_1px_var(--color-primary)]'
    : '';

  const labelClasses = `${baseClasses} ${interactiveClasses} ${checkedClasses} ${className}`.trim();

  const radioIndicatorClasses = `
    w-5 h-5 rounded-full border-2 relative transition-all duration-200
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
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <div className="font-semibold text-base text-text-primary">{title}</div>
          <div className={radioIndicatorClasses} aria-hidden="true" />
        </div>
        {description && (
          <div className="text-sm text-text-secondary leading-snug">{description}</div>
        )}
      </div>
    </label>
  );
};
