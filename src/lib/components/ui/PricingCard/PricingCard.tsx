import { Check, Zap } from 'lucide-react';
import { GlassCard } from '../GlassCard';
import { Button } from '../Button';
import { Heading } from '../Heading';
import { Text } from '../Text';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  cta: string;
  popular?: boolean;
  badge?: string;
}

export interface PricingCardProps {
  plan: PricingPlan;
  isCurrentPlan: boolean;
  billingPeriod: 'monthly' | 'annual';
  onSelect: () => void;
  className?: string;
}

/**
 * PricingCard - Reusable pricing plan card.
 * Supports monthly/annual toggle, popular highlighting, and current plan state.
 */
export function PricingCard({
  plan,
  isCurrentPlan,
  billingPeriod,
  onSelect,
  className = '',
}: PricingCardProps) {
  const price = billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const interval = billingPeriod === 'annual' ? '/ year' : '/ month';

  return (
    <GlassCard
      variant={plan.popular ? 'glow' : 'dark'}
      className={[
        'p-8 h-full transition-all duration-300 hover:-translate-y-1',
        plan.popular
          ? 'border-[var(--color-primary)]/50 scale-105 shadow-2xl shadow-[var(--color-primary)]/20'
          : 'border-white/5 hover:border-white/10',
        className,
      ].join(' ')}
    >
      {plan.badge && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] px-3 py-1 text-sm font-semibold text-white">
            <Zap className="w-4 h-4" aria-hidden="true" />
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-4">
        <Heading level="h3" className="text-2xl font-bold text-text-primary mb-2">
          {plan.name}
        </Heading>
        <Text variant="body" className="text-text-secondary">
          {plan.description}
        </Text>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-text-primary">{price}</span>
          <span className="text-text-secondary">{interval}</span>
        </div>
      </div>

      {isCurrentPlan ? (
        <Button variant="outline" disabled className="w-full mb-6 opacity-60">
          Current Plan
        </Button>
      ) : (
        <Button
          variant={plan.popular ? 'primary' : 'outline'}
          onClick={onSelect}
          className="w-full mb-6"
        >
          {plan.cta}
        </Button>
      )}

      <ul className="space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              className="w-5 h-5 text-[var(--color-accent-success)] flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <span className="text-sm text-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
