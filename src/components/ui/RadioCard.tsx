import React from 'react';

interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: React.ReactNode;
  description?: string;
  className?: string;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  className = '',
}) => {
  return (
    <label 
      className={`block relative cursor-pointer rounded-xl bg-bg-surface border border-border-glass transition-all duration-200 overflow-hidden hover:bg-bg-surface-hover hover:border-primary/30 ${
        checked 
          ? 'bg-primary/10 border-primary shadow-[0_0_0_1px_rgba(139,92,246,1)]' 
          : ''
      } ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
      />
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <div className="font-semibold text-base text-text-primary">{title}</div>
          <div 
            className={`w-5 h-5 rounded-full border-2 border-text-tertiary relative transition-all duration-200 ${
              checked 
                ? 'border-primary bg-primary after:content-[""] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-2 after:h-2 after:rounded-full after:bg-white' 
                : ''
            }`} 
          />
        </div>
        {description && <div className="text-sm text-text-secondary leading-snug">{description}</div>}
      </div>
    </label>
  );
};
