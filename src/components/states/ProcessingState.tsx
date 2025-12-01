import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { ProcessingStateData } from '../../types/audio';
import './ProcessingState.css';

interface ProcessingStateProps {
  processingData: ProcessingStateData;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ processingData }) => {
  const { step, progress } = processingData;

  const getMessage = () => {
    switch (step) {
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
    <div className="processing-state">
      <div className="processing-content">
        <LoadingSpinner />
        <h2 className="processing-title">{getMessage()}</h2>
        <p className="processing-step">Step {getStepNumber()}</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="processing-note">
          This may take a moment. Please don't close this window.
        </p>
      </div>
    </div>
  );
};
