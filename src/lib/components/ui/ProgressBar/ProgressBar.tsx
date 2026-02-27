export interface ProgressBarProps {
  value: number;
  max: number;
  warning?: boolean;
}

export function ProgressBar({ value, max, warning = false }: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const isOverLimit = value >= max;

  const barColor = isOverLimit
    ? 'var(--color-accent-error)'
    : warning
      ? 'var(--color-accent-warning)'
      : 'var(--color-primary)';

  const labelColor = isOverLimit
    ? 'var(--color-accent-error)'
    : warning
      ? 'var(--color-accent-warning)'
      : 'var(--color-primary)';

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-text-secondary">
          {value.toFixed(1)} / {max} minutes
        </span>
        <span className="font-medium" style={{ color: labelColor }}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
