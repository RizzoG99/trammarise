import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'small' | 'large' | 'circle' | 'circle-thick';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all relative overflow-hidden whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-indigo-600 text-white shadow-lg border-2 border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 hover:-translate-y-0.5 hover:shadow-xl",
    secondary: "bg-slate-100 dark:bg-slate-800 border-2 border-primary/50 text-slate-900 dark:text-white hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary shadow-md",
    success: "bg-emerald-600 text-white border-2 border-emerald-700 hover:bg-emerald-700 hover:-translate-y-0.5 shadow-md",
    danger: "bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 shadow-md",
    outline: "bg-slate-50 dark:bg-slate-800/90 border-2 border-slate-400 dark:border-slate-600 text-slate-900 dark:text-white hover:border-primary hover:bg-primary/10 shadow-sm",
    small: "px-3 py-1 text-sm",
    large: "px-8 py-4 text-lg",
    circle: "w-12 h-12 rounded-full p-0",
    'circle-thick': "w-16 h-16 rounded-full p-0 bg-green-600 text-text-primary hover:bg-green-700 hover:scale-110 hover:shadow-lg flex-shrink-0",
  };

  // Helper to combine classes based on variant
  const getVariantClasses = (v: ButtonVariant) => {
    if (v === 'small' || v === 'large') return `${baseClasses} ${variants[v]}`; // Size modifiers usually need base
    if (v === 'circle' || v === 'circle-thick') return `${baseClasses} ${variants[v]} justify-center`;
    return `${baseClasses} ${variants[v]}`;
  };

  const classes = `${getVariantClasses(variant)} ${className}`.trim();

  return (
    <button className={classes} {...props}>
      {icon && <span className="flex items-center justify-center w-5 h-5">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
