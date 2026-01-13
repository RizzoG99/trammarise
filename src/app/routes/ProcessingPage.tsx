import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { SplitCardLayout } from '../../features/processing/components/SplitCardLayout';
import { ProgressCircle } from '../../features/processing/components/ProgressCircle';
import { StepChecklist, type ProcessingStep } from '../../features/processing/components/StepChecklist';
import { Button, Text } from '@/lib';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';

export function ProcessingPage() {
  const { sessionId } = useParams();
  const { session, isLoading } = useSessionStorage(sessionId || null);
  const { goToResults, goToConfigure } = useRouteState();

  const [progress, setProgress] = useState(0);

  // Derive currentStep from progress (avoid cascading renders)
  const currentStep =
    progress >= 75 ? 'summarizing' :
    progress >= 50 ? 'analyzing' :
    progress >= 25 ? 'transcribing' :
    'uploading';

  // Derive steps from progress (avoid setState in effect)
  const steps: ProcessingStep[] = [
    {
      id: 'uploading',
      label: 'Uploading Audio',
      status: progress >= 25 ? 'completed' : 'processing'
    },
    {
      id: 'transcribing',
      label: 'Transcribing Speech',
      status: progress >= 50 ? 'completed' : progress >= 25 ? 'processing' : 'pending'
    },
    {
      id: 'analyzing',
      label: 'Analyzing Context',
      status: progress >= 75 ? 'completed' : progress >= 50 ? 'processing' : 'pending'
    },
    {
      id: 'summarizing',
      label: 'Summarizing Key Points',
      status: progress >= 100 ? 'completed' : progress >= 75 ? 'processing' : 'pending'
    },
  ];

  // Simulate processing progress (Phase 3 will integrate real API calls)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Navigate to results on completion
          setTimeout(() => goToResults(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [goToResults]);

  const handleCancel = () => {
    goToConfigure();
  };

  if (isLoading) {
    return (
      <PageLayout maxWidth="1200px">
        <div className="text-center">
          <Text variant="body" color="secondary">Loading session...</Text>
        </div>
      </PageLayout>
    );
  }

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

  const estimatedTime = progress < 50 ? '2-3 min' : progress < 75 ? '1-2 min' : 'Almost done';

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
