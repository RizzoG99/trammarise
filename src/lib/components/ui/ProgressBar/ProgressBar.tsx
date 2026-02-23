export interface ProgressBarProps {
  value: number;
  max: number;
  warning?: boolean;
}

export function ProgressBar({ value, max, warning = false }: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);
  const isOverLimit = value >= max;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700 dark:text-gray-300">
          {value.toFixed(1)} / {max} minutes
        </span>
        <span
          className={`font-medium ${
            isOverLimit
              ? 'text-red-600 dark:text-red-400'
              : warning
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-indigo-600 dark:text-indigo-400'
          }`}
        >
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isOverLimit ? 'bg-red-500' : warning ? 'bg-yellow-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
