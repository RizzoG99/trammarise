import { useEffect } from 'react';
import { Mic, Square, Pause, Play } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Heading } from '../../../components/ui/Heading';
import { WaveformVisualization } from './WaveformVisualization';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';

export interface RecordPanelProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function RecordPanel({ onRecordingComplete }: RecordPanelProps) {
  const {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    duration,
    isRecording,
    isPaused,
    audioBlob,
  } = useAudioRecorder();

  // When recording stops and we have a blob, call the callback
  useEffect(() => {
    if (!isRecording && audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [isRecording, audioBlob, onRecordingComplete]);

  const handleStartRecording = async () => {
    await startRecording();
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
          {/* Pause/Resume Button */}
          <button
            onClick={isPaused ? handleResumeRecording : handlePauseRecording}
            disabled={!isRecording}
            className="p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: isRecording ? 'var(--color-text-secondary)' : 'transparent',
              color: isRecording ? 'white' : 'var(--color-text-tertiary)'
            }}
            onMouseEnter={(e) => {
              if (isRecording) e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              if (isRecording) e.currentTarget.style.backgroundColor = 'var(--color-text-secondary)';
            }}
            aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
          >
            {isPaused ? (
              <Play className="w-7 h-7" />
            ) : (
              <Pause className="w-7 h-7" />
            )}
          </button>
          
          {/* Microphone Button */}
          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className={`relative rounded-full transition-all group ${
              isRecording 
                ? 'cursor-not-allowed opacity-50 p-3' 
                : 'shadow-lg hover:shadow-xl p-6'
            }`}
            style={{ 
              backgroundColor: isRecording ? 'transparent' : 'var(--color-primary)',
              color: isRecording ? 'var(--color-text-tertiary)' : 'white'
            }}
            onMouseEnter={(e) => {
              if (!isRecording) e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isRecording) e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
            aria-label={isRecording ? 'Recording' : 'Start recording'}
          >
            <Mic className={isRecording ? 'w-7 h-7' : 'w-8 h-8'} />
            {/* Pulsing ring effect - only when not recording */}
            {!isRecording && (
              <span 
                className="absolute inset-0 rounded-full opacity-20 pulse-ring"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
            )}
          </button>
          
          {/* Stop Button */}
          <button
            onClick={handleStopRecording}
            disabled={!isRecording}
            className="p-3 rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: isRecording ? 'var(--color-accent-error)' : 'transparent',
              color: isRecording ? 'white' : 'var(--color-text-tertiary)'
            }}
            onMouseEnter={(e) => {
              if (isRecording) e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              if (isRecording) e.currentTarget.style.backgroundColor = 'var(--color-accent-error)';
            }}
            aria-label="Stop recording"
          >
            <Square className="w-7 h-7" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
