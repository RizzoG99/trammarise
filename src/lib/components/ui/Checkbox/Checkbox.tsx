import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  'aria-label': string;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  'aria-label': ariaLabel,
  className = '',
  disabled = false,
}: CheckboxProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-5 h-5 ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`peer appearance-none w-5 h-5 rounded border border-border checked:bg-primary checked:border-primary transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        aria-label={ariaLabel}
      />
      <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
    </div>
  );
}
