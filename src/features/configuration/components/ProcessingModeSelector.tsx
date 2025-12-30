import { RadioCard } from '../../../components/ui/RadioCard';
import { Heading } from '../../../components/ui/Heading';
import { Text } from '../../../components/ui/Text';

export type ProcessingMode = 'balanced' | 'quality';

export interface ProcessingModeSelectorProps {
  value: ProcessingMode;
  onChange: (mode: ProcessingMode) => void;
}

export function ProcessingModeSelector({ value, onChange }: ProcessingModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Heading level="h3" className="mb-2">Processing Mode</Heading>
        <Text variant="caption" color="secondary">
          Choose the quality level for transcription and summarization
        </Text>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Balanced Mode */}
        <RadioCard
          name="processing-mode"
          value="balanced"
          checked={value === 'balanced'}
          onChange={(val) => onChange(val as ProcessingMode)}
          title={
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span>Balanced</span>
                <span className="text-sm font-normal" style={{ color: 'var(--color-primary)' }}>~10 credits</span>
              </div>
            </div>
          }
          description="Fast processing with good quality"
        />

        {/* Quality Mode */}
        <RadioCard
          name="processing-mode"
          value="quality"
          checked={value === 'quality'}
          onChange={(val) => onChange(val as ProcessingMode)}
          title={
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span>Quality</span>
                <span className="text-sm font-normal" style={{ color: 'var(--color-primary)' }}>~25 credits</span>
              </div>
            </div>
          }
          description="Best quality, longer processing time"
        />
      </div>
    </div>
  );
}
