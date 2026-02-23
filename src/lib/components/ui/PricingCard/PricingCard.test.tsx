import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingCard } from './PricingCard';
import type { PricingPlan } from './PricingCard';

const plan: PricingPlan = {
  id: 'pro',
  name: 'Pro',
  description: 'Best for power users',
  monthlyPrice: '$12',
  annualPrice: '$99',
  features: ['Unlimited transcriptions', 'Speaker diarization', 'Priority support'],
  cta: 'Get Pro',
  popular: true,
  badge: 'Most Popular',
};

describe('PricingCard', () => {
  it('renders plan name and description', () => {
    render(
      <PricingCard plan={plan} isCurrentPlan={false} billingPeriod="monthly" onSelect={vi.fn()} />
    );
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Best for power users')).toBeInTheDocument();
  });

  it('shows monthly price when billingPeriod is monthly', () => {
    render(
      <PricingCard plan={plan} isCurrentPlan={false} billingPeriod="monthly" onSelect={vi.fn()} />
    );
    expect(screen.getByText('$12')).toBeInTheDocument();
  });

  it('shows annual price when billingPeriod is annual', () => {
    render(
      <PricingCard plan={plan} isCurrentPlan={false} billingPeriod="annual" onSelect={vi.fn()} />
    );
    expect(screen.getByText('$99')).toBeInTheDocument();
  });

  it('renders all features', () => {
    render(
      <PricingCard plan={plan} isCurrentPlan={false} billingPeriod="monthly" onSelect={vi.fn()} />
    );
    expect(screen.getByText('Unlimited transcriptions')).toBeInTheDocument();
    expect(screen.getByText('Speaker diarization')).toBeInTheDocument();
    expect(screen.getByText('Priority support')).toBeInTheDocument();
  });

  it('shows badge when plan has badge', () => {
    render(
      <PricingCard plan={plan} isCurrentPlan={false} billingPeriod="monthly" onSelect={vi.fn()} />
    );
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('shows "Current Plan" indicator when isCurrentPlan is true', () => {
    render(
      <PricingCard plan={plan} isCurrentPlan={true} billingPeriod="monthly" onSelect={vi.fn()} />
    );
    expect(screen.getByText(/current plan/i)).toBeInTheDocument();
  });

  it('calls onSelect when CTA button clicked', () => {
    const onSelect = vi.fn();
    render(
      <PricingCard plan={plan} isCurrentPlan={false} billingPeriod="monthly" onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText('Get Pro'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('disables CTA when isCurrentPlan is true', () => {
    render(
      <PricingCard plan={plan} isCurrentPlan={true} billingPeriod="monthly" onSelect={vi.fn()} />
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
