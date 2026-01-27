import { Text } from '@/lib';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface TokenUsageMeterProps {
  tokenUsage: number;
  tokenLimit: number;
  percentage: number;
  isNearLimit: boolean;
}

export function TokenUsageMeter({
  tokenUsage,
  tokenLimit,
  percentage,
  isNearLimit,
}: TokenUsageMeterProps) {
  const { t } = useTranslation();
  const barColor = isNearLimit ? 'bg-accent-warning' : 'bg-primary';

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <Text variant="caption" color="secondary" className="font-medium">
          {t('tokenUsage.label')}
        </Text>
        <div className="flex items-center gap-2">
          {isNearLimit && <AlertCircle className="w-4 h-4 text-accent-warning" />}
          <Text variant="caption" color={isNearLimit ? 'primary' : 'secondary'}>
            {tokenUsage}/{tokenLimit}
          </Text>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isNearLimit && (
        <Text variant="small" color="tertiary" className="mt-2">
          {t('tokenUsage.warning')}
        </Text>
      )}
    </div>
  );
}
