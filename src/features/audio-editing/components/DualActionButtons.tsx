import { Button } from '@/lib';
import { useTranslation } from 'react-i18next';
import { Scissors, FileAudio } from 'lucide-react';

export interface DualActionButtonsProps {
  selectionDuration?: string;
  fullDuration: string;
  hasSelection: boolean;
  onProcessSelection: () => void;
  onProcessFull: () => void;
  disabled?: boolean;
}

export function DualActionButtons({
  selectionDuration,
  fullDuration,
  hasSelection,
  onProcessSelection,
  onProcessFull,
  disabled = false,
}: DualActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Process Selection Button */}
      {hasSelection && selectionDuration && (
        <Button
          onClick={onProcessSelection}
          disabled={disabled}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Scissors className="w-4 h-4" />
          <span>{t('audioEditing.actions.processSelection')}</span>
          <span className="text-xs text-text-tertiary">({selectionDuration})</span>
        </Button>
      )}

      {/* Process Full Audio Button */}
      <Button
        onClick={onProcessFull}
        disabled={disabled}
        variant="primary"
        className="flex-1 flex items-center justify-center gap-2"
      >
        <FileAudio className="w-4 h-4" />
        <span>{t('audioEditing.actions.processFullAudio')}</span>
        <span className="text-xs opacity-75">({fullDuration})</span>
      </Button>
    </div>
  );
}
