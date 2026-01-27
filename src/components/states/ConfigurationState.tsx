import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-[800px] mx-auto py-8 px-4 animate-[fadeIn_0.3s_ease-out] md:p-4">
      <div className="text-center mb-8">
        <h1 className="m-0 mb-2 text-3xl font-bold text-slate-900 dark:text-white md:text-2xl">
          {t('configurationState.heading')}
        </h1>
        <p className="m-0 text-lg text-slate-600 dark:text-slate-300 leading-relaxed md:text-base">
          {t('configurationState.description')}
        </p>
      </div>

      <div className="mb-10 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
        <h3 className="m-0 mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t('configurationState.transcriptPreview')}
        </h3>
        <div className="mb-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg max-h-[120px] overflow-y-auto border border-slate-200 dark:border-slate-700">
          <p className="m-0 text-slate-700 dark:text-slate-300 leading-relaxed text-[0.95rem]">
            {transcript.substring(0, 300)}...
          </p>
        </div>
        <p className="m-0 text-sm text-slate-500 dark:text-slate-400 italic">
          {t('configurationState.processingNote')}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md md:p-6">
        <ConfigurationForm onSubmit={onConfigure} onCancel={onBack} />
      </div>
    </div>
  );
};
