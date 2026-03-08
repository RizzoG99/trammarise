import { memo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, SkipBack, SkipForward, Gauge } from 'lucide-react';
import { Button } from '../../../lib';
import type { AudioFile } from '../../../types/audio';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatTime } from '../utils/formatTime';

interface ResultsAudioBarProps {
  audioFile: AudioFile;
  audioPlayer: ReturnType<typeof useAudioPlayer>;
}

const arePropsEqual = (prev: ResultsAudioBarProps, next: ResultsAudioBarProps): boolean =>
  prev.audioFile.blob === next.audioFile.blob && prev.audioPlayer === next.audioPlayer;

/**
 * Compact sticky audio player bar for the Results page.
 * Uses a seek slider instead of a waveform — lighter, less distracting.
 */
export const ResultsAudioBar = memo(function ResultsAudioBar({
  audioFile,
  audioPlayer,
}: ResultsAudioBarProps) {
  const { t } = useTranslation();
  const { state, togglePlayPause, skipBy, cycleSpeed, seek, audioRef } = audioPlayer;
  const sliderRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);

  // rAF loop: update slider thumb + fill at 60fps without React re-renders
  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      const slider = sliderRef.current;
      if (!audio || !slider) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const ct = audio.currentTime;
      const dur = audio.duration;
      const pct = isFinite(dur) && dur > 0 ? (ct / dur) * 100 : 0;
      slider.value = String(ct);
      slider.style.setProperty('--audio-fill-pct', `${pct.toFixed(3)}%`);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [audioRef]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    seek(value);
    // Update fill immediately
    const dur = audioRef.current?.duration;
    const pct = isFinite(dur ?? NaN) && (dur ?? 0) > 0 ? (value / (dur ?? 1)) * 100 : 0;
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--audio-fill-pct', `${pct.toFixed(3)}%`);
    }
  };

  return (
    <div className="w-full bg-bg-glass backdrop-blur-md border-b border-border shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
      <div className="max-w-[1400px] mx-auto px-6 py-3">
        {/* File Name */}
        <div className="text-xs text-text-tertiary mb-3 text-center tracking-wide uppercase font-medium">
          {audioFile.name}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Time Display */}
          <span className="text-sm text-text-secondary tabular-nums flex-shrink-0 min-w-[90px]">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </span>

          {/* Skip Back */}
          <Button
            variant="circle"
            onClick={() => skipBy(-10)}
            className="p-2 flex-shrink-0"
            aria-label={t('audioPlayer.skipBack')}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          {/* Play/Pause */}
          <Button
            variant="primary"
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full p-0 flex-shrink-0"
            disabled={state.isLoading}
            aria-label={state.isPlaying ? t('audioPlayer.pause') : t('audioPlayer.play')}
          >
            {state.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>

          {/* Skip Forward */}
          <Button
            variant="circle"
            onClick={() => skipBy(10)}
            className="p-2 flex-shrink-0"
            aria-label={t('audioPlayer.skipForward')}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          {/* Seek Bar */}
          <input
            ref={sliderRef}
            type="range"
            role="slider"
            min={0}
            max={isFinite(state.duration) ? state.duration : 0}
            step={0.1}
            defaultValue={0}
            onChange={handleSeek}
            aria-label={t('audioPreview.seekAriaLabel')}
            aria-valuemin={0}
            aria-valuemax={isFinite(state.duration) ? state.duration : 0}
            aria-valuenow={state.currentTime}
            className="mini-audio-range flex-1"
            style={
              {
                '--audio-fill-pct': '0%',
                background: `linear-gradient(to right, var(--color-primary) var(--audio-fill-pct), var(--color-border) var(--audio-fill-pct))`,
              } as React.CSSProperties
            }
          />

          {/* Speed Control */}
          <Button
            variant="circle"
            onClick={cycleSpeed}
            className="p-2 flex-shrink-0 min-w-[64px] flex items-center gap-1.5"
            aria-label={t('audioPlayer.playbackSpeed', { speed: state.playbackRate })}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{state.playbackRate}x</span>
          </Button>
        </div>
      </div>
    </div>
  );
}, arePropsEqual);
