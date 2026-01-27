import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard, Heading } from '@/lib';
import {
  ProcessingModeSelector,
  type ProcessingMode,
} from '../../configuration/components/ProcessingModeSelector';
import { CostTransparencyCard } from '../../configuration/components/CostTransparencyCard';
import { useTranslation } from 'react-i18next';

export interface CollapsibleConfigPanelProps {
  onConfigChange?: (config: { mode: ProcessingMode }) => void;
}

export function CollapsibleConfigPanel({ onConfigChange }: CollapsibleConfigPanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<ProcessingMode>('balanced');

  const handleModeChange = (newMode: ProcessingMode) => {
    setMode(newMode);
    onConfigChange?.({ mode: newMode });
  };

  const estimatedCredits = mode === 'balanced' ? 10 : 25;

  return (
    <GlassCard variant="light" className="mt-6">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--color-bg-surface-hover)] transition-colors duration-[var(--transition-fast)] rounded-[var(--radius-lg)]"
      >
        <div>
          <Heading level="h3" className="mb-1">
            {t('configPanel.title')}
          </Heading>
          <p className="text-sm text-text-secondary">
            {isExpanded
              ? t('configPanel.customize')
              : t('configPanel.modeLabel', {
                  mode:
                    mode === 'balanced'
                      ? t('costTransparency.balancedMode')
                      : t('costTransparency.qualityMode'),
                  credits: estimatedCredits,
                })}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-tertiary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-tertiary" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <ProcessingModeSelector value={mode} onChange={handleModeChange} />
          <CostTransparencyCard estimatedCredits={estimatedCredits} mode={mode} />
        </div>
      )}
    </GlassCard>
  );
}
