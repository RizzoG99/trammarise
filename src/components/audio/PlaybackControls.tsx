import React from 'react';
import { PlayIcon, PauseIcon, TrimIcon } from '../icons';
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
