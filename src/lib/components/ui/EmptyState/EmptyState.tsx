import React from 'react';
import { Button } from '../Button/Button';
import { Heading } from '../Heading/Heading';
import { Text } from '../Text/Text';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border ${className}`}
      style={{ backgroundColor: 'var(--color-bg-surface)' }}
    >
      {icon && <div className="mb-4 text-text-tertiary">{icon}</div>}
      <Heading level="h3" className="mb-2">
        {title}
      </Heading>
      {description && (
        <Text variant="body" color="secondary" className="mb-6 max-w-sm">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
