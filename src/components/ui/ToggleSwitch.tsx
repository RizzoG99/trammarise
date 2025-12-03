import React from 'react';

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
    <div className="flex items-center gap-3 cursor-pointer select-none py-2 group" onClick={() => onChange(!checked)}>
      <div className={`relative w-11 h-6 rounded-full transition-colors border border-white/10 ${checked ? 'bg-primary border-primary' : 'bg-white/10 group-hover:border-white/30'}`}>
        <div className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </div>
  );
};
