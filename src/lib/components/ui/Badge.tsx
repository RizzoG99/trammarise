import React from 'react';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-secondary)',
  },
  secondary: {
    backgroundColor: 'var(--color-primary-alpha-10)',
    color: 'var(--color-primary)',
  },
  success: {
    backgroundColor: 'var(--color-accent-success-alpha-10)',
    color: 'var(--color-accent-success)',
  },
  warning: {
    backgroundColor: 'var(--color-accent-warning-alpha-10)',
    color: 'var(--color-accent-warning)',
  },
  error: {
    backgroundColor: 'var(--color-accent-error-alpha-10)',
    color: 'var(--color-accent-error)',
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

export function Badge({
  className = '',
  variant = 'default',
  size = 'md',
  style,
  ...props
}: BadgeProps) {
  const classes = [
    'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes} style={{ ...variantStyles[variant], ...style }} {...props} />;
}
