import React from 'react';
import './SelectCard.css';

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
      className={`select-card ${selected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      aria-pressed={selected}
      value={value}
    >
      {icon && <div className="select-card-icon">{icon}</div>}
      <span className="select-card-label">{label}</span>
      {selected && <div className="select-card-indicator" />}
    </button>
  );
};
