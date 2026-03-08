import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, SkipBack, SkipForward, Gauge } from 'lucide-react';
import { Button, WaveformPlayer } from '../../../lib';
import type { AudioFile } from '../../../types/audio';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatTime } from '../utils/formatTime';

/**
 * Props for AudioPlayerBar component
 */
interface AudioPlayerBarProps {
  /** Audio file data from session */
  audioFile: AudioFile;
  /** Audio player instance (shared state) */
  audioPlayer: ReturnType<typeof useAudioPlayer>;
  /** Callback fired whenever WaveSurfer's playback time changes */
  onTimeUpdate?: (time: number) => void;
}

/**
 * Custom memo comparison to prevent re-renders when blob is stable.
 */
const arePropsEqual = (prev: AudioPlayerBarProps, next: AudioPlayerBarProps): boolean => {
  // Compare by blob reference (session-manager will stabilize these)
  return (
    prev.audioFile.blob === next.audioFile.blob &&
    prev.audioPlayer === next.audioPlayer &&
    prev.onTimeUpdate === next.onTimeUpdate
  );
};

/**
 * Sticky audio player bar with waveform visualization and playback controls.
 *
 * Features:
 * - CSS-only waveform (30 bars, clickable for seeking)
 * - Play/Pause, ±10s skip buttons
 * - Time display (current / total)
 * - Speed control (1x → 1.5x → 2x → 1x)
 * - Responsive: Stacks controls on mobile
 *
 * Memoized to prevent unnecessary re-renders.
 *
 * @param audioFile - Audio file from session storage
 * @param audioPlayer - Audio player instance for playback control
 */
export const AudioPlayerBar = memo(function AudioPlayerBar({
  audioFile,
  audioPlayer,
  onTimeUpdate,
}: AudioPlayerBarProps) {
  const { t } = useTranslation();
  const { state, togglePlayPause, skipBy, cycleSpeed } = audioPlayer;

  return (
    <div className="w-full bg-bg-glass backdrop-blur-md border-b border-border shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        {/* File Name */}
        <div className="text-xs text-text-tertiary mb-3 text-center tracking-wide uppercase font-medium">
          {audioFile.name}
        </div>

        {/* Waveform Visualization */}
        <div className="mb-5 rounded-xl overflow-hidden border border-border/60 bg-bg-surface shadow-inner">
          <div className="px-4 py-3">
            <WaveformPlayer audioFile={audioFile.blob} onTimeUpdate={onTimeUpdate} />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Time Display (Left) */}
          <div className="text-sm text-[var(--color-text-secondary)] min-w-[100px]">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </div>

          {/* Playback Controls (Center) */}
          <div className="flex items-center gap-2">
            {/* Skip Back 10s */}
            <Button
              variant="circle"
              onClick={() => skipBy(-10)}
              className="p-2"
              aria-label={t('audioPlayer.skipBack')}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            {/* Play/Pause */}
            <Button
              variant="primary"
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full p-0"
              disabled={state.isLoading}
              aria-label={state.isPlaying ? t('audioPlayer.pause') : t('audioPlayer.play')}
            >
              {state.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </Button>

            {/* Skip Forward 10s */}
            <Button
              variant="circle"
              onClick={() => skipBy(10)}
              className="p-2"
              aria-label={t('audioPlayer.skipForward')}
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Speed Control (Right) */}
          <Button
            variant="circle"
            onClick={cycleSpeed}
            className="p-2 min-w-[80px] flex items-center gap-2"
            aria-label={t('audioPlayer.playbackSpeed', { speed: state.playbackRate })}
          >
            <Gauge className="w-4 h-4" />
            <span className="text-sm font-medium">{state.playbackRate}x</span>
          </Button>
        </div>
      </div>
    </div>
  );
}, arePropsEqual);
