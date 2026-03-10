import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button';
import type { ButtonVariant } from '../Button';

/**
 * Action button configuration for Modal footer
 */
export interface ModalAction {
  /** Button label text */
  label: string;
  /** Click handler for the action */
  onClick: () => void;
  /** Button visual variant */
  variant?: ButtonVariant;
}

/**
 * Modal component properties
 */
// Extend HTMLDivElement attributes to allow aria-*, role, etc.
export interface ModalProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'children' | 'className'
> {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal header title */
  title: string;
  /** Modal body content */
  children: React.ReactNode;
  /** Optional action buttons for modal footer */
  actions?: ModalAction[];
  /** Prevent closing when clicking backdrop */
  disableBackdropClick?: boolean;
  /** Hide the close button in header */
  hideCloseButton?: boolean;
  /** Hide the entire header (useful for custom title blocks) */
  hideHeader?: boolean;
  /** Additional CSS classes for modal content */
  className?: string;
}

/**
 * A versatile modal dialog component with backdrop, animations, and configurable actions.
 * ...
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  disableBackdropClick = false,
  hideCloseButton = false,
  hideHeader = false,
  className = '',
  ...rest
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen || disableBackdropClick) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, disableBackdropClick]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!disableBackdropClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease-out]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={!hideHeader ? 'modal-title' : undefined}
      aria-label={hideHeader ? title : undefined}
      {...rest}
    >
      <div
        className={`bg-bg-surface rounded-xl w-[90%] max-h-[80vh] overflow-y-auto shadow-2xl border border-border animate-[slideUp_0.3s_ease-out] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 id="modal-title" className="m-0 text-2xl text-text-primary">
              {title}
            </h2>
            {!hideCloseButton && (
              <button
                className="bg-transparent border-none text-[2rem] text-text-tertiary cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-all hover:bg-bg-surface hover:text-text-primary"
                onClick={onClose}
                aria-label="Close modal"
                type="button"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 text-text-secondary leading-relaxed">{children}</div>

        {/* Footer with actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-border justify-end">
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant || 'primary'} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
