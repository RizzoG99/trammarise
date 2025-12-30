import React, { useId, type InputHTMLAttributes } from 'react';

/**
 * Input component properties
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional label text displayed above the input */
  label?: string;
  /** Error message to display below the input (shows error styling) */
  error?: string;
  /** Hint text to display below the input when there's no error */
  hint?: string;
  /** Whether the input should take full width of its container (default: true) */
  fullWidth?: boolean;
}

/**
 * A flexible form input component with label, error, and hint support.
 *
 * Features:
 * - **Label**: Optional label with automatic `for` attribute binding
 * - **Error State**: Red border and error message when validation fails
 * - **Hint Text**: Helper text below input (hidden when error is present)
 * - **Required Indicator**: Automatic asterisk (*) for required fields
 * - **Auto ID**: Generates unique ID if not provided
 * - **Dark Mode**: Full dark mode support
 * - **Focus States**: Visible focus ring for accessibility
 *
 * @example
 * ```tsx
 * // Basic input with label
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   required
 * />
 *
 * // Input with error
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 *
 * // Input with hint
 * <Input
 *   label="API Key"
 *   type="text"
 *   hint="You can find this in your account settings"
 * />
 * ```
 *
 * @param props - Input properties
 * @param props.label - Optional label text
 * @param props.error - Error message (enables error styling)
 * @param props.hint - Helper text (hidden when error is shown)
 * @param props.fullWidth - Take full width of container (default: true)
 * @param props.id - Input ID (auto-generated if not provided)
 * @param props.required - Mark field as required (adds asterisk to label)
 * @param props.className - Additional CSS classes for the container
 * @param props....rest - All standard HTML input attributes
 *
 * @returns React input element with wrapper
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  // Generate unique ID from props or useId hook
  const generatedId = useId();
  const inputId = id || props.name || generatedId;

  return (
    <div
      className={`flex flex-col gap-2 mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1"
        >
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        id={inputId}
        className={`
          px-4 py-3 rounded-lg border bg-white dark:bg-slate-800
          text-slate-900 dark:text-white text-base transition-all
          focus:outline-none focus:border-indigo-600 focus:ring-2
          focus:ring-indigo-600/20 focus:bg-white dark:focus:bg-slate-800
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            error
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 dark:border-slate-600'
          }
        `}
        {...props}
      />

      {error && (
        <span className="text-xs text-red-500 animate-[slideDown_0.2s_ease-out]">
          {error}
        </span>
      )}

      {hint && !error && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      )}
    </div>
  );
};
