import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SplitCardLayout } from '../../features/processing/components/SplitCardLayout';
import { ProgressCircle } from '../../features/processing/components/ProgressCircle';
import { StepChecklist, type ProcessingStep } from '../../features/processing/components/StepChecklist';
import { Button } from '../../components/ui/Button';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';

export function ProcessingPage() {
  const { sessionId } = useParams();
  const { session, isLoading } = useSessionStorage(sessionId || null);
  const { goToResults, goToConfigure } = useRouteState();

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('uploading');
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'uploading', label: 'Uploading Audio', status: 'processing' },
    { id: 'transcribing', label: 'Transcribing Speech', status: 'pending' },
    { id: 'analyzing', label: 'Analyzing Context', status: 'pending' },
    { id: 'summarizing', label: 'Summarizing Key Points', status: 'pending' },
  ]);

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

  // Update steps based on progress
  useEffect(() => {
    const newSteps = [...steps];

    if (progress >= 25) {
      newSteps[0].status = 'completed';
      newSteps[1].status = 'processing';
      setCurrentStep('transcribing');
    }
    if (progress >= 50) {
      newSteps[1].status = 'completed';
      newSteps[2].status = 'processing';
      setCurrentStep('analyzing');
    }
    if (progress >= 75) {
      newSteps[2].status = 'completed';
      newSteps[3].status = 'processing';
      setCurrentStep('summarizing');
    }
    if (progress >= 100) {
      newSteps[3].status = 'completed';
    }

    setSteps(newSteps);
  }, [progress]);

  const handleCancel = () => {
    goToConfigure();
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <Text variant="body" color="secondary">Loading session...</Text>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center">
        <Heading level="h2" className="mb-2">Session Not Found</Heading>
        <Text variant="body" color="secondary">
          The requested session could not be found.
        </Text>
      </div>
    );
  }

  const estimatedTime = progress < 50 ? '2-3 min' : progress < 75 ? '1-2 min' : 'Almost done';

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Heading level="h1" className="mb-2">Processing Audio</Heading>
        <Text variant="body" color="secondary">
          {session.audioFile.name}
        </Text>
      </div>

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
    </div>
  );
}
