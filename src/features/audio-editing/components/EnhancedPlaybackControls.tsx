import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface EnhancedPlaybackControlsProps {
  isPlaying: boolean;
  playbackSpeed: number;
  volume: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onVolumeChange: (volume: number) => void;
}

const PLAYBACK_SPEEDS = [1, 1.5, 2];

/**
 * Enhanced playback controls with speed, skip, and volume controls
 * Matches mockup design with full-featured transport
 */
export function EnhancedPlaybackControls({
  isPlaying,
  playbackSpeed,
  volume,
  onPlayPause,
  onSpeedChange,
  onSkipBack,
  onSkipForward,
  onVolumeChange,
}: EnhancedPlaybackControlsProps) {
  return (
    <div className="p-4 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
      {/* Speed Control */}
      <div className="hidden md:flex items-center gap-2 w-1/4">
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`text-xs ${playbackSpeed === speed ? 'font-bold' : 'font-medium'} px-2 py-1 rounded hover:bg-gray-100/50 transition ${
              playbackSpeed === speed
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
            aria-label={`Set playback speed to ${speed}x`}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Main Transport */}
      <div className="flex items-center justify-center gap-6 w-full md:w-auto">
        <button
          onClick={onSkipBack}
          aria-label="Skip Back 10s"
          className="group p-2 rounded-full hover:bg-gray-100/50 text-[var(--color-text-primary)] transition-colors"
        >
          <SkipBack
            size={28}
            className="group-hover:text-blue-500"
          />
        </button>

        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="size-14 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <button
          onClick={onSkipForward}
          aria-label="Skip Forward 10s"
          className="group p-2 rounded-full hover:bg-gray-100/50 text-[var(--color-text-primary)] transition-colors"
        >
          <SkipForward
            size={28}
            className="group-hover:text-blue-500"
          />
        </button>
      </div>

      {/* Volume Control */}
      <div className="hidden md:flex items-center justify-end gap-2 w-1/4 group">
        <div
          className="p-1.5 text-[var(--color-text-secondary)]"
          aria-hidden="true"
        >
          <Volume2 size={20} />
        </div>
        <div className="w-24 h-1 rounded-full overflow-hidden cursor-pointer relative" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Volume slider"
          />
          <div
            className="h-full group-hover:bg-blue-500 transition-colors"
            style={{ 
              backgroundColor: 'var(--color-text-secondary)',
              width: `${volume * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
