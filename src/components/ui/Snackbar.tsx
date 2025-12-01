import React, { useEffect } from 'react';
import './Snackbar.css';

export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

interface SnackbarProps {
  message: string;
  variant?: SnackbarVariant;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  variant = 'info',
  isOpen,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`snackbar snackbar-${variant}`}>
      <span className="snackbar-message">{message}</span>
      <button className="snackbar-close" onClick={onClose} aria-label="Close">
        <CloseIcon />
      </button>
    </div>
  );
};
