import { useParams } from 'react-router-dom';
import { AudioState } from '../../components/states/AudioState';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';

export function AudioEditingPage() {
  const { sessionId } = useParams();
  const { session, isLoading } = useSessionStorage(sessionId || null);
  const { goToProcessing, goToHome } = useRouteState();

  if (isLoading) {
    return (
      <div className="text-center">
        <Text variant="body" color="secondary">Loading session...</Text>
      </div>
    );
  }

  if (!session || !session.audioFile) {
    return (
      <div className="text-center">
        <Heading level="h2" className="mb-2">Session Not Found</Heading>
        <Text variant="body" color="secondary">
          The requested audio session could not be found.
        </Text>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      <AudioState
        audioFile={session.audioFile.blob}
        audioName={session.audioFile.name}
        onReset={goToHome}
        onProcessingStart={goToProcessing}
      />
    </div>
  );
}
