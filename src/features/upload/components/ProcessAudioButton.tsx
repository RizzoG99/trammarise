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
                   text-white font-medium py-3 px-8 rounded-xl shadow-lg
                   transition-all disabled:opacity-50
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
            <Sparkles size={18} />
          </>
        )}
      </button>
    </div>
  );
}
