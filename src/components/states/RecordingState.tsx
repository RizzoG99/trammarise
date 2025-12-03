import React from 'react';
import { Button } from '../ui/Button';
import { formatTime } from '../../utils/audio';

interface RecordingStateProps {
  duration: number;
  onStopRecording: () => void;
}

const StopIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export const RecordingState: React.FC<RecordingStateProps> = ({
  duration,
  onStopRecording,
}) => {
  return (
    <div className="w-full max-w-[600px] text-center animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-accent-error animate-[pulse_1.5s_ease-in-out_infinite]" />
        <span className="text-lg font-medium text-accent-error">Recording...</span>
      </div>

      <div className="text-4xl font-light mb-12 tabular-nums">{formatTime(duration)}</div>

      <Button variant="danger" icon={<StopIcon />} onClick={onStopRecording}>
        Stop Recording
      </Button>
    </div>
  );
};
