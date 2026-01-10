import type { ReactNode, CSSProperties } from 'react';

export interface GlassCardProps {
  variant?: 'light' | 'dark' | 'primary';
  blur?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * GlassCard - A glass morphism design component with customizable blur and variants.
 *
 * Features:
 * - **3 Variants**: light, dark, primary (brand color)
 * - **3 Blur Levels**: sm (subtle), md (balanced), lg (heavy)
 * - **CSS Variables**: Uses design system tokens for theming
 * - **Dark Mode**: Full dark mode support via CSS variables
 * - **Customizable**: Supports className and style props
 *
 * @example
 * ```tsx
 * // Light glass card with medium blur
 * <GlassCard variant="light" blur="md">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </GlassCard>
 *
 * // Primary variant with large blur
 * <GlassCard variant="primary" blur="lg">
 *   <p>Brand-colored glass card</p>
 * </GlassCard>
 *
 * // With custom styling
 * <GlassCard className="max-w-md hover:scale-105" style={{ padding: '2rem' }}>
 *   <p>Custom styled card</p>
 * </GlassCard>
 * ```
 *
 * @param props - GlassCard properties
 * @param props.variant - Visual style variant (default: 'light')
 * @param props.blur - Backdrop blur intensity (default: 'md')
 * @param props.children - Card content
 * @param props.className - Additional CSS classes
 * @param props.style - Inline styles
 *
 * @returns Glass morphism card component
 */
export function GlassCard({
  variant = 'light',
  blur = 'md',
  children,
  className = '',
  style,
}: GlassCardProps) {
  const variantClasses = {
    light: 'bg-[var(--glass-bg-light)] border-[var(--glass-border)]',
    dark: 'bg-[var(--glass-bg)] border-[var(--glass-border)]',
    primary: 'bg-[var(--color-primary-alpha-10)] border-[var(--color-primary-alpha-20)]',
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${blurClasses[blur]}
        border
        rounded-[var(--radius-lg)]
        shadow-[var(--shadow-glass)]
        transition-all duration-[var(--transition-normal)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={style}
    >
      {children}
    </div>
  );
}
