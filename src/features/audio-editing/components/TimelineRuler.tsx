import { formatTime } from '../../../utils/audio';

interface TimelineRulerProps {
  duration: number;
  markerCount?: number;
}

/**
 * Timeline ruler that displays time markers below the waveform
 * Generates evenly spaced time markers based on audio duration
 */
export function TimelineRuler({ duration, markerCount = 6 }: TimelineRulerProps) {
  // Generate time markers
  const markers = Array.from({ length: markerCount }, (_, index) => {
    const time = (duration / (markerCount - 1)) * index;
    return {
      time,
      label: formatTime(time),
    };
  });

  return (
    <div className="h-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between px-8 text-[10px] text-gray-600 dark:text-gray-400 items-start pt-1 font-mono select-none">
      {markers.map((marker, index) => (
        <span key={index}>{marker.label}</span>
      ))}
    </div>
  );
}
