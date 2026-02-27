import { Check } from 'lucide-react';

export interface Step {
  id: number;
  label: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

type StepStatus = 'completed' | 'active' | 'pending';

function getStepStatus(stepId: number, currentStep: number): StepStatus {
  if (stepId < currentStep) return 'completed';
  if (stepId === currentStep) return 'active';
  return 'pending';
}

/**
 * StepIndicator - Horizontal wizard step progress indicator.
 * Completed steps show a checkmark, active step uses --color-primary,
 * pending steps use --color-border.
 */
export function StepIndicator({ steps, currentStep, className = '' }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className={`flex items-center justify-center ${className}`}>
      <ol className="flex items-center gap-0">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, currentStep);
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              data-status={status}
              aria-current={status === 'active' ? 'step' : undefined}
              className="flex items-center"
            >
              {/* Step dot + label */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                    'transition-all duration-[var(--transition-normal)] border-2',
                    status === 'completed'
                      ? 'bg-[var(--color-accent-success)] border-[var(--color-accent-success)] text-white'
                      : status === 'active'
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                        : 'bg-transparent border-[var(--color-border)] text-text-tertiary',
                  ].join(' ')}
                >
                  {status === 'completed' ? <Check className="w-4 h-4" /> : <span>{step.id}</span>}
                </div>
                <span
                  className={[
                    'text-xs font-medium whitespace-nowrap',
                    status === 'active'
                      ? 'text-[var(--color-primary)]'
                      : status === 'completed'
                        ? 'text-[var(--color-text-secondary)]'
                        : 'text-text-tertiary',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={[
                    'w-16 h-0.5 mx-2 mb-5 transition-colors duration-[var(--transition-normal)]',
                    status === 'completed'
                      ? 'bg-[var(--color-accent-success)]'
                      : 'bg-[var(--color-border)]',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
