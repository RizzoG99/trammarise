import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { GlassCard, Heading } from '@/lib';
import { WaveformVisualization } from './WaveformVisualization';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { RecordButton, PauseButton, StopButton } from '../../../components/ui/RecordingButtons';

export interface RecordPanelProps {
  onRecordingComplete: (blob: Blob) => void;
  onRecordingStart?: () => void;
}

export interface RecordPanelRef {
  reset: () => void;
}

export const RecordPanel = forwardRef<RecordPanelRef, RecordPanelProps>(
  ({ onRecordingComplete, onRecordingStart }, ref) => {
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
    <GlassCard variant="light" className="p-6">
      {/* Header with Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <Heading level="h3">Record Now</Heading>
        
        {/* Status Indicator - Top Right */}
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${isRecording && !isPaused ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: isRecording && !isPaused ? 'var(--color-accent-error)' : 'var(--color-text-tertiary)' }}
          />
          <span 
            className="text-xs font-medium uppercase tracking-wider"
            style={{ 
              color: isRecording && !isPaused ? 'var(--color-accent-error)' : 'var(--color-text-secondary)' 
            }}
          >
            {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
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

        {/* Controls */}
        <div className="flex items-center gap-4">
          <PauseButton
            onClick={isPaused ? handleResumeRecording : handlePauseRecording}
            disabled={!isRecording}
            isPaused={isPaused}
          />

          <RecordButton
            onClick={handleStartRecording}
            disabled={isRecording}
            isRecording={isRecording}
          />

          <StopButton
            onClick={handleStopRecording}
            disabled={!isRecording}
          />
        </div>
      </div>
    </GlassCard>
  );
});

RecordPanel.displayName = 'RecordPanel';
