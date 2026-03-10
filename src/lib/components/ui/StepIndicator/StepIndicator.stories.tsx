import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepIndicator } from './StepIndicator';

const steps = [
  { id: 1, label: 'Use Case' },
  { id: 2, label: 'API Setup' },
  { id: 3, label: 'Plan' },
];

const meta: Meta<typeof StepIndicator> = {
  title: 'UI/StepIndicator',
  component: StepIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
  },
  args: { steps },
};

export default meta;
type Story = StoryObj<typeof StepIndicator>;

export const Step1Active: Story = {
  args: { currentStep: 1 },
};

export const Step2Active: Story = {
  args: { currentStep: 2 },
};

export const Step3Active: Story = {
  args: { currentStep: 3 },
};

export const AllCompleted: Story = {
  args: { currentStep: 4 },
};
