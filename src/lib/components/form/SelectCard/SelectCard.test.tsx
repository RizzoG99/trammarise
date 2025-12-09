import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectCard } from './SelectCard';

describe('SelectCard', () => {
  const mockOnClick = vi.fn();
  const defaultProps = {
    value: 'test-value',
    label: 'Test Card',
    selected: false,
    onClick: mockOnClick,
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Rendering', () => {
    it('renders with label', () => {
      render(<SelectCard {...defaultProps} />);
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      const Icon = () => <svg data-testid="test-icon" />;
      render(<SelectCard {...defaultProps} icon={<Icon />} />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders without icon', () => {
      render(<SelectCard {...defaultProps} />);
      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('renders with description', () => {
      render(<SelectCard {...defaultProps} description="Test description" />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders without description by default', () => {
      render(<SelectCard {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button.textContent).toBe('Test Card');
    });
  });

  describe('Selection State', () => {
    it('renders unselected state', () => {
      render(<SelectCard {...defaultProps} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders selected state', () => {
      render(<SelectCard {...defaultProps} selected={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('shows selection indicator when selected', () => {
      render(<SelectCard {...defaultProps} selected={true} />);
      const indicator = document.querySelector('.w-2.h-2.rounded-full.bg-indigo-600');
      expect(indicator).toBeInTheDocument();
    });

    it('hides selection indicator when not selected', () => {
      render(<SelectCard {...defaultProps} selected={false} />);
      const indicator = document.querySelector('.w-2.h-2.rounded-full.bg-indigo-600');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('Click Interaction', () => {
    it('calls onClick when clicked', () => {
      render(<SelectCard {...defaultProps} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      render(<SelectCard {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('applies disabled attribute', () => {
      render(<SelectCard {...defaultProps} disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('hides selection indicator when disabled and selected', () => {
      render(<SelectCard {...defaultProps} selected={true} disabled={true} />);
      const indicator = document.querySelector('.w-2.h-2.rounded-full.bg-indigo-600');
      expect(indicator).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has button role', () => {
      render(<SelectCard {...defaultProps} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has type="button"', () => {
      render(<SelectCard {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has aria-pressed attribute', () => {
      render(<SelectCard {...defaultProps} selected={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('has aria-label', () => {
      render(<SelectCard {...defaultProps} label="Custom Label" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('has value attribute', () => {
      render(<SelectCard {...defaultProps} value="custom-value" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('value', 'custom-value');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<SelectCard {...defaultProps} className="custom-card" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-card');
    });

    it('preserves default classes with custom className', () => {
      render(<SelectCard {...defaultProps} className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('flex');
      expect(button.className).toContain('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty label', () => {
      render(<SelectCard {...defaultProps} label="" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles long label', () => {
      const longLabel = 'A'.repeat(200);
      render(<SelectCard {...defaultProps} label={longLabel} />);
      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('handles long description', () => {
      const longDescription = 'B'.repeat(300);
      render(<SelectCard {...defaultProps} description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('handles multiple rapid clicks', () => {
      render(<SelectCard {...defaultProps} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('works with icon, description, and custom className', () => {
      const Icon = () => <svg data-testid="test-icon" />;
      render(
        <SelectCard
          {...defaultProps}
          icon={<Icon />}
          description="Description"
          className="custom-class"
        />
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });
  });

  describe('State Updates', () => {
    it('updates selected state when prop changes', () => {
      const { rerender } = render(<SelectCard {...defaultProps} selected={false} />);
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(<SelectCard {...defaultProps} selected={true} />);
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('updates label when prop changes', () => {
      const { rerender } = render(<SelectCard {...defaultProps} label="Label 1" />);
      expect(screen.getByText('Label 1')).toBeInTheDocument();

      rerender(<SelectCard {...defaultProps} label="Label 2" />);
      expect(screen.getByText('Label 2')).toBeInTheDocument();
      expect(screen.queryByText('Label 1')).not.toBeInTheDocument();
    });

    it('updates disabled state dynamically', () => {
      const { rerender } = render(<SelectCard {...defaultProps} disabled={false} />);
      let button = screen.getByRole('button');
      expect(button).not.toBeDisabled();

      rerender(<SelectCard {...defaultProps} disabled={true} />);
      button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
