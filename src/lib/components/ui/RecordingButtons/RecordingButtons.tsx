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
  className = '',
  'aria-label': ariaLabel,
}: RecordButtonProps) {
  const { t } = useTranslation();
  const defaultAriaLabel = ariaLabel || t('upload.aria.startRecording');

  return (
    <button
      onClick={onClick}
      disabled={disabled || isRecording}
      className={`relative rounded-full transition-all group ${
        disabled || isRecording
          ? 'cursor-not-allowed opacity-50 p-3'
          : 'shadow-lg hover:shadow-xl p-6'
      } ${className}`}
      style={{
        backgroundColor: disabled || isRecording ? 'transparent' : 'var(--color-primary)',
        color: disabled || isRecording ? 'var(--color-text-tertiary)' : 'white',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isRecording) {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isRecording) {
          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
        }
      }}
      aria-label={defaultAriaLabel}
    >
      <Mic className={disabled || isRecording ? 'w-7 h-7' : 'w-8 h-8'} />

      {!disabled && !isRecording && (
        <span
          className="absolute inset-0 rounded-full opacity-20 pulse-ring"
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
      )}
    </button>
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
      className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: !disabled ? 'var(--color-text-secondary)' : 'transparent',
        color: !disabled ? 'white' : 'var(--color-text-tertiary)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
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
      className={`p-3 rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
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
