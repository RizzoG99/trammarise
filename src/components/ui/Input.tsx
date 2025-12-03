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
        <label htmlFor={inputId} className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base transition-all
          focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:bg-white dark:focus:bg-slate-800
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          ${error 
            ? 'border-red-500 focus:ring-red-500/20' 
            : 'border-slate-300 dark:border-slate-600'
          }
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500 animate-[slideDown_0.2s_ease-out]">{error}</span>}
      {hint && !error && <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
    </div>
  );
};
