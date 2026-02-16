import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/lib';

export interface ProcessAudioButtonProps {
  disabled: boolean;
  onProcess: () => void;
  isLoading?: boolean;
}

export function ProcessAudioButton({
  disabled,
  onProcess,
  isLoading = false,
}: ProcessAudioButtonProps) {
  const { t } = useTranslation();
  const isDisabled = disabled || isLoading;

  return (
    <div className="mt-8 flex justify-end">
      <button
        onClick={onProcess}
        disabled={isDisabled}
        className="w-full sm:w-auto flex items-center justify-center gap-2
                   text-white font-bold py-4 px-10 rounded-xl shadow-lg
                   hover:shadow-xl transition-all disabled:opacity-50
                   disabled:cursor-not-allowed cursor-pointer group"
        style={{
          backgroundColor: isDisabled ? 'var(--color-text-tertiary)' : 'var(--color-primary)',
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }
        }}
      >
        {isLoading ? (
          <>
            {t('home.processingButton', 'Processing...')}
            <LoadingSpinner size="sm" className="p-0" />
          </>
        ) : (
          <>
            {t('home.processButton')}
            <Sparkles className="group-hover:animate-bounce" size={20} />
          </>
        )}
      </button>
    </div>
  );
}
