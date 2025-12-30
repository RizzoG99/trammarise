import type { LucideIcon } from 'lucide-react';

export type IconVariant = 'lucide' | 'material';

export interface IconProps {
  name?: string;
  icon?: LucideIcon;
  variant?: IconVariant;
  size?: number;
  className?: string;
}

export function Icon({
  name,
  icon: LucideIconComponent,
  variant = 'lucide',
  size = 24,
  className = '',
}: IconProps) {
  if (variant === 'lucide' && LucideIconComponent) {
    return <LucideIconComponent size={size} className={className} />;
  }

  if (variant === 'material' && name) {
    return (
      <span
        className={`material-symbols-outlined ${className}`}
        style={{ fontSize: size }}
      >
        {name}
      </span>
    );
  }

  return null;
}
