import { memo } from 'react';
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
  const { state, togglePlayPause, skipBy, cycleSpeed } = audioPlayer;

  return (
    <div className="w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-md">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        {/* File Name */}
        <div className="text-xs text-[var(--color-text-tertiary)] mb-2 text-center">
          {audioFile.name}
        </div>

        {/* Waveform Visualization */}
        <div className="flex-col mb-6 border rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
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
              aria-label="Skip back 10 seconds"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            {/* Play/Pause */}
            <Button
              variant="primary"
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full p-0"
              disabled={state.isLoading}
              aria-label={state.isPlaying ? 'Pause' : 'Play'}
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
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Speed Control (Right) */}
          <Button
            variant="circle"
            onClick={cycleSpeed}
            className="p-2 min-w-[80px] flex items-center gap-2"
            aria-label={`Playback speed: ${state.playbackRate}x`}
          >
            <Gauge className="w-4 h-4" />
            <span className="text-sm font-medium">{state.playbackRate}x</span>
          </Button>
        </div>
      </div>
    </div>
  );
}, arePropsEqual);
