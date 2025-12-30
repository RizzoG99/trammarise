import type { ReactNode } from 'react';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'hero';

export interface HeadingProps {
  level: HeadingLevel;
  children: ReactNode;
  className?: string;
}

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
