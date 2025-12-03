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
      <div className={`relative w-11 h-6 rounded-full transition-colors border ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'}`}>
        <div className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{label}</span>
    </div>
  );
};
