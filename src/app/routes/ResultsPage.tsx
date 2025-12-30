import { useParams } from 'react-router-dom';
import { ResultsState } from '../../components/states/ResultsState';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';

export function ResultsPage() {
  const { sessionId } = useParams();
  const { session, isLoading, updateSession } = useSessionStorage(sessionId || null);
  const { goToAudio } = useRouteState();

  if (isLoading) {
    return (
      <div className="text-center">
        <Text variant="body" color="secondary">Loading results...</Text>
      </div>
    );
  }

  if (!session || !session.result || !session.audioFile) {
    return (
      <div className="text-center">
        <Heading level="h2" className="mb-2">No Results Found</Heading>
        <Text variant="body" color="secondary">
          Complete processing to view results.
        </Text>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto">
      <ResultsState
        audioName={session.audioFile.name}
        result={session.result}
        onBack={goToAudio}
        onUpdateResult={(newResult) => {
          updateSession({ result: newResult });
        }}
      />
    </div>
  );
}
