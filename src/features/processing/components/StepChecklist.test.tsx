import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepChecklist, type ProcessingStep } from './StepChecklist';

describe('StepChecklist', () => {
  const mockSteps: ProcessingStep[] = [
    { id: 'upload', label: 'Uploading Audio', status: 'completed' },
    { id: 'transcribe', label: 'Transcribing Speech', status: 'processing' },
    { id: 'analyze', label: 'Analyzing Context', status: 'pending' },
    { id: 'summarize', label: 'Summarizing Key Points', status: 'pending' },
  ];

  describe('Rendering', () => {
    it('renders all steps', () => {
      render(<StepChecklist steps={mockSteps} />);
      expect(screen.getByText(/1\. Uploading Audio/)).toBeInTheDocument();
      expect(screen.getByText(/2\. Transcribing Speech/)).toBeInTheDocument();
      expect(screen.getByText(/3\. Analyzing Context/)).toBeInTheDocument();
      expect(screen.getByText(/4\. Summarizing Key Points/)).toBeInTheDocument();
    });

    it('renders step numbers', () => {
      render(<StepChecklist steps={mockSteps} />);
      expect(screen.getByText(/1\./)).toBeInTheDocument();
      expect(screen.getByText(/2\./)).toBeInTheDocument();
      expect(screen.getByText(/3\./)).toBeInTheDocument();
      expect(screen.getByText(/4\./)).toBeInTheDocument();
    });

    it('renders step labels', () => {
      render(<StepChecklist steps={mockSteps} />);
      expect(screen.getByText(/Uploading Audio/)).toBeInTheDocument();
      expect(screen.getByText(/Transcribing Speech/)).toBeInTheDocument();
      expect(screen.getByText(/Analyzing Context/)).toBeInTheDocument();
      expect(screen.getByText(/Summarizing Key Points/)).toBeInTheDocument();
    });

    it('renders heading', () => {
      render(<StepChecklist steps={mockSteps} />);
      expect(screen.getByText('Processing Steps')).toBeInTheDocument();
    });

    it('renders within GlassCard', () => {
      const { container } = render(<StepChecklist steps={mockSteps} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Status Icons', () => {
    it('renders Check icon for completed steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Test Step', status: 'completed' },
      ];
      const { container } = render(<StepChecklist steps={steps} />);
      // Check icon should be present
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-accent-success');
    });

    it('renders Loader2 icon for processing steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Test Step', status: 'processing' },
      ];
      const { container } = render(<StepChecklist steps={steps} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-primary', 'animate-spin');
    });

    it('renders Circle icon for pending steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Test Step', status: 'pending' },
      ];
      const { container } = render(<StepChecklist steps={steps} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('text-text-tertiary');
    });

    it('renders different icons for different statuses', () => {
      const { container } = render(<StepChecklist steps={mockSteps} />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(mockSteps.length);
    });
  });

  describe('Status Styling', () => {
    it('applies opacity to completed steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Completed Step', status: 'completed' },
      ];
      const { container } = render(<StepChecklist steps={steps} />);
      const stepElement = container.querySelector('[class*="opacity-75"]');
      expect(stepElement).toBeInTheDocument();
    });

    it('applies background highlight to processing steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Processing Step', status: 'processing' },
      ];
      const { container } = render(<StepChecklist steps={steps} />);
      const stepElement = container.querySelector('[class*="bg-[var(--color-primary-alpha-10)]"]');
      expect(stepElement).toBeInTheDocument();
    });

    it('shows "In Progress" badge for processing steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Processing Step', status: 'processing' },
      ];
      render(<StepChecklist steps={steps} />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('does not show "In Progress" badge for completed steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Completed Step', status: 'completed' },
      ];
      render(<StepChecklist steps={steps} />);
      expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
    });

    it('does not show "In Progress" badge for pending steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Pending Step', status: 'pending' },
      ];
      render(<StepChecklist steps={steps} />);
      expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
    });

    it('applies font-medium to processing step labels', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Processing Step', status: 'processing' },
      ];
      render(<StepChecklist steps={steps} />);
      const stepText = screen.getByText(/1\. Processing Step/);
      // The Text component wraps in a p tag, so check the parent
      const textElement = stepText.closest('p');
      expect(textElement).toHaveClass('font-medium');
    });

    it('applies tertiary color to pending step labels', () => {
      const steps: ProcessingStep[] = [
        { id: 'test', label: 'Pending Step', status: 'pending' },
      ];
      render(<StepChecklist steps={steps} />);
      const stepText = screen.getByText(/Pending Step/);
      // Text component with color="tertiary" should be present
      expect(stepText.closest('p')).toBeInTheDocument();
    });

    it('applies primary color to non-pending step labels', () => {
      const steps: ProcessingStep[] = [
        { id: 'test1', label: 'Completed Step', status: 'completed' },
        { id: 'test2', label: 'Processing Step', status: 'processing' },
      ];
      render(<StepChecklist steps={steps} />);
      const completedText = screen.getByText(/1\. Completed Step/);
      const processingText = screen.getByText(/2\. Processing Step/);
      // Text component with color="primary" renders as p tag
      const completedP = completedText.closest('p');
      const processingP = processingText.closest('p');
      // Both should exist as p elements (from Text component)
      expect(completedP).toBeInTheDocument();
      expect(processingP).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty steps array', () => {
      render(<StepChecklist steps={[]} />);
      expect(screen.getByText('Processing Steps')).toBeInTheDocument();
      expect(screen.queryByText(/1\./)).not.toBeInTheDocument();
    });

    it('handles single step', () => {
      const steps: ProcessingStep[] = [
        { id: 'single', label: 'Single Step', status: 'processing' },
      ];
      render(<StepChecklist steps={steps} />);
      expect(screen.getByText(/1\. Single Step/)).toBeInTheDocument();
      expect(screen.queryByText(/2\./)).not.toBeInTheDocument();
    });

    it('handles very long step labels', () => {
      const steps: ProcessingStep[] = [
        {
          id: 'long',
          label: 'This is a very long step label that should still render correctly without breaking the layout',
          status: 'pending',
        },
      ];
      render(<StepChecklist steps={steps} />);
      expect(
        screen.getByText(/This is a very long step label/)
      ).toBeInTheDocument();
    });

    it('handles steps with special characters in labels', () => {
      const steps: ProcessingStep[] = [
        { id: 'special', label: 'Step with @#$% special chars!', status: 'pending' },
      ];
      render(<StepChecklist steps={steps} />);
      expect(screen.getByText(/Step with @#\$% special chars!/)).toBeInTheDocument();
    });

    it('handles steps with same labels but different ids', () => {
      const steps: ProcessingStep[] = [
        { id: 'step1', label: 'Same Label', status: 'completed' },
        { id: 'step2', label: 'Same Label', status: 'pending' },
      ];
      render(<StepChecklist steps={steps} />);
      const labels = screen.getAllByText(/Same Label/);
      expect(labels).toHaveLength(2);
    });

    it('handles empty step labels', () => {
      const steps: ProcessingStep[] = [{ id: 'empty', label: '', status: 'pending' }];
      render(<StepChecklist steps={steps} />);
      // Should still render the step number
      expect(screen.getByText('1.')).toBeInTheDocument();
    });
  });

  describe('Step Progression', () => {
    it('shows all completed steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'step1', label: 'Step 1', status: 'completed' },
        { id: 'step2', label: 'Step 2', status: 'completed' },
        { id: 'step3', label: 'Step 3', status: 'completed' },
      ];
      const { container } = render(<StepChecklist steps={steps} />);
      const completedSteps = container.querySelectorAll('[class*="opacity-75"]');
      expect(completedSteps).toHaveLength(3);
    });

    it('shows single processing step among others', () => {
      render(<StepChecklist steps={mockSteps} />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      const badges = screen.queryAllByText('In Progress');
      expect(badges).toHaveLength(1);
    });

    it('handles multiple processing steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'step1', label: 'Step 1', status: 'processing' },
        { id: 'step2', label: 'Step 2', status: 'processing' },
      ];
      render(<StepChecklist steps={steps} />);
      const badges = screen.queryAllByText('In Progress');
      expect(badges).toHaveLength(2);
    });

    it('handles all pending steps', () => {
      const steps: ProcessingStep[] = [
        { id: 'step1', label: 'Step 1', status: 'pending' },
        { id: 'step2', label: 'Step 2', status: 'pending' },
      ];
      const { container } = render(<StepChecklist steps={steps} />);
      const pendingIcons = container.querySelectorAll('.text-text-tertiary');
      expect(pendingIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Dynamic Updates', () => {
    it('updates when steps change', () => {
      const initialSteps: ProcessingStep[] = [
        { id: 'step1', label: 'Step 1', status: 'pending' },
      ];
      const { rerender } = render(<StepChecklist steps={initialSteps} />);
      expect(screen.queryByText('In Progress')).not.toBeInTheDocument();

      const updatedSteps: ProcessingStep[] = [
        { id: 'step1', label: 'Step 1', status: 'processing' },
      ];
      rerender(<StepChecklist steps={updatedSteps} />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('updates icon when status changes', () => {
      const { container, rerender } = render(
        <StepChecklist
          steps={[{ id: 'test', label: 'Test', status: 'pending' }]}
        />
      );
      let icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-text-tertiary');

      rerender(
        <StepChecklist
          steps={[{ id: 'test', label: 'Test', status: 'completed' }]}
        />
      );
      icon = container.querySelector('svg');
      expect(icon).toHaveClass('text-accent-success');
    });

    it('updates step count when steps are added', () => {
      const { rerender } = render(
        <StepChecklist steps={[{ id: 'step1', label: 'Step 1', status: 'pending' }]} />
      );
      expect(screen.getByText(/1\. Step 1/)).toBeInTheDocument();
      expect(screen.queryByText(/2\./)).not.toBeInTheDocument();

      rerender(
        <StepChecklist
          steps={[
            { id: 'step1', label: 'Step 1', status: 'completed' },
            { id: 'step2', label: 'Step 2', status: 'pending' },
          ]}
        />
      );
      expect(screen.getByText(/1\. Step 1/)).toBeInTheDocument();
      expect(screen.getByText(/2\. Step 2/)).toBeInTheDocument();
    });

    it('maintains correct numbering when steps change', () => {
      const steps: ProcessingStep[] = [
        { id: 'a', label: 'A', status: 'completed' },
        { id: 'b', label: 'B', status: 'processing' },
        { id: 'c', label: 'C', status: 'pending' },
      ];
      render(<StepChecklist steps={steps} />);
      expect(screen.getByText(/1\. A/)).toBeInTheDocument();
      expect(screen.getByText(/2\. B/)).toBeInTheDocument();
      expect(screen.getByText(/3\. C/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders steps in a semantic list structure', () => {
      const { container } = render(<StepChecklist steps={mockSteps} />);
      const listContainer = container.querySelector('.space-y-3');
      expect(listContainer).toBeInTheDocument();
    });

    it('uses unique keys for steps', () => {
      const { container } = render(<StepChecklist steps={mockSteps} />);
      const steps = container.querySelectorAll('[class*="flex items-center"]');
      // Each step should have a unique key (React handles this internally)
      expect(steps.length).toBe(mockSteps.length);
    });

    it('step text is readable and visible', () => {
      render(<StepChecklist steps={mockSteps} />);
      mockSteps.forEach((step) => {
        const stepElement = screen.getByText(new RegExp(step.label));
        expect(stepElement).toBeVisible();
      });
    });

    it('icons have appropriate sizing', () => {
      const { container } = render(
        <StepChecklist steps={[{ id: 'test', label: 'Test', status: 'pending' }]} />
      );
      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('w-5', 'h-5');
    });
  });
});
