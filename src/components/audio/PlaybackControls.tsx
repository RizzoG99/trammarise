import React from 'react';
import { PlayIcon, PauseIcon, TrimIcon, CheckIcon, XIcon } from '../icons';
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
      {!isTrimming && (
        <>
          <button className="control-btn" onClick={onPlayPause} aria-label="Play/Pause">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span className="time-separator">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </>
      )}

      <div className={`trim-button-container ${isTrimming ? 'trimming' : ''}`}>
        {isTrimming ? (
          <div className="trim-actions">
            <Button variant="success" icon={<CheckIcon />} onClick={onApplyTrim} title="Save trimmed audio">
              Save
            </Button>
            <Button variant="danger" icon={<XIcon />} onClick={onCancelTrim} title="Cancel and discard trim">
              Cancel
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
