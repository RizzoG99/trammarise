import React from 'react';
import './ToggleSwitch.css';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <div className="simple-toggle-container" onClick={() => onChange(!checked)}>
      <div className={`simple-switch ${checked ? 'checked' : ''}`}>
        <div className="simple-slider" />
      </div>
      <span className="simple-toggle-label">{label}</span>
    </div>
  );
};
