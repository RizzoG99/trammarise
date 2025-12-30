import { GlassCard } from '../../../components/ui/GlassCard';
import { Text } from '../../../components/ui/Text';
import { Info } from 'lucide-react';

export interface CostTransparencyCardProps {
  estimatedCredits: number;
  mode: string;
}

export function CostTransparencyCard({ estimatedCredits, mode }: CostTransparencyCardProps) {
  return (
    <GlassCard variant="primary" className="p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <Text variant="caption" color="primary" className="font-medium mb-1">
            Estimated Cost
          </Text>
          <Text variant="small" color="secondary">
            {mode === 'balanced' ? 'Balanced mode' : 'Quality mode'}: ~{estimatedCredits} credits for this file
          </Text>
          <Text variant="small" color="tertiary" className="mt-2">
            Final cost depends on audio length and complexity
          </Text>
        </div>
      </div>
    </GlassCard>
  );
}
