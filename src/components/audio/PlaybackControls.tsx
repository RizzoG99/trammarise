import React from 'react';
import { PlayIcon, PauseIcon, TrimIcon } from '../icons';
import { formatTime } from '../../utils/audio';
import './PlaybackControls.css';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onTrimClick: () => void;
}

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

      <button className="control-btn trim-btn" onClick={onTrimClick} aria-label="Trim Audio">
        <TrimIcon />
      </button>
    </div>
  );
};
