import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '../../components/layout/PageLayout';
import { SplitCardLayout } from '../../features/processing/components/SplitCardLayout';
import { ProgressCircle } from '../../features/processing/components/ProgressCircle';
import {
  StepChecklist,
  type ProcessingStep,
} from '../../features/processing/components/StepChecklist';
import { Button, Text } from '@/lib';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';
import {
  useAudioProcessing,
  type ProcessingStep as AudioStep,
} from '../../hooks/useAudioProcessing';
import {
  buildDefaultConfiguration,
  validateEnvironmentConfiguration,
} from '../../utils/config-helper';

import { UpgradeModal, type UpgradeTrigger } from '@/components/marketing/UpgradeModal';
import { TranscriptionErrorDialog } from '../../features/processing/components/TranscriptionErrorDialog';

export function ProcessingPage() {
  const { t } = useTranslation();
  const { sessionId } = useParams();
  const { session, isLoading, updateSession } = useSessionStorage(sessionId || null);
  const { goToResults, goToAudio, goToHome } = useRouteState();

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<AudioStep>('uploading');
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState<UpgradeTrigger>('limit_reached');

  // Real audio processing hook
  const { startProcessing, cancel, isProcessing } = useAudioProcessing({
    onProgress: (step, prog) => {
      setCurrentStep(step);
      setProgress(prog);
    },
    onComplete: async (result) => {
      // Save result to session
      await updateSession({ result });
      // Navigate to results page
      setTimeout(() => goToResults(), 500);
    },
    onError: (err) => {
      console.error('Processing error:', err);
      if (err.message.includes('Usage limit')) {
        setUpgradeTrigger('limit_reached');
        setIsUpgradeModalOpen(true);
        // Do not display generic error UI, just show modal
      } else {
        setError(err.message);
      }
    },
  });

  // Start processing on mount
  useEffect(() => {
    if (
      !session ||
      !session.audioFile ||
      isProcessing ||
      error ||
      session.result ||
      isUpgradeModalOpen
    )
      return;

    let config;
    try {
      // Validate environment configuration
      validateEnvironmentConfiguration();

      // Build configuration from environment + session
      config = buildDefaultConfiguration(session);
    } catch (err) {
      const error = err as Error;
      console.error('Configuration error:', error);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(error.message);
      return;
    }

    // Start real processing
    startProcessing(session, config);
  }, [session, isProcessing, error, startProcessing, isUpgradeModalOpen]);

  // Handle modal close - redirect to home/dashboard if they can't proceed
  const handleUpgradeModalClose = () => {
    setIsUpgradeModalOpen(false);
    // If they closed the modal without upgrading, we should probably go back
    // But checking if they upgraded is hard synchronously.
    // Let's just go back to home for now to avoid loop/stuck state.
    goToHome();
  };

  const handleCancel = () => {
    cancel();
    goToAudio();
  };

  // ... (Steps memoization) ...
  const steps: ProcessingStep[] = useMemo(
    () => [
      {
        id: 'uploading',
        label: t('processing.steps.uploading'),
        status: progress >= 30 ? 'completed' : 'processing',
      },
      {
        id: 'transcribing',
        label: t('processing.steps.transcribing'),
        status: progress >= 70 ? 'completed' : progress >= 30 ? 'processing' : 'pending',
      },
      {
        id: 'analyzing',
        label: t('processing.steps.analyzing'),
        status: progress >= 80 ? 'completed' : progress >= 70 ? 'processing' : 'pending',
      },
      {
        id: 'summarizing',
        label: t('processing.steps.summarizing'),
        status: progress >= 100 ? 'completed' : progress >= 80 ? 'processing' : 'pending',
      },
    ],
    [progress, t]
  );

  // Error state handled via Dialog below
  // We still render the layout behind it

  // Loading session
  if (isLoading) {
    return (
      <PageLayout maxWidth="1200px">
        <div className="text-center">
          <Text variant="body" color="secondary">
            {t('common.loading')}
          </Text>
        </div>
      </PageLayout>
    );
  }

  // Session not found
  if (!session) {
    return (
      <PageLayout maxWidth="1200px">
        <div className="text-center">
          <Text variant="body" color="secondary">
            {t('common.error')} - {t('common.notFound', 'Session not found')}
          </Text>
        </div>
      </PageLayout>
    );
  }

  const estimatedTime =
    progress < 30 ? '2-3 min' : progress < 70 ? '1-2 min' : t('processing.almostDone');

  return (
    <PageLayout maxWidth="1200px">
      {/* Split Card Layout */}
      <SplitCardLayout
        left={
          <ProgressCircle progress={progress} step={currentStep} timeEstimate={estimatedTime} />
        }
        right={<StepChecklist steps={steps} />}
      />

      {/* Cancel Button */}
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={handleCancel} disabled={progress >= 100}>
          {t('common.cancel')}
        </Button>
      </div>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={handleUpgradeModalClose}
        trigger={upgradeTrigger}
      />
      <TranscriptionErrorDialog
        isOpen={!!error}
        onClose={handleCancel}
        errorMessage={error || undefined}
        errorType={
          error?.toLowerCase().includes('api key')
            ? 'api_key_invalid'
            : error?.toLowerCase().includes('network')
              ? 'network'
              : error
                ? 'unknown'
                : undefined
        }
        onTryAgain={goToAudio}
      />
    </PageLayout>
  );
}
