import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepIndicator } from './StepIndicator';

const steps = [
  { id: 1, label: 'Use Case' },
  { id: 2, label: 'API Setup' },
  { id: 3, label: 'Plan' },
];

describe('StepIndicator', () => {
  it('renders all step labels', () => {
    render(<StepIndicator steps={steps} currentStep={1} />);
    expect(screen.getByText('Use Case')).toBeInTheDocument();
    expect(screen.getByText('API Setup')).toBeInTheDocument();
    expect(screen.getByText('Plan')).toBeInTheDocument();
  });

  it('marks current step with aria-current', () => {
    render(<StepIndicator steps={steps} currentStep={2} />);
    const currentItem = screen.getByText('API Setup').closest('[aria-current]');
    expect(currentItem).toHaveAttribute('aria-current', 'step');
  });

  it('marks completed steps with completed styling', () => {
    render(<StepIndicator steps={steps} currentStep={3} />);
    // Steps 1 and 2 are completed
    const step1 = screen.getByText('Use Case').closest('[data-status]');
    const step2 = screen.getByText('API Setup').closest('[data-status]');
    expect(step1).toHaveAttribute('data-status', 'completed');
    expect(step2).toHaveAttribute('data-status', 'completed');
  });

  it('marks pending steps with pending styling', () => {
    render(<StepIndicator steps={steps} currentStep={1} />);
    const step3 = screen.getByText('Plan').closest('[data-status]');
    expect(step3).toHaveAttribute('data-status', 'pending');
  });

  it('renders step numbers for active and pending steps', () => {
    render(<StepIndicator steps={steps} currentStep={2} />);
    // Step 1 is completed → shows checkmark, no "1" text
    // Step 2 is active → shows "2"
    expect(screen.getByText('2')).toBeInTheDocument();
    // Step 3 is pending → shows "3"
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
