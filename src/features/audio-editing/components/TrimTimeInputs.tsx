import { useState, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { formatTime } from '../../../utils/audio';

export interface TrimTimeInputsProps {
  start: number | null;
  end: number | null;
  duration: number;
  onChange: (start: number, end: number) => void;
  onClear: () => void;
}

/** Parse "M:SS" or "MM:SS" string → seconds. Returns NaN on invalid input. */
function parseTime(value: string): number {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return NaN;
  const mins = parseInt(match[1], 10);
  const secs = parseInt(match[2], 10);
  if (secs >= 60) return NaN;
  return mins * 60 + secs;
}

export function TrimTimeInputs({ start, end, duration, onChange, onClear }: TrimTimeInputsProps) {
  const { t } = useTranslation();
  const startId = useId();
  const endId = useId();

  // While the user is actively editing an input, show their draft.
  // When not focused, derive the display value from props (synced with waveform).
  const [isStartFocused, setIsStartFocused] = useState(false);
  const [isEndFocused, setIsEndFocused] = useState(false);
  const [startDraft, setStartDraft] = useState('');
  const [endDraft, setEndDraft] = useState('');
  const [startError, setStartError] = useState('');
  const [endError, setEndError] = useState('');

  const startDisplay = isStartFocused ? startDraft : start !== null ? formatTime(start) : '';
  const endDisplay = isEndFocused ? endDraft : end !== null ? formatTime(end) : '';

  const hasRegion = start !== null && end !== null;
  const regionDuration = hasRegion ? end - start : null;

  const handleStartFocus = () => {
    setStartDraft(start !== null ? formatTime(start) : '');
    setIsStartFocused(true);
  };

  const handleStartBlur = () => {
    setIsStartFocused(false);
    const parsed = parseTime(startDraft);
    if (isNaN(parsed)) {
      setStartError(t('audioEditing.timeInput.invalidFormat'));
      return;
    }
    setStartError('');
    const effectiveEnd = end ?? duration;
    const clampedStart = Math.min(parsed, effectiveEnd - 0.1);
    onChange(clampedStart, effectiveEnd);
  };

  const handleEndFocus = () => {
    setEndDraft(end !== null ? formatTime(end) : '');
    setIsEndFocused(true);
  };

  const handleEndBlur = () => {
    setIsEndFocused(false);
    const parsed = parseTime(endDraft);
    if (isNaN(parsed)) {
      setEndError(t('audioEditing.timeInput.invalidFormat'));
      return;
    }
    setEndError('');
    const clampedEnd = Math.min(parsed, duration);
    const effectiveStart = start ?? 0;
    onChange(effectiveStart, clampedEnd);
  };

  const inputBase = `
    font-mono text-sm font-medium w-20 px-2 py-1.5 rounded-lg border
    bg-transparent focus:outline-none focus-visible:ring-2
    transition-colors duration-150
  `;

  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-4 border-t"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Start input */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={startId}
          className="text-xs font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t('audioEditing.startLabel')}
        </label>
        <input
          id={startId}
          type="text"
          role="textbox"
          value={startDisplay}
          placeholder="0:00"
          onChange={(e) => setStartDraft(e.target.value)}
          onFocus={handleStartFocus}
          onBlur={handleStartBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          aria-label={t('audioEditing.startLabel')}
          className={inputBase}
          style={{
            color: 'var(--color-text-primary)',
            borderColor: startError ? 'var(--color-accent-error)' : 'var(--color-border)',
          }}
        />
        <span
          className="text-xs"
          style={{
            color: 'var(--color-accent-error)',
            visibility: startError ? 'visible' : 'hidden',
          }}
        >
          {startError || '\u00A0'}
        </span>
      </div>

      {/* Separator */}
      <span
        className="text-sm select-none"
        style={{ color: 'var(--color-text-tertiary)' }}
        aria-hidden="true"
      >
        →
      </span>

      {/* End input */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={endId}
          className="text-xs font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t('audioEditing.endLabel')}
        </label>
        <input
          id={endId}
          type="text"
          role="textbox"
          value={endDisplay}
          placeholder="0:00"
          onChange={(e) => setEndDraft(e.target.value)}
          onFocus={handleEndFocus}
          onBlur={handleEndBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          aria-label={t('audioEditing.endLabel')}
          className={inputBase}
          style={{
            color: 'var(--color-text-primary)',
            borderColor: endError ? 'var(--color-accent-error)' : 'var(--color-border)',
          }}
        />
        <span
          className="text-xs"
          style={{
            color: 'var(--color-accent-error)',
            visibility: endError ? 'visible' : 'hidden',
          }}
        >
          {endError || '\u00A0'}
        </span>
      </div>

      {/* Duration display */}
      {hasRegion && regionDuration !== null && (
        <div className="flex flex-col gap-1" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="text-xs font-medium">{t('audioEditing.durationLabel')}</span>
          <span className="text-sm font-mono font-medium">{formatTime(regionDuration)}</span>
        </div>
      )}

      {/* Clear region — ghost pill, pushed to far right */}
      {hasRegion && (
        <button
          type="button"
          onClick={onClear}
          aria-label={t('audioEditing.clearRegion')}
          className={[
            'ml-auto flex items-center gap-1.5',
            'text-xs font-medium px-2.5 py-1 rounded-full border',
            'cursor-pointer transition-colors duration-150',
          ].join(' ')}
          style={{
            color: 'var(--color-text-tertiary)',
            borderColor: 'var(--color-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-accent-error)';
            e.currentTarget.style.borderColor = 'var(--color-accent-error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-tertiary)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <X size={12} strokeWidth={2.5} />
          {t('audioEditing.clearRegion')}
        </button>
      )}
    </div>
  );
}
