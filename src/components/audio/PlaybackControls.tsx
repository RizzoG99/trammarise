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
    <div className="flex items-center justify-between gap-6 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
      {/* Left: Play button + Duration */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPlayPause}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all hover:scale-105 shadow-md hover:shadow-lg flex-shrink-0"
          aria-label="Play/Pause"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="flex items-center gap-2 tabular-nums text-base text-slate-700 dark:text-slate-300 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span className="text-slate-400 dark:text-slate-500">·</span>
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
