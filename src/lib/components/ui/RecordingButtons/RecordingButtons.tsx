import { Mic, Square, Pause, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RecordingButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * RecordButton properties
 */
export interface RecordButtonProps extends RecordingButtonProps {
  /** Whether recording is currently active */
  isRecording?: boolean;
  /** Called when the button is clicked while isRecording=true (Stop action) */
  onStop?: () => void;
}

/**
 * Large circular record button with pulse ring animation.
 *
 * Features:
 * - **Primary action**: Starts audio recording
 * - **Pulse animation**: Visual indicator when ready to record
 * - **Disabled state**: Grayed out when recording or disabled
 * - **Hover effect**: Color change on mouse over
 * - **Accessibility**: Proper ARIA labels
 *
 * @example
 * ```tsx
 * <RecordButton
 *   onClick={handleStartRecording}
 *   isRecording={isRecording}
 *   aria-label="Start recording"
 * />
 * ```
 */
export function RecordButton({
  onClick,
  disabled = false,
  isRecording = false,
  onStop,
  className = '',
  'aria-label': ariaLabel,
}: RecordButtonProps) {
  const { t } = useTranslation();
  const reducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  const dur = reducedMotion ? '0ms' : undefined;

  const defaultAriaLabel =
    ariaLabel || (isRecording ? t('upload.aria.stopRecording') : t('upload.aria.startRecording'));

  const handleClick = () => {
    if (disabled) return;
    if (isRecording && onStop) {
      onStop();
    } else if (!isRecording) {
      onClick();
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Pulse rings — fade out when recording starts */}
      {!disabled && (
        <>
          <span
            className="absolute inset-0 rounded-full pulse-ring pointer-events-none"
            style={{
              backgroundColor: 'var(--color-primary)',
              opacity: isRecording ? 0 : 1,
              transition: dur ?? 'opacity 150ms ease',
            }}
          />
          <span
            className="absolute inset-0 rounded-full pulse-ring pointer-events-none"
            style={{
              backgroundColor: 'var(--color-primary)',
              animationDelay: '0.9s',
              opacity: isRecording ? 0 : 1,
              transition: dur ?? 'opacity 150ms ease',
            }}
          />
        </>
      )}

      <button
        onClick={handleClick}
        disabled={disabled}
        aria-label={defaultAriaLabel}
        className={`relative z-10 rounded-full p-5 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-lg cursor-pointer'
        } ${className}`}
        style={{
          backgroundColor: disabled
            ? 'transparent'
            : isRecording
              ? 'var(--color-accent-error)'
              : 'var(--color-primary)',
          color: disabled ? 'var(--color-text-tertiary)' : 'white',
          transition: dur ?? 'background-color 250ms ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled)
            e.currentTarget.style.backgroundColor = isRecording
              ? 'var(--color-accent-error-hover)'
              : 'var(--color-primary-hover)';
        }}
        onMouseLeave={(e) => {
          if (!disabled)
            e.currentTarget.style.backgroundColor = isRecording
              ? 'var(--color-accent-error)'
              : 'var(--color-primary)';
        }}
      >
        {/* Stacked icon container — Mic ↔ Square crossfade */}
        <div className="relative w-8 h-8">
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
            style={{
              opacity: isRecording ? 0 : 1,
              transform: isRecording ? 'scale(0.5)' : 'scale(1)',
              transition: dur ?? 'opacity 200ms ease, transform 200ms ease',
            }}
          >
            <Mic className="w-8 h-8" />
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
            style={{
              opacity: isRecording ? 1 : 0,
              transform: isRecording ? 'scale(1)' : 'scale(0.5)',
              transition: dur ?? 'opacity 200ms ease, transform 200ms ease',
            }}
          >
            <Square className="w-8 h-8" />
          </span>
        </div>
      </button>
    </div>
  );
}

/**
 * PauseButton properties
 */
export interface PauseButtonProps extends RecordingButtonProps {
  /** Whether recording is currently paused */
  isPaused?: boolean;
}

/**
 * Gray circular pause/resume button.
 *
 * Features:
 * - **Toggle behavior**: Shows pause icon when recording, play icon when paused
 * - **Gray styling**: Less prominent than record button
 * - **Hover effect**: Darkens on mouse over
 * - **Disabled state**: Grayed out when unavailable
 * - **Accessibility**: Dynamic ARIA labels based on state
 *
 * @example
 * ```tsx
 * <PauseButton
 *   onClick={handlePauseResume}
 *   isPaused={isPaused}
 *   aria-label={isPaused ? "Resume recording" : "Pause recording"}
 * />
 * ```
 */
export function PauseButton({
  onClick,
  disabled = false,
  isPaused = false,
  className = '',
  'aria-label': ariaLabel,
}: PauseButtonProps) {
  const { t } = useTranslation();
  const defaultLabel = isPaused
    ? t('upload.aria.resumeRecording')
    : t('upload.aria.pauseRecording');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: !disabled ? 'var(--color-text-secondary)' : 'transparent',
        color: !disabled ? 'white' : 'var(--color-text-tertiary)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)';
      }}
      aria-label={ariaLabel || defaultLabel}
    >
      {isPaused ? <Play className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
    </button>
  );
}

/**
 * Red circular stop button.
 *
 * Features:
 * - **Destructive action**: Stops and finalizes recording
 * - **Red styling**: Clear visual indicator of stop action
 * - **Hover effect**: Darkens to deeper red on mouse over
 * - **Disabled state**: Grayed out when unavailable
 * - **Accessibility**: Proper ARIA labels
 *
 * @example
 * ```tsx
 * <StopButton
 *   onClick={handleStopRecording}
 *   aria-label="Stop recording"
 * />
 * ```
 */
export function StopButton({
  onClick,
  disabled = false,
  className = '',
  'aria-label': ariaLabel = 'Stop recording',
}: RecordingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: !disabled ? 'var(--color-accent-error)' : 'transparent',
        color: !disabled ? 'white' : 'var(--color-text-tertiary)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-accent-error-hover)';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-accent-error)';
      }}
      aria-label={ariaLabel}
    >
      <Square className="w-7 h-7" />
    </button>
  );
}
