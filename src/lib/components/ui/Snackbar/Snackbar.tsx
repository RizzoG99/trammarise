import React, { useEffect } from 'react';

/**
 * Snackbar visual variants
 */
export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Snackbar component properties
 */
export interface SnackbarProps {
  /** Message text to display */
  message: string;
  /** Visual variant (determines color scheme) */
  variant?: SnackbarVariant;
  /** Controls visibility */
  isOpen: boolean;
  /** Callback when snackbar should close */
  onClose: () => void;
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Close icon SVG component
 */
const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

/**
 * A notification snackbar component with auto-dismiss and multiple visual variants.
 *
 * Features:
 * - **4 variants**: success (green), error (red), warning (orange), info (blue)
 * - **Auto-dismiss**: Automatically closes after specified duration
 * - **Manual close**: Close button for immediate dismissal
 * - **Smooth animations**: Slide-in animation on mount
 * - **Responsive**: Adapts to different screen sizes
 * - **Accessible**: Proper ARIA labels and keyboard support
 *
 * @example
 * ```tsx
 * // Success notification
 * <Snackbar
 *   isOpen={isOpen}
 *   message="File saved successfully!"
 *   variant="success"
 *   onClose={() => setIsOpen(false)}
 * />
 *
 * // Error notification
 * <Snackbar
 *   isOpen={isOpen}
 *   message="Failed to upload file"
 *   variant="error"
 *   onClose={() => setIsOpen(false)}
 *   duration={5000}
 * />
 *
 * // Persistent notification (no auto-dismiss)
 * <Snackbar
 *   isOpen={isOpen}
 *   message="Please review your settings"
 *   variant="warning"
 *   onClose={() => setIsOpen(false)}
 *   duration={0}
 * />
 * ```
 *
 * @param props - Snackbar properties
 * @param props.message - The notification message to display
 * @param props.variant - Visual variant determining color scheme (default: 'info')
 * @param props.isOpen - Controls visibility (true = visible, false = hidden)
 * @param props.onClose - Callback invoked when snackbar should close
 * @param props.duration - Auto-dismiss duration in ms (default: 4000, 0 = disabled)
 * @param props.className - Additional CSS classes to merge with variant styles
 *
 * @returns Snackbar element (or null when closed)
 */
export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  variant = 'info',
  isOpen,
  onClose,
  duration = 4000,
  className = '',
}) => {
  /**
   * Auto-dismiss timer effect
   * Automatically calls onClose after duration milliseconds if duration > 0
   */
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      // Cleanup timer on unmount or when dependencies change
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  // Don't render when closed
  if (!isOpen) return null;

  /**
   * Variant color schemes
   */
  const variantStyles: Record<SnackbarVariant, string> = {
    success: 'bg-[#4caf50] text-white',
    error: 'bg-[#f44336] text-white',
    warning: 'bg-[#ff9800] text-white',
    info: 'bg-[#2196f3] text-white',
  };

  const baseStyles =
    'fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 ' +
    'py-4 px-6 rounded-lg shadow-lg z-[1000] min-w-[300px] max-w-[500px] ' +
    'animate-[slideIn_0.3s_ease-out]';

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  return (
    <div
      className={classes}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="flex-1 text-[0.95rem] leading-snug">{message}</span>
      <button
        className="bg-transparent border-none cursor-pointer p-1 flex items-center justify-center rounded transition-colors shrink-0 hover:bg-black/10"
        onClick={onClose}
        aria-label="Close notification"
        type="button"
      >
        <div className="w-[18px] h-[18px]">
          <CloseIcon />
        </div>
      </button>
    </div>
  );
};
