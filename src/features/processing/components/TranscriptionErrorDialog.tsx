import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Modal, Text, Button } from '@/lib';
import { ROUTES } from '../../../types/routing';

interface TranscriptionErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage?: string;
  errorType?: 'api_key_invalid' | 'network' | 'quota' | 'unknown';
  onTryAgain?: () => void;
}

export function TranscriptionErrorDialog({
  isOpen,
  onClose,
  errorMessage,
  errorType,
  onTryAgain,
}: TranscriptionErrorDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('processing.error.title', 'Transcription Error')}
      hideHeader
      className="max-w-md p-2"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-5 flex-shrink-0">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <Text variant="body" className="mb-2 w-full text-center text-xl font-semibold">
          {t('processing.error.title', 'Transcription Error')}
        </Text>

        <Text variant="body" color="secondary" className="mb-6 max-w-sm text-center">
          {t(
            'processing.error.explanation',
            "We couldn't transcribe your audio file. This can happen for a few reasons."
          )}
        </Text>

        <div className="bg-bg-secondary/50 rounded-lg p-5 w-full mb-8 border border-border-subtle text-left">
          <Text variant="body" className="font-semibold text-text-primary mb-3">
            {t('processing.error.possibleReasons', 'Possible reasons:')}
          </Text>
          <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm">
            <li>
              {t('processing.error.reasonFormat', 'The audio format is unsupported or corrupted.')}
            </li>
            <li>
              {t(
                'processing.error.reasonSilence',
                'The recording contains mostly silence or background noise.'
              )}
            </li>
            <li>
              {t(
                'processing.error.reasonNetwork',
                'A momentary network error interrupted the connection.'
              )}
            </li>
          </ul>
        </div>

        {errorMessage && (
          <div className="w-full bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm text-left mb-6 overflow-x-auto font-mono">
            {errorMessage}
          </div>
        )}

        {errorType ? (
          <div className="flex gap-3 w-full justify-center">
            {errorType === 'api_key_invalid' && (
              <Button variant="primary" onClick={() => navigate(ROUTES.SETUP)}>
                {t('processing.error.fixApiKey', 'Fix API Key')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                onTryAgain?.();
                onClose();
              }}
            >
              {t('processing.error.tryAgain', 'Try Again')}
            </Button>
          </div>
        ) : (
          <Button variant="primary" className="w-full" onClick={onClose}>
            {t('processing.error.closeAndRetry', 'Close & Try Again')}
          </Button>
        )}
      </div>
    </Modal>
  );
}
