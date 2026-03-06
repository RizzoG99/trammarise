import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface MiniAudioPlayerProps {
  file: File | Blob;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MiniAudioPlayer({ file, className = '' }: MiniAudioPlayerProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // for time display only
  const [duration, setDuration] = useState(NaN);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audioRef.current = audio;

    // rAF loop: update slider thumb + fill directly at 60fps
    const tick = () => {
      const slider = sliderRef.current;
      if (!slider) return;
      const ct = audio.currentTime;
      const dur = audio.duration;
      const pct = isFinite(dur) && dur > 0 ? (ct / dur) * 100 : 0;
      slider.value = String(ct);
      slider.style.setProperty('--audio-fill-pct', `${pct.toFixed(3)}%`);
      rafRef.current = requestAnimationFrame(tick);
    };

    const stopRaf = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setIsPlaying(false);
      stopRaf();
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      stopRaf();
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      stopRaf();
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
    // Update fill immediately on seek
    const dur = audio.duration;
    const pct = isFinite(dur) && dur > 0 ? (value / dur) * 100 : 0;
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--audio-fill-pct', `${pct.toFixed(3)}%`);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play / Pause button — 44px touch target */}
      <button
        onClick={handlePlayPause}
        aria-label={isPlaying ? t('audioPreview.pauseAriaLabel') : t('audioPreview.playAriaLabel')}
        className="flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-colors duration-150 flex-shrink-0"
        style={{ backgroundColor: 'var(--color-primary-alpha-10)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-alpha-20)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-alpha-10)';
        }}
      >
        <span className="flex items-center justify-center w-8 h-8">
          {isPlaying ? (
            <Pause size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          ) : (
            <Play size={16} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          )}
        </span>
      </button>

      {/* Seek bar — uncontrolled, driven by rAF for smooth thumb + fill */}
      <input
        ref={sliderRef}
        type="range"
        role="slider"
        min={0}
        max={isFinite(duration) ? duration : 0}
        step={0.1}
        defaultValue={0}
        onChange={handleSeek}
        aria-label={t('audioPreview.seekAriaLabel')}
        aria-valuemin={0}
        aria-valuemax={isFinite(duration) ? duration : 0}
        aria-valuenow={currentTime}
        className="mini-audio-range flex-1"
        style={
          {
            '--audio-fill-pct': '0%',
            background: `linear-gradient(to right, var(--color-primary) var(--audio-fill-pct), var(--color-border) var(--audio-fill-pct))`,
          } as React.CSSProperties
        }
      />

      {/* Time display */}
      <span
        className="text-xs tabular-nums flex-shrink-0 select-none"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
