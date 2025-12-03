import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`flex flex-col gap-2 mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary flex items-center gap-1">
          {label}
          {props.required && <span className="text-accent-error">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          px-4 py-3 rounded-lg border bg-bg-surface text-text-primary text-base transition-all
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-bg-surface-hover
          placeholder:text-text-secondary/50
          ${error 
            ? 'border-accent-error focus:ring-accent-error/20' 
            : 'border-border-glass'
          }
        `}
        {...props}
      />
      {error && <span className="text-xs text-accent-error animate-[slideDown_0.2s_ease-out]">{error}</span>}
      {hint && !error && <span className="text-xs text-text-secondary/60">{hint}</span>}
    </div>
  );
};
