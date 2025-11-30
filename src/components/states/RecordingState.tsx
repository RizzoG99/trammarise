import React from 'react';
import { Button } from '../ui/Button';
import { formatTime } from '../../utils/audio';
import './RecordingState.css';

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
    <div className="recording-state">
      <div className="recording-indicator">
        <div className="pulse-dot" />
        <span className="recording-text">Recording...</span>
      </div>

      <div className="recording-timer">{formatTime(duration)}</div>

      <Button variant="danger" icon={<StopIcon />} onClick={onStopRecording}>
        Stop Recording
      </Button>
    </div>
  );
};
