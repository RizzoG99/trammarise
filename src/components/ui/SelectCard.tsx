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
        bg-bg-surface border border-border-glass rounded-xl 
        cursor-pointer transition-all relative overflow-hidden h-full w-full 
        text-text-primary hover:bg-bg-surface-hover hover:border-primary-light/30 hover:-translate-y-0.5
        ${selected ? 'bg-primary/15 border-primary shadow-[0_4px_12px_rgba(139,92,246,0.15)]' : ''}
        ${className}
      `}
      onClick={onClick}
      aria-pressed={selected}
      value={value}
    >
      {icon && <div className="text-3xl flex items-center justify-center text-text-primary">{icon}</div>}
      <span className="text-sm font-medium text-center leading-tight">{label}</span>
      {selected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
      )}
    </button>
  );
};
