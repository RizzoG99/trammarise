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
      className={`block relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden hover:shadow-md ${
        checked 
          ? 'shadow-[0_0_0_2px_var(--color-primary)]' 
          : 'hover:border-primary/30'
      } ${className}`}
      style={{
        backgroundColor: checked ? 'var(--color-primary-alpha-10)' : 'var(--color-bg-surface)',
        borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
      />
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="font-semibold text-lg text-text-primary flex-1">{title}</div>
          <div 
            className={`w-6 h-6 rounded-full border-2 relative transition-all duration-200 flex-shrink-0 ml-2 ${
              checked 
                ? 'after:content-[""] after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-3 after:h-3 after:rounded-full after:bg-white' 
                : ''
            }`}
            style={{
              borderColor: checked ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
              backgroundColor: checked ? 'var(--color-primary)' : 'transparent',
            }}
          />
        </div>
        {description && <div className="text-sm text-text-secondary leading-relaxed mt-1">{description}</div>}
      </div>
    </label>
  );
};
