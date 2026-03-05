import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: '1400px' | '1200px' | 'full';
  className?: string;
}

/**
 * Centralized page layout component
 * Provides consistent structure across all pages with:
 * - Main content area with max-width constraint
 * - Consistent background colors for light/dark mode
 */
export function PageLayout({ children, maxWidth = '1400px', className = '' }: PageLayoutProps) {
  const maxWidthClass =
    maxWidth === 'full' ? 'max-w-full' : maxWidth === '1200px' ? 'max-w-5xl' : 'max-w-7xl';

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <main className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 ${maxWidthClass} ${className}`}>
        {children}
      </main>
    </div>
  );
}
