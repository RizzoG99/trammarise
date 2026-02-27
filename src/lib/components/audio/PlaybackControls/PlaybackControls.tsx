import React from 'react';
import { PlayIcon, PauseIcon, TrimIcon, CheckIcon, XIcon } from '../../../../components/icons';
import { Button } from '@/lib';
import { formatTime } from '../../../../utils/audio';

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
    <div className="flex items-center justify-between gap-6 p-5 bg-bg-surface rounded-xl border border-border shadow-sm mt-4">
      {/* Left: Play button + Duration */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPlayPause}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-all hover:scale-105 shadow-md hover:shadow-lg flex-shrink-0"
          aria-label="Play/Pause"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="flex items-center gap-2 tabular-nums text-base text-text-primary font-medium">
          <span>{formatTime(currentTime)}</span>
          <span className="text-text-tertiary">·</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Trim button OR Save/Cancel buttons */}
      <div className="flex items-center gap-3">
        {isTrimming ? (
          <>
            <Button variant="success" icon={<CheckIcon />} onClick={onApplyTrim}>
              Save Trim
            </Button>
            <Button variant="outline" icon={<XIcon />} onClick={onCancelTrim}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="secondary" icon={<TrimIcon />} onClick={onTrimClick}>
            Trim Audio
          </Button>
        )}
      </div>
    </div>
  );
};
