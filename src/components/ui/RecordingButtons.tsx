import { Mic, Square, Pause, Play } from 'lucide-react';

interface RecordingButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

// 1. RecordButton - Large circular with pulse ring
export interface RecordButtonProps extends RecordingButtonProps {
  isRecording?: boolean;
}

export function RecordButton({
  onClick,
  disabled = false,
  isRecording = false,
  className = '',
  'aria-label': ariaLabel = 'Start recording'
}: RecordButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-full transition-all group ${
        disabled || isRecording
          ? 'cursor-not-allowed opacity-50 p-3'
          : 'shadow-lg hover:shadow-xl p-6'
      } ${className}`}
      style={{
        backgroundColor: disabled || isRecording ? 'transparent' : 'var(--color-primary)',
        color: disabled || isRecording ? 'var(--color-text-tertiary)' : 'white'
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
      aria-label={ariaLabel}
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

// 2. PauseButton - Gray circular for pause/resume
export interface PauseButtonProps extends RecordingButtonProps {
  isPaused?: boolean;
}

export function PauseButton({
  onClick,
  disabled = false,
  isPaused = false,
  className = '',
  'aria-label': ariaLabel
}: PauseButtonProps) {
  const defaultLabel = isPaused ? 'Resume recording' : 'Pause recording';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: !disabled ? 'var(--color-text-secondary)' : 'transparent',
        color: !disabled ? 'white' : 'var(--color-text-tertiary)'
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

// 3. StopButton - Red circular
export function StopButton({
  onClick,
  disabled = false,
  className = '',
  'aria-label': ariaLabel = 'Stop recording'
}: RecordingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: !disabled ? 'var(--color-accent-error)' : 'transparent',
        color: !disabled ? 'white' : 'var(--color-text-tertiary)'
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = '#dc2626';
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
