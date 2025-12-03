import React, { useEffect } from 'react';

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

  const variantStyles = {
    success: 'bg-[#4caf50] text-white',
    error: 'bg-[#f44336] text-white',
    warning: 'bg-[#ff9800] text-white',
    info: 'bg-[#2196f3] text-white',
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 py-4 px-6 rounded-lg shadow-lg z-[1000] min-w-[300px] max-w-[500px] animate-[slideIn_0.3s_ease-out] ${variantStyles[variant]}`}>
      <span className="flex-1 text-[0.95rem] leading-snug">{message}</span>
      <button 
        className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center rounded transition-colors shrink-0 hover:bg-black/10" 
        onClick={onClose} 
        aria-label="Close"
      >
        <div className="w-[18px] h-[18px]">
          <CloseIcon />
        </div>
      </button>
    </div>
  );
};
