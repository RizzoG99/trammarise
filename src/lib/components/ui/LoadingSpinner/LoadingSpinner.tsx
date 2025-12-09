import React from 'react';

/**
 * Loading spinner size variants
 */
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * LoadingSpinner component properties
 */
export interface LoadingSpinnerProps {
  /** Size of the spinner (default: 'md') */
  size?: SpinnerSize;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the spinner element itself */
  spinnerClassName?: string;
}

/**
 * A simple, animated loading spinner component with configurable sizes.
 *
 * Features:
 * - **Size Variants**: sm (8x8), md (12x12), lg (16x16), xl (20x20)
 * - **Smooth Animation**: CSS-based spin animation
 * - **Theme Support**: Uses primary color from theme
 * - **Customizable**: Override classes via props
 *
 * @example
 * ```tsx
 * // Default medium spinner
 * <LoadingSpinner />
 *
 * // Small spinner
 * <LoadingSpinner size="sm" />
 *
 * // Large spinner with custom class
 * <LoadingSpinner size="lg" className="my-4" />
 * ```
 *
 * @param props - LoadingSpinner properties
 * @param props.size - Spinner size variant (sm, md, lg, xl)
 * @param props.className - Additional classes for container
 * @param props.spinnerClassName - Additional classes for spinner element
 *
 * @returns React loading spinner element
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  spinnerClassName = '',
}) => {
  // Size mappings for spinner dimensions
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
    xl: 'w-20 h-20 border-[6px]',
  };

  const spinnerClass = `
    ${sizeClasses[size]}
    border-primary/10 border-t-primary
    rounded-full animate-spin
    ${spinnerClassName}
  `.trim();

  return (
    <div className={`flex justify-center items-center p-8 ${className}`}>
      <div className={spinnerClass} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};
