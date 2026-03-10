import { memo, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Gauge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/Button';
import { useAudioPlayer } from '../../../../features/results/hooks/useAudioPlayer';
import { formatTime } from '../../../../features/results/utils/formatTime';

export interface AudioPlayerProps {
  file: File | Blob;
  /**
   * Controlled mode: pass an existing useAudioPlayer instance.
   * The component uses this hook's state and callbacks directly.
   *
   * Uncontrolled mode: omit this prop.
   * The component creates its own internal audio instance.
   */
  audioPlayer?: ReturnType<typeof useAudioPlayer>;
  /** Show skip ±10s buttons (default: false) */
  showSkipButtons?: boolean;
  /** Show speed cycle button (default: false) */
  showSpeedControl?: boolean;
  /** When provided, renders a label above the controls */
  fileName?: string;
  className?: string;
}

/**
 * Unified audio player for upload and results pages.
 *
 * Supports two modes:
 * - **Uncontrolled** (no `audioPlayer` prop): self-contained, manages its own audio element.
 * - **Controlled** (`audioPlayer` prop): uses a shared hook instance owned by the parent,
 *   enabling transcript sync, external seeking, etc.
 *
 * Optional feature flags: `showSkipButtons`, `showSpeedControl`.
 * Optional `fileName` label rendered above the controls.
 */
export const AudioPlayer = memo(function AudioPlayer({
  file,
  audioPlayer: externalPlayer,
  showSkipButtons = false,
  showSpeedControl = false,
  fileName,
  className = '',
}: AudioPlayerProps) {
  const { t } = useTranslation();
  const sliderRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);

  // Always call hook (React rules). Pass null when controlled to skip audio element setup.
  const internalAudioFile = useMemo(
    () =>
      externalPlayer
        ? null
        : {
            blob: file,
            name: file instanceof File ? file.name : '',
            file: file instanceof File ? file : new File([file], ''),
          },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [file, !!externalPlayer]
  );
  const internalPlayer = useAudioPlayer(internalAudioFile);
  const player = externalPlayer ?? internalPlayer;

  const { state, togglePlayPause, skipBy, cycleSpeed, seek, audioRef } = player;

  // rAF loop: updates slider thumb + fill at 60fps without React re-renders
  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      const slider = sliderRef.current;
      if (audio && slider) {
        const ct = audio.currentTime;
        const dur = audio.duration;
        const pct = isFinite(dur) && dur > 0 ? (ct / dur) * 100 : 0;
        slider.value = String(ct);
        slider.style.setProperty('--audio-fill-pct', `${pct.toFixed(3)}%`);
      }
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
    const dur = audioRef.current?.duration;
    const pct = isFinite(dur ?? NaN) && (dur ?? 0) > 0 ? (value / (dur ?? 1)) * 100 : 0;
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--audio-fill-pct', `${pct.toFixed(3)}%`);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Optional file name label */}
      {fileName && (
        <div className="text-xs text-text-tertiary text-center tracking-wide uppercase font-medium">
          {fileName}
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Time display */}
        <span
          className="text-xs tabular-nums flex-shrink-0 min-w-[80px]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {formatTime(state.currentTime)} / {formatTime(state.duration)}
        </span>

        {/* Skip back */}
        {showSkipButtons && (
          <Button
            variant="circle"
            onClick={() => skipBy(-10)}
            className="p-2 flex-shrink-0"
            aria-label={t('audioPlayer.skipBack')}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
        )}

        {/* Play / Pause */}
        <button
          onClick={togglePlayPause}
          disabled={state.isLoading}
          aria-label={state.isPlaying ? t('audioPlayer.pause') : t('audioPlayer.play')}
          className="flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-colors duration-150 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-primary-alpha-10)' }}
          onMouseEnter={(e) => {
            if (!state.isLoading)
              e.currentTarget.style.backgroundColor = 'var(--color-primary-alpha-20)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-alpha-10)';
          }}
        >
          <span className="flex items-center justify-center w-8 h-8">
            {state.isPlaying ? (
              <Pause size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            ) : (
              <Play size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            )}
          </span>
        </button>

        {/* Skip forward */}
        {showSkipButtons && (
          <Button
            variant="circle"
            onClick={() => skipBy(10)}
            className="p-2 flex-shrink-0"
            aria-label={t('audioPlayer.skipForward')}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        )}

        {/* Seek slider */}
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

        {/* Speed control */}
        {showSpeedControl && (
          <Button
            variant="circle"
            onClick={cycleSpeed}
            className="p-2 flex-shrink-0 min-w-[56px] flex items-center gap-1"
            aria-label={t('audioPlayer.playbackSpeed', { speed: state.playbackRate })}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{state.playbackRate}x</span>
          </Button>
        )}
      </div>
    </div>
  );
});
