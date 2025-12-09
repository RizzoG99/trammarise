import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToggleSwitch } from './ToggleSwitch';

describe('ToggleSwitch', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    label: 'Test Toggle',
    checked: false,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders with label', () => {
      render(<ToggleSwitch {...defaultProps} />);
      expect(screen.getByText('Test Toggle')).toBeInTheDocument();
    });

    it('renders in unchecked state', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('renders in checked state', () => {
      render(<ToggleSwitch {...defaultProps} checked={true} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('renders with description', () => {
      render(
        <ToggleSwitch
          {...defaultProps}
          description="This is a description"
        />
      );
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders without description by default', () => {
      render(<ToggleSwitch {...defaultProps} />);
      expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });
  });

  describe('Toggle Interaction', () => {
    it('calls onChange with true when clicking unchecked toggle', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(toggle);

      expect(mockOnChange).toHaveBeenCalledWith(true);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange with false when clicking checked toggle', () => {
      render(<ToggleSwitch {...defaultProps} checked={true} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(toggle);

      expect(mockOnChange).toHaveBeenCalledWith(false);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('toggles state with Space key', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);
      const toggle = screen.getByRole('switch');

      fireEvent.keyDown(toggle, { key: ' ' });

      expect(mockOnChange).toHaveBeenCalledWith(true);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('toggles state with Enter key', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);
      const toggle = screen.getByRole('switch');

      fireEvent.keyDown(toggle, { key: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith(true);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('does not toggle with other keys', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);
      const toggle = screen.getByRole('switch');

      fireEvent.keyDown(toggle, { key: 'a' });
      fireEvent.keyDown(toggle, { key: 'Escape' });
      fireEvent.keyDown(toggle, { key: 'Tab' });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('renders disabled state', () => {
      render(<ToggleSwitch {...defaultProps} disabled={true} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not call onChange when clicking disabled toggle', () => {
      render(<ToggleSwitch {...defaultProps} disabled={true} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(toggle);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onChange when pressing Space on disabled toggle', () => {
      render(<ToggleSwitch {...defaultProps} disabled={true} />);
      const toggle = screen.getByRole('switch');

      fireEvent.keyDown(toggle, { key: ' ' });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onChange when pressing Enter on disabled toggle', () => {
      render(<ToggleSwitch {...defaultProps} disabled={true} />);
      const toggle = screen.getByRole('switch');

      fireEvent.keyDown(toggle, { key: 'Enter' });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('has tabIndex -1 when disabled', () => {
      render(<ToggleSwitch {...defaultProps} disabled={true} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('tabIndex', '-1');
    });

    it('has tabIndex 0 when enabled', () => {
      render(<ToggleSwitch {...defaultProps} disabled={false} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Accessibility', () => {
    it('has role="switch"', () => {
      render(<ToggleSwitch {...defaultProps} />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('has aria-checked attribute', () => {
      const { rerender } = render(<ToggleSwitch {...defaultProps} checked={false} />);
      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      rerender(<ToggleSwitch {...defaultProps} checked={true} />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('has aria-label with label text', () => {
      render(<ToggleSwitch {...defaultProps} label="Enable Feature" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'Enable Feature');
    });

    it('has aria-disabled when disabled', () => {
      render(<ToggleSwitch {...defaultProps} disabled={true} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-disabled', 'true');
    });

    it('has aria-disabled false when enabled', () => {
      render(<ToggleSwitch {...defaultProps} disabled={false} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-disabled', 'false');
    });

    it('is keyboard focusable', () => {
      render(<ToggleSwitch {...defaultProps} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<ToggleSwitch {...defaultProps} className="custom-toggle" />);
      const toggle = screen.getByRole('switch');
      expect(toggle.className).toContain('custom-toggle');
    });

    it('preserves default classes with custom className', () => {
      render(<ToggleSwitch {...defaultProps} className="custom-class" />);
      const toggle = screen.getByRole('switch');
      expect(toggle.className).toContain('flex');
      expect(toggle.className).toContain('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty label', () => {
      render(<ToggleSwitch {...defaultProps} label="" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });

    it('handles very long label', () => {
      const longLabel = 'A'.repeat(200);
      render(<ToggleSwitch {...defaultProps} label={longLabel} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('handles very long description', () => {
      const longDescription = 'B'.repeat(500);
      render(<ToggleSwitch {...defaultProps} description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('handles multiple rapid clicks', () => {
      render(<ToggleSwitch {...defaultProps} checked={false} />);
      const toggle = screen.getByRole('switch');

      fireEvent.click(toggle);
      fireEvent.click(toggle);
      fireEvent.click(toggle);

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      // Alternates between true and false
      expect(mockOnChange).toHaveBeenNthCalledWith(1, true);
      expect(mockOnChange).toHaveBeenNthCalledWith(2, false);
      expect(mockOnChange).toHaveBeenNthCalledWith(3, true);
    });

    it('handles label with special characters', () => {
      render(<ToggleSwitch {...defaultProps} label="Enable <feature> & more" />);
      expect(screen.getByText('Enable <feature> & more')).toBeInTheDocument();
    });

    it('works with both description and custom className', () => {
      render(
        <ToggleSwitch
          {...defaultProps}
          description="Test description"
          className="custom-class"
        />
      );
      expect(screen.getByText('Test description')).toBeInTheDocument();
      const toggle = screen.getByRole('switch');
      expect(toggle.className).toContain('custom-class');
    });
  });

  describe('State Updates', () => {
    it('updates aria-checked when checked prop changes', () => {
      const { rerender } = render(<ToggleSwitch {...defaultProps} checked={false} />);
      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      rerender(<ToggleSwitch {...defaultProps} checked={true} />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      rerender(<ToggleSwitch {...defaultProps} checked={false} />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('updates label when label prop changes', () => {
      const { rerender } = render(<ToggleSwitch {...defaultProps} label="Label 1" />);
      expect(screen.getByText('Label 1')).toBeInTheDocument();

      rerender(<ToggleSwitch {...defaultProps} label="Label 2" />);
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.queryByText('Label 1')).not.toBeInTheDocument();
    });

    it('updates disabled state dynamically', () => {
      const { rerender } = render(<ToggleSwitch {...defaultProps} disabled={false} />);
      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-disabled', 'false');

      fireEvent.click(toggle);
      expect(mockOnChange).toHaveBeenCalledTimes(1);

      rerender(<ToggleSwitch {...defaultProps} disabled={true} />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(toggle);
      expect(mockOnChange).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('Integration', () => {
    it('simulates complete toggle workflow', () => {
      const { rerender } = render(<ToggleSwitch {...defaultProps} checked={false} />);

      // Initial state
      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      // Toggle on
      fireEvent.click(toggle);
      expect(mockOnChange).toHaveBeenCalledWith(true);

      // Simulate parent updating state
      rerender(<ToggleSwitch {...defaultProps} checked={true} />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      // Toggle off
      fireEvent.click(toggle);
      expect(mockOnChange).toHaveBeenCalledWith(false);

      // Simulate parent updating state
      rerender(<ToggleSwitch {...defaultProps} checked={false} />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });
  });
});
