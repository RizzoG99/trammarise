import React from 'react';
import './RadioCard.css';

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
    <label className={`radio-card ${checked ? 'checked' : ''} ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="radio-card-input"
      />
      <div className="radio-card-content">
        <div className="radio-card-header">
          <div className="radio-card-title">{title}</div>
          <div className={`radio-card-check ${checked ? 'checked' : ''}`} />
        </div>
        {description && <div className="radio-card-description">{description}</div>}
      </div>
    </label>
  );
};
