import type { ReactNode, CSSProperties } from 'react';

export interface GlassCardProps {
  variant?: 'light' | 'dark' | 'primary' | 'glow';
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
    light:
      'bg-white/80 dark:bg-slate-900/40 border-white/20 dark:border-white/10 shadow-lg backdrop-blur-md',
    dark: 'bg-[var(--color-bg-surface)] border-[var(--color-border)] shadow-xl backdrop-blur-xl',
    primary:
      'bg-blue-500/10 dark:bg-blue-500/5 border-blue-200/50 dark:border-blue-500/20 shadow-lg shadow-blue-500/5 backdrop-blur-md',
    glow: 'bg-slate-900/40 dark:bg-slate-900/30 border-white/10 dark:border-white/5 shadow-[0_0_15px_rgba(59,130,246,0.1)] backdrop-blur-xl',
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
      `
        .trim()
        .replace(/\s+/g, ' ')}
      style={style}
    >
      {children}
    </div>
  );
}
