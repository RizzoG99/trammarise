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
      className={`flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 ${className}`}
    >
      {icon && <div className="mb-4 text-gray-400 dark:text-gray-500">{icon}</div>}
      <Heading level="h3" className="mb-2 text-gray-900 dark:text-white">
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
