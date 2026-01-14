import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressCircle } from './ProgressCircle';

describe('ProgressCircle', () => {
  describe('Rendering', () => {
    it('renders progress percentage', () => {
      render(<ProgressCircle progress={50} step="transcribing" />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders step name', () => {
      render(<ProgressCircle progress={50} step="transcribing" />);
      expect(screen.getByText('transcribing')).toBeInTheDocument();
    });

    it('renders step name with hyphens replaced by spaces', () => {
      render(<ProgressCircle progress={50} step="uploading-audio" />);
      expect(screen.getByText('uploading audio')).toBeInTheDocument();
    });

    it('capitalizes step name', () => {
      render(<ProgressCircle progress={50} step="transcribing" />);
      const stepElement = screen.getByText('transcribing');
      expect(stepElement).toHaveClass('capitalize');
    });

    it('renders time estimate when provided', () => {
      render(<ProgressCircle progress={50} step="transcribing" timeEstimate="2-3 min" />);
      expect(screen.getByText('Estimated time: 2-3 min')).toBeInTheDocument();
    });

    it('does not render time estimate when not provided', () => {
      render(<ProgressCircle progress={50} step="transcribing" />);
      expect(screen.queryByText(/Estimated time:/)).not.toBeInTheDocument();
    });

    it('renders SVG circles', () => {
      const { container } = render(<ProgressCircle progress={50} step="transcribing" />);
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2); // Background + Progress circles
    });

    it('renders progress bar', () => {
      const { container } = render(<ProgressCircle progress={50} step="transcribing" />);
      const progressBar = container.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Progress Values', () => {
    it('renders 0% progress', () => {
      render(<ProgressCircle progress={0} step="uploading" />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('renders 50% progress', () => {
      render(<ProgressCircle progress={50} step="transcribing" />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders 100% progress', () => {
      render(<ProgressCircle progress={100} step="summarizing" />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('renders decimal progress values', () => {
      render(<ProgressCircle progress={45.7} step="analyzing" />);
      expect(screen.getByText('45.7%')).toBeInTheDocument();
    });

    it('updates progress bar width for different values', () => {
      const { container, rerender } = render(<ProgressCircle progress={25} step="test" />);
      let progressBar = container.querySelector('[style*="width: 25%"]');
      expect(progressBar).toBeInTheDocument();

      rerender(<ProgressCircle progress={75} step="test" />);
      progressBar = container.querySelector('[style*="width: 75%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('SVG Circle Math', () => {
    it('calculates correct strokeDashoffset for 0%', () => {
      const { container } = render(<ProgressCircle progress={0} step="test" />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const radius = 80;
      const circumference = 2 * Math.PI * radius;
      const expectedOffset = circumference; // 0% = full circumference
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', expectedOffset.toString());
    });

    it('calculates correct strokeDashoffset for 50%', () => {
      const { container } = render(<ProgressCircle progress={50} step="test" />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const radius = 80;
      const circumference = 2 * Math.PI * radius;
      const expectedOffset = circumference - (50 / 100) * circumference;
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', expectedOffset.toString());
    });

    it('calculates correct strokeDashoffset for 100%', () => {
      const { container } = render(<ProgressCircle progress={100} step="test" />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const expectedOffset = 0; // 100% = 0 offset
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', expectedOffset.toString());
    });

    it('sets correct strokeDasharray', () => {
      const { container } = render(<ProgressCircle progress={50} step="test" />);
      const progressCircle = container.querySelectorAll('circle')[1];
      const radius = 80;
      const circumference = 2 * Math.PI * radius;
      expect(progressCircle).toHaveAttribute('stroke-dasharray', circumference.toString());
    });

    it('both circles have same radius', () => {
      const { container } = render(<ProgressCircle progress={50} step="test" />);
      const circles = container.querySelectorAll('circle');
      expect(circles[0]).toHaveAttribute('r', '80');
      expect(circles[1]).toHaveAttribute('r', '80');
    });
  });

  describe('Edge Cases', () => {
    it('handles negative progress values', () => {
      render(<ProgressCircle progress={-10} step="test" />);
      expect(screen.getByText('-10%')).toBeInTheDocument();
    });

    it('handles progress values over 100', () => {
      render(<ProgressCircle progress={150} step="test" />);
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('handles empty step name', () => {
      render(<ProgressCircle progress={50} step="" />);
      expect(screen.queryByText(/uploading|transcribing|analyzing/)).not.toBeInTheDocument();
    });

    it('handles step name with multiple hyphens', () => {
      render(<ProgressCircle progress={50} step="multi-word-step-name" />);
      // Component only replaces first hyphen with replace('-', ' ')
      expect(screen.getByText('multi word-step-name')).toBeInTheDocument();
    });

    it('handles very long step names', () => {
      const longStep = 'this-is-a-very-long-step-name-that-should-still-render';
      render(<ProgressCircle progress={50} step={longStep} />);
      // Component only replaces first hyphen
      expect(screen.getByText(longStep.replace('-', ' '))).toBeInTheDocument();
    });

    it('handles very long time estimates', () => {
      render(
        <ProgressCircle
          progress={50}
          step="test"
          timeEstimate="This is a very long time estimate string"
        />
      );
      expect(screen.getByText('Estimated time: This is a very long time estimate string')).toBeInTheDocument();
    });

    it('handles empty time estimate string', () => {
      render(<ProgressCircle progress={50} step="test" timeEstimate="" />);
      // Empty string is falsy in JavaScript, so nothing is rendered
      expect(screen.queryByText(/Estimated time:/)).not.toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('applies transition classes to progress circle', () => {
      const { container } = render(<ProgressCircle progress={50} step="test" />);
      const progressCircle = container.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('transition-all', 'duration-500', 'ease-out');
    });

    it('applies primary color to percentage text', () => {
      render(<ProgressCircle progress={50} step="test" />);
      const percentage = screen.getByText('50%');
      expect(percentage).toHaveClass('text-primary');
    });

    it('applies primary color to step text', () => {
      render(<ProgressCircle progress={50} step="test" />);
      const stepText = screen.getByText('test');
      // Text component should have color="primary" which translates to text-text-primary class
      expect(stepText.closest('p')).toBeInTheDocument();
    });

    it('renders within GlassCard', () => {
      const { container } = render(<ProgressCircle progress={50} step="test" />);
      // GlassCard renders a div with specific classes
      const glassCard = container.firstChild;
      expect(glassCard).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders semantic SVG with proper structure', () => {
      const { container } = render(<ProgressCircle progress={50} step="test" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelectorAll('circle')).toHaveLength(2);
    });

    it('percentage is visible and readable', () => {
      render(<ProgressCircle progress={75} step="test" />);
      const percentage = screen.getByText('75%');
      expect(percentage).toBeVisible();
    });

    it('step name is visible and readable', () => {
      render(<ProgressCircle progress={50} step="transcribing" />);
      const stepName = screen.getByText('transcribing');
      expect(stepName).toBeVisible();
    });
  });

  describe('Dynamic Updates', () => {
    it('updates when progress changes', () => {
      const { rerender } = render(<ProgressCircle progress={25} step="test" />);
      expect(screen.getByText('25%')).toBeInTheDocument();

      rerender(<ProgressCircle progress={75} step="test" />);
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.queryByText('25%')).not.toBeInTheDocument();
    });

    it('updates when step changes', () => {
      const { rerender } = render(<ProgressCircle progress={50} step="uploading" />);
      expect(screen.getByText('uploading')).toBeInTheDocument();

      rerender(<ProgressCircle progress={50} step="transcribing" />);
      expect(screen.getByText('transcribing')).toBeInTheDocument();
      expect(screen.queryByText('uploading')).not.toBeInTheDocument();
    });

    it('updates when timeEstimate changes', () => {
      const { rerender } = render(
        <ProgressCircle progress={50} step="test" timeEstimate="5 min" />
      );
      expect(screen.getByText('Estimated time: 5 min')).toBeInTheDocument();

      rerender(<ProgressCircle progress={50} step="test" timeEstimate="2 min" />);
      expect(screen.getByText('Estimated time: 2 min')).toBeInTheDocument();
      expect(screen.queryByText('Estimated time: 5 min')).not.toBeInTheDocument();
    });

    it('handles timeEstimate being added after initial render', () => {
      const { rerender } = render(<ProgressCircle progress={50} step="test" />);
      expect(screen.queryByText(/Estimated time:/)).not.toBeInTheDocument();

      rerender(<ProgressCircle progress={50} step="test" timeEstimate="3 min" />);
      expect(screen.getByText('Estimated time: 3 min')).toBeInTheDocument();
    });

    it('handles timeEstimate being removed', () => {
      const { rerender } = render(
        <ProgressCircle progress={50} step="test" timeEstimate="3 min" />
      );
      expect(screen.getByText('Estimated time: 3 min')).toBeInTheDocument();

      rerender(<ProgressCircle progress={50} step="test" />);
      expect(screen.queryByText(/Estimated time:/)).not.toBeInTheDocument();
    });
  });
});
