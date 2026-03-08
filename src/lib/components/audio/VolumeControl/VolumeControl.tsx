import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface VolumeControlProps {
  /** Current volume level from 0 to 1. */
  volume: number;
  onChange: (volume: number) => void;
  className?: string;
}

/**
 * Volume slider control — icon + range input styled to match the shared
 * `mini-audio-range` CSS class used across the audio components.
 */
export function VolumeControl({ volume, onChange, className = '' }: VolumeControlProps) {
  const { t } = useTranslation();
  const fillPct = `${(volume * 100).toFixed(2)}%`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" style={{ color: 'var(--color-text-secondary)' }}>
        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={t('playback.aria.volumeSlider')}
        className="volume-range w-24"
        style={{
          background: `linear-gradient(to right, var(--color-primary) ${fillPct}, var(--color-border) ${fillPct})`,
        }}
      />
    </div>
  );
}
