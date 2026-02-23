import React from 'react';

/**
 * Button style variants
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'outline'
  | 'ghost'
  | 'small'
  | 'large'
  | 'circle'
  | 'circle-thick';

/**
 * Button component properties
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Optional icon element to display before children */
  icon?: React.ReactNode;
  /** Button content */
  children?: React.ReactNode;
}

/**
 * A versatile button component with multiple style variants and built-in icon support.
 *
 * Supports 10 different variants:
 * - **primary**: Main call-to-action button with indigo background
 * - **secondary**: Secondary action with lighter styling
 * - **success**: Positive action with emerald background
 * - **danger**: Destructive action with red background
 * - **outline**: Subtle outlined button
 * - **ghost**: Minimal button with no border/background, only hover effect (perfect for icon buttons)
 * - **small**: Compact button with reduced padding
 * - **large**: Prominent button with increased padding
 * - **circle**: Circular button for icon-only actions
 * - **circle-thick**: Larger circular button with success styling
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Save Changes
 * </Button>
 *
 * // Button with icon
 * <Button variant="success" icon={<CheckIcon />}>
 *   Confirm
 * </Button>
 *
 * // Circular icon button
 * <Button variant="circle" icon={<PlusIcon />} aria-label="Add item" />
 * ```
 *
 * @param props - Button properties
 * @param props.variant - Button style variant (default: 'primary')
 * @param props.icon - Optional icon to display before children
 * @param props.children - Button content (text or elements)
 * @param props.className - Additional CSS classes to merge with variant styles
 * @param props.disabled - Disable button interaction and apply disabled styling
 * @param props....rest - All standard HTML button attributes
 *
 * @returns React button element
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg ' +
    'font-medium transition-all relative overflow-hidden whitespace-nowrap ' +
    'cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variants = {
    primary:
      'bg-indigo-600 text-white shadow-lg border-2 border-indigo-600 ' +
      'hover:bg-indigo-700 hover:border-indigo-700 hover:-translate-y-0.5 hover:shadow-xl',
    secondary:
      'bg-slate-100 dark:bg-slate-800 border-2 border-primary/50 ' +
      'text-slate-900 dark:text-white hover:bg-primary/10 dark:hover:bg-primary/20 ' +
      'hover:border-primary shadow-md',
    success:
      'bg-emerald-600 text-white border-2 border-emerald-700 ' +
      'hover:bg-emerald-700 hover:-translate-y-0.5 shadow-md',
    danger: 'bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 shadow-md',
    outline:
      'bg-slate-50 dark:bg-slate-800/90 border-2 border-border ' +
      'text-slate-900 dark:text-white hover:border-primary hover:bg-primary/10 shadow-sm',
    ghost:
      'bg-transparent text-slate-500 dark:text-slate-400 ' +
      'hover:text-primary dark:hover:text-primary p-2 gap-1.5',
    small: 'px-3 py-1 text-sm',
    large: 'px-8 py-4 text-lg',
    circle: 'w-12 h-12 rounded-full p-0',
    'circle-thick':
      'w-16 h-16 rounded-full p-0 bg-emerald-600 text-white ' +
      'hover:bg-emerald-700 hover:scale-110 hover:shadow-lg ' +
      'flex-shrink-0 border-2 border-emerald-700',
  };

  /**
   * Combines base classes with variant-specific classes
   */
  const getVariantClasses = (v: ButtonVariant): string => {
    // Ghost variant uses minimal base classes (no default padding/gap)
    if (v === 'ghost') {
      return `inline-flex items-center justify-center rounded-full
              font-medium transition-all relative cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed ${variants[v]}`;
    }

    // Size modifiers build on base classes
    if (v === 'small' || v === 'large') {
      return `${baseClasses} ${variants[v]}`;
    }

    // Circle variants need centered content
    if (v === 'circle' || v === 'circle-thick') {
      return `${baseClasses} ${variants[v]} justify-center`;
    }

    // Standard variants
    return `${baseClasses} ${variants[v]}`;
  };

  const classes = `${getVariantClasses(variant)} ${className}`.trim();

  return (
    <button type={type} className={classes} {...props}>
      {icon && <span className="flex items-center justify-center w-5 h-5">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
