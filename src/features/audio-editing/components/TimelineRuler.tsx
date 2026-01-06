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
    <div className="h-8 border-t flex justify-between px-8 text-[10px] items-start pt-1 font-mono select-none" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
      {markers.map((marker, index) => (
        <span key={index}>{marker.label}</span>
      ))}
    </div>
  );
}
