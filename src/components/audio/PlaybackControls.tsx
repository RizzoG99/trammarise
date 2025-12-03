import React from 'react';
import { PlayIcon, PauseIcon, TrimIcon, CheckIcon, XIcon } from '../icons';
import { Button } from '../ui/Button';
import { formatTime } from '../../utils/audio';

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
    <div className="flex items-center justify-between gap-4 p-4 bg-bg-glass backdrop-blur-md rounded-lg mb-4">
      {!isTrimming && (
        <>
          <button 
            className="w-12 h-12 border-none rounded-full bg-gradient-to-r from-primary to-primary-light text-text-primary cursor-pointer flex items-center justify-center transition-all shrink-0 hover:scale-110 hover:shadow-lg touch:w-14 touch:h-14" 
            onClick={onPlayPause} 
            aria-label="Play/Pause"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="flex items-center gap-1 tabular-nums text-sm text-text-secondary flex-1">
            <span>{formatTime(currentTime)}</span>
            <span className="text-text-tertiary">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </>
      )}

      <div className={`flex-1 animate-[fadeInOut_0.3s_ease-in-out] ${isTrimming ? 'animate-[fadeInOut_0.3s_ease-in-out]' : ''}`}>
        {isTrimming ? (
          <div className="flex justify-center gap-4 animate-[slideInRight_0.3s_ease-in-out]">
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
