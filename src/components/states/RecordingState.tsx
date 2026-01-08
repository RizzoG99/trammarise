import React from 'react';
import { Button } from '@/lib';
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
    <div className="w-full max-w-[600px] flex flex-col items-center animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
        <span className="text-lg font-medium text-red-500">Recording...</span>
      </div>

      <div className="text-5xl font-light mb-12 tabular-nums text-white dark:text-slate-900">{formatTime(duration)}</div>

      <Button variant="danger" icon={<StopIcon />} onClick={onStopRecording}>
        Stop Recording
      </Button>
    </div>
  );
};
