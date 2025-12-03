import React from 'react';
import { ConfigurationForm } from '../forms/ConfigurationForm';
import type { AIConfiguration } from '../../types/audio';

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
    <div className="w-full max-w-[800px] mx-auto py-8 px-4 animate-[fadeIn_0.3s_ease-out] md:p-4">
      <div className="text-center mb-8">
        <h1 className="m-0 mb-2 text-3xl font-bold text-text-primary md:text-2xl">Configure AI Processing</h1>
        <p className="m-0 text-lg text-text-secondary leading-relaxed md:text-base">
          Transcription complete! Choose your AI provider and content type for summarization.
        </p>
      </div>

      <div className="mb-10 p-6 bg-bg-surface border border-border-glass rounded-xl backdrop-blur-md">
        <h3 className="m-0 mb-4 text-lg font-semibold text-text-primary">Transcript Preview</h3>
        <div className="mb-3 p-4 bg-black/20 rounded-lg max-h-[120px] overflow-y-auto border border-white/5">
          <p className="m-0 text-text-secondary leading-relaxed text-[0.95rem]">{transcript.substring(0, 300)}...</p>
        </div>
        <p className="m-0 text-sm text-text-tertiary italic">Full transcript will be processed with your selected AI model</p>
      </div>

      <div className="bg-bg-surface p-8 rounded-xl border border-border-glass shadow-2xl backdrop-blur-md md:p-6">
        <ConfigurationForm onSubmit={onConfigure} onCancel={onBack} />
      </div>
    </div>
  );
};
