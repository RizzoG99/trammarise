import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: '1400px' | '1200px' | 'full';
  className?: string;
}

/**
 * Centralized page layout component
 * Provides consistent structure across all pages with:
 * - AppHeader
 * - Main content area with max-width constraint
 * - Consistent background colors for light/dark mode
 */
export function PageLayout({ 
  children, 
  maxWidth = '1400px',
  className = '' 
}: PageLayoutProps) {
  const maxWidthClass = maxWidth === 'full' 
    ? 'max-w-full' 
    : `max-w-[${maxWidth}]`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <main className={`mx-auto px-6 py-6 ${maxWidthClass} ${className}`}>
        {children}
      </main>
    </div>
  );
}
