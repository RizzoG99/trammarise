import type { ReactNode } from 'react';

export interface GlassCardProps {
  variant?: 'light' | 'dark' | 'primary';
  blur?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

export function GlassCard({
  variant = 'light',
  blur = 'md',
  children,
  className = '',
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
    >
      {children}
    </div>
  );
}
