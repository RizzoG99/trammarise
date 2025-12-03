import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import type { ProcessingStateData } from '../../types/audio';

interface ProcessingStateProps {
  processingData: ProcessingStateData;
  onCancel?: () => void;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ processingData, onCancel }) => {
  const { step, progress } = processingData;

  const getMessage = () => {
    switch (step) {
      case 'loading':
        return 'Loading audio processor...';
      case 'compressing':
        return 'Optimizing audio for processing...';
      case 'transcribing':
        return 'Transcribing audio with Whisper...';
      case 'configuring':
        return 'Configuring AI settings...';
      case 'summarizing':
        return 'Generating AI summary...';
      case 'complete':
        return 'Processing complete!';
      default:
        return 'Processing...';
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'loading':
        return 'Preparing';
      case 'compressing':
        return 'Optimizing';
      case 'transcribing':
        return '1/2';
      case 'configuring':
        return '1/2';
      case 'summarizing':
        return '2/2';
      case 'complete':
        return '2/2';
      default:
        return '1/2';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-[600px] mx-auto text-center animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full p-8 bg-bg-surface border border-border-glass rounded-xl backdrop-blur-md">
        <LoadingSpinner />
        <h2 className="mt-6 mb-2 text-2xl font-semibold text-text-primary">{getMessage()}</h2>
        <p className="mb-8 text-base text-text-secondary">Step {getStepNumber()}</p>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-text-secondary mb-6">
          This may take a moment. Please don't close this window.
        </p>
        {onCancel && (
          <Button
            variant="danger"
            onClick={onCancel}
            className="mt-4"
          >
            Cancel Processing
          </Button>
        )}
      </div>
    </div>
  );
};
