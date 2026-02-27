import React from 'react';
import { useTranslation } from 'react-i18next';
import { AILoadingOrb, Button } from '@/lib';
import type { ProcessingStateData } from '../../types/audio';

interface ProcessingStateProps {
  processingData: ProcessingStateData;
  onCancel?: () => void;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ processingData, onCancel }) => {
  const { t } = useTranslation();
  const { step, progress } = processingData;

  const getMessage = () => {
    switch (step) {
      case 'loading':
        return t('processingState.messages.loading');
      case 'compressing':
        return t('processingState.messages.compressing');
      case 'transcribing':
        return t('processingState.messages.transcribing');
      case 'configuring':
        return t('processingState.messages.configuring');
      case 'summarizing':
        return t('processingState.messages.summarizing');
      case 'complete':
        return t('processingState.messages.complete');
      default:
        return t('processingState.messages.default');
    }
  };

  const getStepLabel = () => {
    switch (step) {
      case 'loading':
        return t('processingState.steps.preparing');
      case 'compressing':
        return t('processingState.steps.optimizing');
      case 'transcribing':
        return t('processingState.steps.step1of2');
      case 'configuring':
        return t('processingState.steps.step1of2');
      case 'summarizing':
        return t('processingState.steps.step2of2');
      case 'complete':
        return t('processingState.steps.step2of2');
      default:
        return t('processingState.steps.step1of2');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-[600px] mx-auto text-center animate-[fadeIn_0.3s_ease-out]">
      <div className="w-full p-8 bg-bg-surface border border-border rounded-xl shadow-md">
        <AILoadingOrb size={120} />
        <h2 className="mt-6 mb-2 text-2xl font-semibold text-text-primary">{getMessage()}</h2>
        <p className="mb-8 text-base text-text-secondary">
          {t('processingState.stepLabel', { step: getStepLabel() })}
        </p>
        <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary rounded-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-text-secondary mb-6">{t('processingState.hint')}</p>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="mt-4">
            {t('processingState.cancel')}
          </Button>
        )}
      </div>
    </div>
  );
};
