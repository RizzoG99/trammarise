import React from 'react';
import { Button } from '../ui/Button';
import { formatTime } from '../../utils/audio';
import './PlaybackControls.css';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isTrimming: boolean;
  onPlayPause: () => void;
  onTrimClick: () => void;
  onApplyTrim: () => void;
  onCancelTrim: () => void;
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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  isTrimming,
  onPlayPause,
  onTrimClick,
  onApplyTrim,
  onCancelTrim,
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

      <div className={`trim-button-container ${isTrimming ? 'trimming' : ''}`}>
        {isTrimming ? (
          <div className="trim-actions">
            <Button variant="circle-thick" onClick={onApplyTrim} title="Apply Trim">
              <CheckIcon />
            </Button>
            <Button variant="small" onClick={onCancelTrim} title="Cancel Trim">
              <XIcon />
            </Button>
          </div>
        ) : (
          <Button variant="small" icon={<TrimIcon />} onClick={onTrimClick}>
            Trim Audio
          </Button>
        )}
      </div>
    </div>
  );
};
