import type { Meta, StoryObj } from '@storybook/react-vite';
import { PricingCard } from './PricingCard';
import type { PricingPlan } from './PricingCard';

const freePlan: PricingPlan = {
  id: 'free',
  name: 'Free',
  description: 'Get started with AI transcription',
  monthlyPrice: '$0',
  annualPrice: '$0',
  features: ['5 transcriptions/month', 'Basic summary', 'Email support'],
  cta: 'Get Started',
};

const proPlan: PricingPlan = {
  id: 'pro',
  name: 'Pro',
  description: 'Best for power users',
  monthlyPrice: '$12',
  annualPrice: '$99',
  features: ['Unlimited transcriptions', 'Speaker diarization', 'Priority support', 'PDF export'],
  cta: 'Get Pro',
  popular: true,
  badge: 'Most Popular',
};

const teamPlan: PricingPlan = {
  id: 'team',
  name: 'Team',
  description: 'For teams and organizations',
  monthlyPrice: '$49',
  annualPrice: '$399',
  features: ['Everything in Pro', 'Team collaboration', 'Custom integrations', 'SLA support'],
  cta: 'Contact Sales',
};

const meta: Meta<typeof PricingCard> = {
  title: 'UI/PricingCard',
  component: PricingCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof PricingCard>;

export const Free: Story = {
  args: { plan: freePlan, isCurrentPlan: true, billingPeriod: 'monthly', onSelect: () => {} },
};

export const Pro: Story = {
  args: { plan: proPlan, isCurrentPlan: false, billingPeriod: 'monthly', onSelect: () => {} },
};

export const ProAnnual: Story = {
  args: { plan: proPlan, isCurrentPlan: false, billingPeriod: 'annual', onSelect: () => {} },
};

export const Team: Story = {
  args: { plan: teamPlan, isCurrentPlan: false, billingPeriod: 'monthly', onSelect: () => {} },
};
