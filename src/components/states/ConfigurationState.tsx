import React from 'react';
import { ConfigurationForm } from '../forms/ConfigurationForm';
import type { AIConfiguration } from '../../types/audio';
import './ConfigurationState.css';

interface ConfigurationStateProps {
  transcript: string;
  onConfigure: (config: AIConfiguration) => void;
  onBack: () => void;
}

export const ConfigurationState: React.FC<ConfigurationStateProps> = ({
  transcript,
  onConfigure,
  onBack,
}) => {
  return (
    <div className="configuration-state">
      <div className="configuration-header">
        <h1 className="configuration-title">Configure AI Processing</h1>
        <p className="configuration-subtitle">
          Transcription complete! Choose your AI provider and content type for summarization.
        </p>
      </div>

      <div className="transcript-preview">
        <h3 className="preview-title">Transcript Preview</h3>
        <div className="preview-content">
          <p>{transcript.substring(0, 300)}...</p>
        </div>
        <p className="preview-note">Full transcript will be processed with your selected AI model</p>
      </div>

      <div className="configuration-form-container">
        <ConfigurationForm onSubmit={onConfigure} onCancel={onBack} />
      </div>
    </div>
  );
};
