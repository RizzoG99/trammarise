import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard, Heading, RecordButton, PauseButton } from '@/lib';
import { WaveformVisualization } from './WaveformVisualization';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';

export interface RecordPanelProps {
  onRecordingComplete: (blob: Blob) => void;
  onRecordingStart?: () => void;
}

export interface RecordPanelRef {
  reset: () => void;
}

export const RecordPanel = forwardRef<RecordPanelRef, RecordPanelProps>(
  ({ onRecordingComplete, onRecordingStart }, ref) => {
    const { t } = useTranslation();
    const reducedMotion =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
    const {
      startRecording,
      pauseRecording,
      resumeRecording,
      stopRecording,
      resetRecording,
      duration,
      isRecording,
      isPaused,
      audioBlob,
    } = useAudioRecorder();

    // Expose reset method to parent via ref
    useImperativeHandle(ref, () => ({
      reset: resetRecording,
    }));

    // When recording stops and we have a blob, call the callback
    useEffect(() => {
      if (!isRecording && audioBlob) {
        onRecordingComplete(audioBlob);
      }
    }, [isRecording, audioBlob, onRecordingComplete]);

    const handleStartRecording = async () => {
      const success = await startRecording();
      if (success && onRecordingStart) {
        onRecordingStart();
      }
    };

    const handlePauseRecording = () => {
      pauseRecording();
    };

    const handleResumeRecording = () => {
      resumeRecording();
    };

    const handleStopRecording = () => {
      stopRecording();
    };

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <GlassCard variant="dark" className="p-6 h-full flex flex-col justify-between">
        {/* Header with Status Indicator */}
        <div className="flex items-center justify-between mb-4">
          <Heading level="h3">{t('home.recordTitle')}</Heading>

          {/* Status Indicator - Top Right */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isRecording && !isPaused ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor:
                  isRecording && !isPaused
                    ? 'var(--color-accent-error)'
                    : 'var(--color-text-tertiary)',
              }}
            />
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{
                color:
                  isRecording && !isPaused
                    ? 'var(--color-accent-error)'
                    : 'var(--color-text-secondary)',
              }}
            >
              {isRecording
                ? isPaused
                  ? t('home.statusPaused')
                  : t('home.statusRecording')
                : t('home.statusReady')}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
          {/* Waveform Visualization */}
          <WaveformVisualization isRecording={isRecording} isPaused={isPaused} />

          {/* Timer */}
          <div className="text-4xl font-mono font-semibold text-text-primary tabular-nums">
            {formatDuration(duration)}
          </div>

          {/* Controls — symmetric 3-slot layout, all slots 72×72px for perfect alignment */}
          <div className="flex items-center justify-center gap-4">
            {/* Left slot: Pause — same container size as RecordButton, slides in from right */}
            <div
              style={{
                width: '72px',
                height: '72px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: isRecording ? 1 : 0,
                transform: isRecording ? 'translateX(0) scale(1)' : 'translateX(72px) scale(0.85)',
                pointerEvents: isRecording ? 'auto' : 'none',
                transition: reducedMotion
                  ? 'none'
                  : `opacity 250ms ease-out ${isRecording ? '50ms' : '0ms'}, transform 250ms ease-out ${isRecording ? '50ms' : '0ms'}`,
              }}
            >
              <PauseButton
                onClick={isPaused ? handleResumeRecording : handlePauseRecording}
                isPaused={isPaused}
              />
            </div>

            {/* Center slot: Record/Stop — always visible, morphs between states */}
            <RecordButton
              onClick={handleStartRecording}
              onStop={handleStopRecording}
              isRecording={isRecording}
            />

            {/* Right slot: mirror spacer — collapses when recording to center the Pause+Stop pair */}
            <div
              style={{
                width: isRecording ? '0px' : '72px',
                marginLeft: isRecording ? '-16px' : '0px',
                height: '72px',
                flexShrink: 0,
                overflow: 'hidden',
                transition: reducedMotion
                  ? 'none'
                  : 'width 250ms ease-out, margin-left 250ms ease-out',
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </GlassCard>
    );
  }
);

RecordPanel.displayName = 'RecordPanel';
