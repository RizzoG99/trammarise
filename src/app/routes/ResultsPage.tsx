import { useParams } from 'react-router-dom';
import { ResultsState } from '../../components/states/ResultsState';
import { Heading, Text } from '@/lib';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useRouteState } from '../../hooks/useRouteState';
import { useTranslation } from 'react-i18next';

export function ResultsPage() {
  const { t } = useTranslation();
  const { sessionId } = useParams();
  const { session, isLoading, updateSession } = useSessionStorage(sessionId || null);
  const { goToAudio } = useRouteState();

  if (isLoading) {
    return (
      <div className="text-center">
        <Text variant="body" color="secondary">
          {t('results.loading')}
        </Text>
      </div>
    );
  }

  if (!session || !session.result || !session.audioFile) {
    return (
      <div className="text-center">
        <Heading level="h2" className="mb-2">
          {t('results.notFound.title')}
        </Heading>
        <Text variant="body" color="secondary">
          {t('results.notFound.message')}
        </Text>
      </div>
    );
  }

  return (
    <ResultsState
      audioName={session.audioFile.name}
      audioFile={session.audioFile}
      result={session.result}
      language={session.language}
      onBack={goToAudio}
      onUpdateResult={(newResult) => {
        updateSession({ result: newResult });
      }}
    />
  );
}
