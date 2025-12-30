import { Button } from '../../../components/ui/Button';
import { Text } from '../../../components/ui/Text';

export interface ProcessAudioButtonProps {
  disabled: boolean;
  estimatedCredits: number;
  onProcess: () => void;
}

export function ProcessAudioButton({
  disabled,
  estimatedCredits,
  onProcess,
}: ProcessAudioButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={onProcess}
        disabled={disabled}
        variant="primary"
        className="px-8 py-4 text-lg"
      >
        Process Audio
      </Button>

      <Text variant="caption" color="tertiary">
        Estimated: ~{estimatedCredits} credits
      </Text>
    </div>
  );
}
