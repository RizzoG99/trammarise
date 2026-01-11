import type { ReactNode } from 'react';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'hero';

export interface HeadingProps {
  level: HeadingLevel;
  children: ReactNode;
  className?: string;
}

/**
 * Heading - Typography component for hierarchical heading structure.
 *
 * Features:
 * - **4 Levels**: hero (largest), h1, h2, h3
 * - **Semantic HTML**: Renders appropriate heading tag (h1, h2, h3)
 * - **CSS Variables**: Uses design system tokens for font sizes
 * - **Dark Mode**: Full dark mode support
 * - **Customizable**: Supports className for additional styling
 *
 * @example
 * ```tsx
 * // Hero heading for landing pages
 * <Heading level="hero">Welcome to Trammarise</Heading>
 *
 * // H1 for page titles
 * <Heading level="h1">Audio Transcription</Heading>
 *
 * // H2 for section headings
 * <Heading level="h2">Getting Started</Heading>
 *
 * // H3 for subsections
 * <Heading level="h3">Upload Your File</Heading>
 *
 * // With custom styling
 * <Heading level="h1" className="text-blue-600">Custom Color</Heading>
 * ```
 *
 * @param props - Heading properties
 * @param props.level - Heading hierarchy level ('hero', 'h1', 'h2', 'h3')
 * @param props.children - Heading text content
 * @param props.className - Additional CSS classes
 *
 * @returns Semantic heading element
 */
export function Heading({ level, children, className = '' }: HeadingProps) {
  const baseClasses = 'font-semibold text-text-primary';

  const levelClasses = {
    hero: 'text-[var(--font-size-hero)] leading-tight',
    h1: 'text-[var(--font-size-h1)] leading-tight',
    h2: 'text-[var(--font-size-h2)] leading-snug',
    h3: 'text-[var(--font-size-h3)] leading-normal',
  };

  const Component = level === 'hero' ? 'h1' : level;

  return (
    <Component className={`${baseClasses} ${levelClasses[level]} ${className}`}>
      {children}
    </Component>
  );
}
