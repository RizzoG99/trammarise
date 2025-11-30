import React from 'react';
import { Button } from '../ui/Button';
import { formatTime } from '../../utils/audio';
import './PlaybackControls.css';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onTrimClick: () => void;
}

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
  </svg>
);

const TrimIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
  </svg>
);

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onTrimClick,
}) => {
  return (
    <div className="playback-controls">
      <button className="control-btn" onClick={onPlayPause} aria-label="Play/Pause">
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      <div className="time-display">
        <span>{formatTime(currentTime)}</span>
        <span className="time-separator">/</span>
        <span>{formatTime(duration)}</span>
      </div>

      <Button variant="small" icon={<TrimIcon />} onClick={onTrimClick}>
        Trim Audio
      </Button>
    </div>
  );
};
