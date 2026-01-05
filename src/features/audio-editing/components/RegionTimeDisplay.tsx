interface RegionTimeDisplayProps {
  startTime: number | null;
  endTime: number | null;
}

/**
 * Displays the start and end times of the selected audio region
 * Shows "--:--" when no region is selected
 */
export function RegionTimeDisplay({ startTime, endTime }: RegionTimeDisplayProps) {
  const formatTimeWithMs = (seconds: number | null): string => {
    if (seconds === null) return '--:--';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center px-3 gap-2 border-r border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Start</span>
        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
          {formatTimeWithMs(startTime)}
        </span>
      </div>
      <div className="flex items-center px-3 gap-2">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">End</span>
        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
          {formatTimeWithMs(endTime)}
        </span>
      </div>
    </div>
  );
}
