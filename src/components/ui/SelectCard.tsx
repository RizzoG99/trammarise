import React from 'react';

interface SelectCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export const SelectCard: React.FC<SelectCardProps> = ({
  value,
  label,
  icon,
  selected,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`
        flex flex-col items-center justify-center gap-3 p-5 
        bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl 
        cursor-pointer transition-all relative overflow-hidden h-full w-full 
        text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 hover:-translate-y-0.5
        ${selected ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 shadow-md' : ''}
        ${className}
      `}
      onClick={onClick}
      aria-pressed={selected}
      value={value}
    >
      {icon && <div className="text-3xl flex items-center justify-center text-slate-900 dark:text-white">{icon}</div>}
      <span className="text-sm font-medium text-center leading-tight">{label}</span>
      {selected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 shadow-sm" />
      )}
    </button>
  );
};
