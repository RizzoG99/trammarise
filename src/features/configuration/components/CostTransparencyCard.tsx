import { GlassCard, Text } from '@/lib';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';

export interface CostTransparencyCardProps {
  estimatedCredits: number;
  mode: string;
}

export function CostTransparencyCard({ estimatedCredits, mode }: CostTransparencyCardProps) {
  const { t } = useTranslation();
  return (
    <GlassCard variant="primary" className="p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <Text variant="caption" color="primary" className="font-medium mb-1">
            {t('costTransparency.title')}
          </Text>
          <Text variant="small" color="secondary">
            {t(`costTransparency.${mode === 'balanced' ? 'balancedMode' : 'qualityMode'}`)}:{' '}
            {t('costTransparency.estimate', { credits: estimatedCredits })}
          </Text>
          <Text variant="small" color="tertiary" className="mt-2">
            {t('costTransparency.disclaimer')}
          </Text>
        </div>
      </div>
    </GlassCard>
  );
}
