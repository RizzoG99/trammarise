import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { SplitCardLayout } from '../../features/processing/components/SplitCardLayout';
import { ProgressCircle } from '../../features/processing/components/ProgressCircle';
import { StepChecklist, type ProcessingStep } from '../../features/processing/components/StepChecklist';
import { Button, Text, Heading } from '@/lib';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';
import { useAudioProcessing, type ProcessingStep as AudioStep } from '../../hooks/useAudioProcessing';
import { buildDefaultConfiguration, validateEnvironmentConfiguration } from '../../utils/config-helper';

export function ProcessingPage() {
  const { sessionId } = useParams();
  const { session, isLoading, updateSession } = useSessionStorage(sessionId || null);
  const { goToResults, goToAudio } = useRouteState();

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<AudioStep>('uploading');
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message);
    },
  });

  // Start processing on mount
  useEffect(() => {
    if (!session || !session.audioFile || isProcessing || error) return;

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
  }, [session, isProcessing, error, startProcessing]);

  const handleCancel = () => {
    cancel();
    goToAudio();
  };

  // Derive steps from progress for UI
  const steps: ProcessingStep[] = [
    {
      id: 'uploading',
      label: 'Uploading Audio',
      status: progress >= 30 ? 'completed' : 'processing'
    },
    {
      id: 'transcribing',
      label: 'Transcribing Speech',
      status: progress >= 70 ? 'completed' : progress >= 30 ? 'processing' : 'pending'
    },
    {
      id: 'analyzing',
      label: 'Analyzing Context',
      status: progress >= 80 ? 'completed' : progress >= 70 ? 'processing' : 'pending'
    },
    {
      id: 'summarizing',
      label: 'Summarizing Key Points',
      status: progress >= 100 ? 'completed' : progress >= 80 ? 'processing' : 'pending'
    },
  ];

  // Error state
  if (error) {
    return (
      <PageLayout maxWidth="1200px">
        <div className="text-center">
          <Heading level="h2" className="mb-4">Processing Failed</Heading>
          <div className="max-w-[600px] mx-auto mb-6">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <Text className="whitespace-pre-line text-red-600 dark:text-red-400">{error}</Text>
            </div>
          </div>
          <Button onClick={() => goToAudio()}>Back to Audio</Button>
        </div>
      </PageLayout>
    );
  }

  // Loading session
  if (isLoading) {
    return (
      <PageLayout maxWidth="1200px">
        <div className="text-center">
          <Text variant="body" color="secondary">Loading session...</Text>
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
            The requested session could not be found.
          </Text>
        </div>
      </PageLayout>
    );
  }

  const estimatedTime = progress < 30 ? '2-3 min' : progress < 70 ? '1-2 min' : 'Almost done';

  return (
    <PageLayout maxWidth="1200px">
      {/* Split Card Layout */}
      <SplitCardLayout
        left={
          <ProgressCircle
            progress={progress}
            step={currentStep}
            timeEstimate={estimatedTime}
          />
        }
        right={
          <StepChecklist steps={steps} />
        }
      />

      {/* Cancel Button */}
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={progress >= 100}
        >
          Cancel Processing
        </Button>
      </div>
    </PageLayout>
  );
}
