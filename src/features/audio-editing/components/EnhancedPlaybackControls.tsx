import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VolumeControl } from '@/lib';

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
  const { t } = useTranslation();
  return (
    <div
      className="p-4 border-t flex flex-col md:flex-row items-center justify-between gap-4"
      style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
    >
      {/* Speed Control */}
      <div className="hidden md:flex items-center gap-2 w-1/4">
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className="text-xs px-2 py-1 rounded cursor-pointer transition-colors duration-150"
            style={{
              fontWeight: playbackSpeed === speed ? 600 : 400,
              backgroundColor:
                playbackSpeed === speed ? 'var(--color-primary-alpha-10)' : 'transparent',
              color:
                playbackSpeed === speed ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
            aria-label={t('playback.aria.speedControl', { speed })}
            aria-pressed={playbackSpeed === speed}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Main Transport */}
      <div className="flex items-center justify-center gap-6 w-full md:w-auto">
        <button
          onClick={onSkipBack}
          aria-label={t('playback.aria.skipBack')}
          className="p-2 rounded-full cursor-pointer transition-colors duration-150"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.backgroundColor = 'var(--color-primary-alpha-10)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <SkipBack size={28} />
        </button>

        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? t('playback.aria.pause') : t('playback.aria.play')}
          className="size-14 flex items-center justify-center rounded-full text-white shadow-md cursor-pointer transition-colors duration-150 active:scale-95"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>

        <button
          onClick={onSkipForward}
          aria-label={t('playback.aria.skipForward')}
          className="p-2 rounded-full cursor-pointer transition-colors duration-150"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.backgroundColor = 'var(--color-primary-alpha-10)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <SkipForward size={28} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="hidden md:flex items-center justify-end w-1/4">
        <VolumeControl volume={volume} onChange={onVolumeChange} />
      </div>
    </div>
  );
}
