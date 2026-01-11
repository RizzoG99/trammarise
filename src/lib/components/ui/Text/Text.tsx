import type { ReactNode, CSSProperties } from 'react';

export type TextVariant = 'body' | 'caption' | 'small';
export type TextColor = 'primary' | 'secondary' | 'tertiary';

export interface TextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div';
  style?: CSSProperties;
  title?: string;
}

/**
 * Text - Typography component for body text, captions, and small text.
 *
 * Features:
 * - **3 Size Variants**: body (default), caption (smaller), small (smallest)
 * - **3 Color Levels**: primary (high contrast), secondary (medium), tertiary (low)
 * - **Semantic HTML**: Renders as p, span, or div based on context
 * - **CSS Variables**: Uses design system tokens
 * - **Dark Mode**: Full dark mode support
 * - **Customizable**: Supports className and style props
 *
 * @example
 * ```tsx
 * // Body text (default)
 * <Text>This is regular paragraph text.</Text>
 *
 * // Caption text for labels
 * <Text variant="caption" color="secondary">
 *   Form field label
 * </Text>
 *
 * // Small text for metadata
 * <Text variant="small" color="tertiary">
 *   Last updated: 2 hours ago
 * </Text>
 *
 * // Inline text with span
 * <Text as="span" color="secondary">
 *   Inline text within a paragraph
 * </Text>
 *
 * // With custom styling
 * <Text className="font-bold" style={{ marginTop: '1rem' }}>
 *   Custom styled text
 * </Text>
 * ```
 *
 * @param props - Text properties
 * @param props.variant - Text size variant (default: 'body')
 * @param props.color - Text color based on hierarchy (default: 'primary')
 * @param props.as - HTML element to render (default: 'p')
 * @param props.children - Text content
 * @param props.className - Additional CSS classes
 * @param props.style - Inline styles
 * @param props.title - HTML title attribute for tooltips
 *
 * @returns Semantic text element
 */
export function Text({
  variant = 'body',
  color = 'primary',
  children,
  className = '',
  as: Component = 'p',
  style,
  title,
}: TextProps) {
  const variantClasses = {
    body: 'text-[var(--font-size-body)] leading-relaxed',
    caption: 'text-[var(--font-size-caption)] leading-normal',
    small: 'text-[var(--font-size-small)] leading-normal',
  };

  const colorClasses = {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
  };

  return (
    <Component 
      className={`${variantClasses[variant]} ${colorClasses[color]} ${className}`}
      style={style}
      title={title}
    >
      {children}
    </Component>
  );
}
