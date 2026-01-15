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
      expect(screen.getByText('processing.estimatedTime: 2-3 min')).toBeInTheDocument();
    });

    it('does not render time estimate when not provided', () => {
      render(<ProgressCircle progress={50} step="transcribing" />);
      expect(screen.queryByText(/processing.estimatedTime/)).not.toBeInTheDocument();
    });
// ...
    it('handles very long time estimates', () => {
      render(
        <ProgressCircle
          progress={50}
          step="test"
          timeEstimate="This is a very long time estimate string"
        />
      );
      expect(screen.getByText('processing.estimatedTime: This is a very long time estimate string')).toBeInTheDocument();
    });

    it('handles empty time estimate string', () => {
      render(<ProgressCircle progress={50} step="test" timeEstimate="" />);
      // Empty string is falsy in JavaScript, so nothing is rendered
      expect(screen.queryByText(/processing.estimatedTime/)).not.toBeInTheDocument();
    });
// ...

    it('updates when timeEstimate changes', () => {
      const { rerender } = render(
        <ProgressCircle progress={50} step="test" timeEstimate="5 min" />
      );
      expect(screen.getByText('processing.estimatedTime: 5 min')).toBeInTheDocument();

      rerender(<ProgressCircle progress={50} step="test" timeEstimate="2 min" />);
      expect(screen.getByText('processing.estimatedTime: 2 min')).toBeInTheDocument();
      expect(screen.queryByText('processing.estimatedTime: 5 min')).not.toBeInTheDocument();
    });

    it('handles timeEstimate being added after initial render', () => {
      const { rerender } = render(<ProgressCircle progress={50} step="test" />);
      expect(screen.queryByText(/processing.estimatedTime/)).not.toBeInTheDocument();

      rerender(<ProgressCircle progress={50} step="test" timeEstimate="3 min" />);
      expect(screen.getByText('processing.estimatedTime: 3 min')).toBeInTheDocument();
    });

    it('handles timeEstimate being removed', () => {
      const { rerender } = render(
        <ProgressCircle progress={50} step="test" timeEstimate="3 min" />
      );
      expect(screen.getByText('processing.estimatedTime: 3 min')).toBeInTheDocument();

      rerender(<ProgressCircle progress={50} step="test" />);
      expect(screen.queryByText(/processing.estimatedTime/)).not.toBeInTheDocument();
    });

  });
});
