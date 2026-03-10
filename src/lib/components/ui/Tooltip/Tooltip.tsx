import { useState } from 'react';
import type { ReactNode } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Tooltip - Accessible tooltip that shows on hover/focus.
 * Supports 4 placement positions using CSS positioning.
 */
export function Tooltip({ content, children, placement = 'top', className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={[
            'absolute z-50 whitespace-nowrap pointer-events-none',
            'px-2.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-medium',
            'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]',
            'border border-[var(--color-border)] shadow-lg',
            'animate-in fade-in duration-150',
            placementClasses[placement],
          ].join(' ')}
        >
          {content}
        </span>
      )}
    </span>
  );
}
