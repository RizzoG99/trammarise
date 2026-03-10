import React from 'react';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

export interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
}

const variantStyles: Record<AlertVariant, React.CSSProperties> = {
  info: {
    backgroundColor: 'var(--color-primary-alpha-10)',
    borderColor: 'var(--color-primary-alpha-20)',
    color: 'var(--color-primary)',
  },
  warning: {
    backgroundColor: 'var(--color-accent-warning-alpha-10)',
    borderColor: 'var(--color-accent-warning-alpha-20)',
    color: 'var(--color-accent-warning)',
  },
  error: {
    backgroundColor: 'var(--color-accent-error-alpha-10)',
    borderColor: 'var(--color-accent-error-alpha-20)',
    color: 'var(--color-accent-error)',
  },
  success: {
    backgroundColor: 'var(--color-accent-success-alpha-10)',
    borderColor: 'var(--color-accent-success-alpha-20)',
    color: 'var(--color-accent-success)',
  },
};

export function Alert({ children, variant = 'info', className = '' }: AlertProps) {
  const role = variant === 'error' || variant === 'warning' ? 'alert' : undefined;
  return (
    <div
      role={role}
      className={`p-4 rounded-lg border ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </div>
  );
}
