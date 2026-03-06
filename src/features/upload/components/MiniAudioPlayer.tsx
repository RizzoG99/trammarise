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
  const objectUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(NaN);

  // Create object URL once per file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
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
  };

  const pct = isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play / Pause button — 44px touch target, 32px visual */}
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

      {/* Seek bar */}
      <input
        type="range"
        role="slider"
        min={0}
        max={isFinite(duration) ? duration : 0}
        step={0.1}
        value={currentTime}
        onChange={handleSeek}
        aria-label={t('audioPreview.seekAriaLabel')}
        aria-valuemin={0}
        aria-valuemax={isFinite(duration) ? duration : 0}
        aria-valuenow={currentTime}
        className="flex-1 h-1 rounded-full appearance-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{
          background: `linear-gradient(to right, var(--color-primary) ${pct}%, var(--color-bg-tertiary) ${pct}%)`,
          // Custom thumb via CSS
          accentColor: 'var(--color-primary)',
        }}
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
