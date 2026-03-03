import { useTranslation } from 'react-i18next';
import { Tooltip } from '@/lib/components/ui/Tooltip/Tooltip';
import { Info } from 'lucide-react';
import { RadioCard } from '@/lib/components/form/RadioCard/RadioCard';

export type ProcessingMode = 'balanced' | 'quality';

export interface ProcessingModeSelectorProps {
  value: ProcessingMode;
  onChange: (mode: ProcessingMode) => void;
  disabled?: boolean;
}

function CreditsBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{
        backgroundColor: 'var(--color-primary-alpha-10)',
        color: 'var(--color-primary)',
      }}
    >
      {label}
    </span>
  );
}

export function ProcessingModeSelector({ value, onChange, disabled }: ProcessingModeSelectorProps) {
  const { t } = useTranslation();
  // Note: Both modes support audio up to ~23 minutes (1400s) per chunk
  // Audio files longer than this will be automatically chunked during processing

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <label
          className="block text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t('configuration.processingMode.title')}
        </label>
        <Tooltip
          content={t(
            'configuration.processingMode.tooltip',
            'Select how your audio will be processed for optimal results'
          )}
          placement="top"
        >
          <Info className="w-4 h-4 text-text-tertiary" />
        </Tooltip>
      </div>

      <div className="flex flex-col gap-3">
        <RadioCard
          size="sm"
          name="mode"
          value="balanced"
          checked={value === 'balanced'}
          onChange={(v) => !disabled && onChange(v as ProcessingMode)}
          disabled={disabled}
          title={t('configuration.processingMode.balanced.title')}
          description={t('configuration.processingMode.balanced.description')}
          badge={<CreditsBadge label={t('configuration.processingMode.balanced.credits')} />}
        />
        <RadioCard
          size="sm"
          name="mode"
          value="quality"
          checked={value === 'quality'}
          onChange={(v) => !disabled && onChange(v as ProcessingMode)}
          disabled={disabled}
          title={t('configuration.processingMode.quality.title')}
          description={t('configuration.processingMode.quality.description')}
          badge={<CreditsBadge label={t('configuration.processingMode.quality.credits')} />}
        />
      </div>
    </div>
  );
}
