import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Snackbar } from './Snackbar';

describe('Snackbar', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    isOpen: true,
    message: 'Test notification',
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Snackbar {...defaultProps} />);
      expect(screen.getByText('Test notification')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<Snackbar {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test notification')).not.toBeInTheDocument();
    });

    it('renders message correctly', () => {
      render(<Snackbar {...defaultProps} message="Custom message" />);
      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(<Snackbar {...defaultProps} />);
      const closeButton = screen.getByLabelText('Close notification');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies info variant by default', () => {
      render(<Snackbar {...defaultProps} />);
      const alert = screen.getByRole('alert');
      // Info variant uses bg-[#2196f3]
      expect(alert.className).toContain('bg-[#2196f3]');
    });

    it('applies success variant styles', () => {
      render(<Snackbar {...defaultProps} variant="success" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-[#4caf50]');
    });

    it('applies error variant styles', () => {
      render(<Snackbar {...defaultProps} variant="error" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-[#f44336]');
    });

    it('applies warning variant styles', () => {
      render(<Snackbar {...defaultProps} variant="warning" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-[#ff9800]');
    });
  });

  describe('Auto-dismiss', () => {
    it('auto-dismisses after default duration (4000ms)', async () => {
      render(<Snackbar {...defaultProps} />);

      expect(mockOnClose).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(4000);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('auto-dismisses after custom duration', async () => {
      render(<Snackbar {...defaultProps} duration={2000} />);

      expect(mockOnClose).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(2000);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not auto-dismiss when duration is 0', async () => {
      render(<Snackbar {...defaultProps} duration={0} />);

      vi.advanceTimersByTime(10000);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('does not auto-dismiss when isOpen is false', async () => {
      render(<Snackbar {...defaultProps} isOpen={false} duration={1000} />);

      vi.advanceTimersByTime(1000);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('resets timer when isOpen changes', async () => {
      const { rerender } = render(<Snackbar {...defaultProps} duration={2000} />);

      await vi.advanceTimersByTimeAsync(1000);

      // Close and reopen
      rerender(<Snackbar {...defaultProps} isOpen={false} duration={2000} />);
      rerender(<Snackbar {...defaultProps} isOpen={true} duration={2000} />);

      await vi.advanceTimersByTimeAsync(1000);
      expect(mockOnClose).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1000);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('cleans up timer on unmount', () => {
      const { unmount } = render(<Snackbar {...defaultProps} duration={2000} />);

      unmount();

      vi.advanceTimersByTime(2000);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Manual Close', () => {
    it('calls onClose when close button is clicked', () => {
      render(<Snackbar {...defaultProps} duration={0} />);

      const closeButton = screen.getByLabelText('Close notification');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('can be closed manually before auto-dismiss', () => {
      render(<Snackbar {...defaultProps} duration={4000} />);

      vi.advanceTimersByTime(2000);

      const closeButton = screen.getByLabelText('Close notification');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has role="alert"', () => {
      render(<Snackbar {...defaultProps} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live="polite"', () => {
      render(<Snackbar {...defaultProps} />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-atomic="true"', () => {
      render(<Snackbar {...defaultProps} />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-atomic', 'true');
    });

    it('close button has aria-label', () => {
      render(<Snackbar {...defaultProps} />);
      const closeButton = screen.getByLabelText('Close notification');
      expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    });

    it('close button has type="button"', () => {
      render(<Snackbar {...defaultProps} />);
      const closeButton = screen.getByLabelText('Close notification');
      expect(closeButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<Snackbar {...defaultProps} className="custom-snackbar" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('custom-snackbar');
    });

    it('preserves default classes when custom className is added', () => {
      render(<Snackbar {...defaultProps} className="custom-class" />);
      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('fixed');
      expect(alert.className).toContain('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty message', () => {
      render(<Snackbar {...defaultProps} message="" />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('handles very long message', () => {
      const longMessage = 'A'.repeat(500);
      render(<Snackbar {...defaultProps} message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles message with HTML entities', () => {
      render(<Snackbar {...defaultProps} message="Success: <saved>" />);
      expect(screen.getByText('Success: <saved>')).toBeInTheDocument();
    });

    it('handles very short duration', async () => {
      render(<Snackbar {...defaultProps} duration={1} />);

      await vi.advanceTimersByTimeAsync(1);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles very long duration', async () => {
      render(<Snackbar {...defaultProps} duration={999999} />);

      await vi.advanceTimersByTimeAsync(999998);
      expect(mockOnClose).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles multiple rapid opens and closes', async () => {
      const { rerender } = render(<Snackbar {...defaultProps} duration={1000} />);

      await vi.advanceTimersByTimeAsync(500);
      rerender(<Snackbar {...defaultProps} isOpen={false} duration={1000} />);
      rerender(<Snackbar {...defaultProps} isOpen={true} duration={1000} />);
      await vi.advanceTimersByTimeAsync(500);
      rerender(<Snackbar {...defaultProps} isOpen={false} duration={1000} />);
      rerender(<Snackbar {...defaultProps} isOpen={true} duration={1000} />);

      await vi.advanceTimersByTimeAsync(1000);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Variant Combinations', () => {
    it('success variant with custom duration', async () => {
      render(<Snackbar {...defaultProps} variant="success" duration={1000} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-[#4caf50]');

      await vi.advanceTimersByTimeAsync(1000);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('error variant with no auto-dismiss', () => {
      render(<Snackbar {...defaultProps} variant="error" duration={0} />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-[#f44336]');

      vi.advanceTimersByTime(10000);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('warning variant with custom className', () => {
      render(
        <Snackbar
          {...defaultProps}
          variant="warning"
          className="custom-warning"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-[#ff9800]');
      expect(alert.className).toContain('custom-warning');
    });
  });
});
