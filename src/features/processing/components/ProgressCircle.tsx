import { GlassCard, Heading, Text } from '@/lib';
import { useTranslation } from 'react-i18next';

export interface ProgressCircleProps {
  progress: number;
  step: string;
  timeEstimate?: string;
}

export function ProgressCircle({ progress, step, timeEstimate }: ProgressCircleProps) {
  const { t } = useTranslation();
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <GlassCard variant="light" className="p-8 flex flex-col items-center justify-center">
      {/* SVG Progress Circle */}
      <div className="relative w-48 h-48 mb-6">
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background Circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="var(--color-border)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="var(--color-primary)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Heading level="hero" className="text-primary">{progress}%</Heading>
        </div>
      </div>

      {/* Step Info */}
      <Text variant="body" color="primary" className="font-medium mb-2 capitalize">
        {step.replace('-', ' ')}
      </Text>

      {timeEstimate && (
        <Text variant="caption" color="tertiary">
          {t('processing.estimatedTime')}: {timeEstimate}
        </Text>
      )}

      {/* Animated Wave Background (Optional) */}
      <div className="mt-6 w-full h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </GlassCard>
  );
}
