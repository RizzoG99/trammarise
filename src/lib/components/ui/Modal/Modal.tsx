import React, { useEffect } from 'react';
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
  className = '',
  ...rest
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease-out]"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      {...rest}
    >
      <div
        className={`bg-white dark:bg-[#1e1e1e] rounded-xl max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto shadow-2xl animate-[slideUp_0.3s_ease-out] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#333]">
          <h2 id="modal-title" className="m-0 text-2xl text-[#333] dark:text-white">
            {title}
          </h2>
          <button
            className="bg-transparent border-none text-[2rem] text-[#999] cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded transition-all hover:bg-gray-100 hover:text-[#333] dark:hover:bg-[#333] dark:hover:text-white"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-[#555] dark:text-[#ccc] leading-relaxed">{children}</div>

        {/* Footer with actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-[#333] justify-end">
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant || 'primary'} onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
