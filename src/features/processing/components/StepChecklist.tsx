import { Check, Loader2, Circle } from 'lucide-react';
import { GlassCard, Heading, Text } from '@/lib';

export type StepStatus = 'completed' | 'processing' | 'pending';

export interface ProcessingStep {
  id: string;
  label: string;
  status: StepStatus;
}

export interface StepChecklistProps {
  steps: ProcessingStep[];
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'completed':
      return <Check className="w-5 h-5 text-accent-success" />;
    case 'processing':
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    case 'pending':
      return <Circle className="w-5 h-5 text-text-tertiary" />;
  }
}

export function StepChecklist({ steps }: StepChecklistProps) {
  return (
    <GlassCard variant="light" className="p-6">
      <Heading level="h3" className="mb-4">Processing Steps</Heading>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              flex items-center gap-3 p-3 rounded-[var(--radius-md)]
              transition-all duration-[var(--transition-normal)]
              ${step.status === 'processing' ? 'bg-[var(--color-primary-alpha-10)]' : ''}
              ${step.status === 'completed' ? 'opacity-75' : ''}
            `}
          >
            {/* Step Number/Icon */}
            <div className="flex-shrink-0">
              <StepIcon status={step.status} />
            </div>

            {/* Step Label */}
            <Text
              variant="body"
              color={step.status === 'pending' ? 'tertiary' : 'primary'}
              className={`flex-1 ${step.status === 'processing' ? 'font-medium' : ''}`}
            >
              {index + 1}. {step.label}
            </Text>

            {/* Status Badge */}
            {step.status === 'processing' && (
              <span className="text-xs text-primary font-medium px-2 py-1 bg-[var(--color-primary-alpha-10)] rounded-full">
                In Progress
              </span>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
