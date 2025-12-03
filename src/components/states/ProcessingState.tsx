import React from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { ProcessingStateData } from '../../types/audio';
import './ProcessingState.css';

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
        {onCancel && (
          <button
            className="cancel-button"
            onClick={onCancel}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
          >
            Cancel Processing
          </button>
        )}
      </div>
    </div>
  );
};
