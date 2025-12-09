import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioCard } from './RadioCard';

describe('RadioCard', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    name: 'test-group',
    value: 'option1',
    checked: false,
    onChange: mockOnChange,
    title: 'Test Option',
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders with title', () => {
      render(<RadioCard {...defaultProps} />);
      expect(screen.getByText('Test Option')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(<RadioCard {...defaultProps} description="Test description" />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders without description by default', () => {
      render(<RadioCard {...defaultProps} />);
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('renders with ReactNode title', () => {
      render(
        <RadioCard
          {...defaultProps}
          title={<span data-testid="custom-title">Custom Title</span>}
        />
      );
      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });

    it('renders hidden radio input', () => {
      render(<RadioCard {...defaultProps} />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toBeInTheDocument();
    });
  });

  describe('Radio Input', () => {
    it('has correct name attribute', () => {
      render(<RadioCard {...defaultProps} name="plan" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toHaveAttribute('name', 'plan');
    });

    it('has correct value attribute', () => {
      render(<RadioCard {...defaultProps} value="basic" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toHaveAttribute('value', 'basic');
    });

    it('is unchecked when checked is false', () => {
      render(<RadioCard {...defaultProps} checked={false} />);
      const radio = screen.getByRole('radio', { hidden: true }) as HTMLInputElement;
      expect(radio.checked).toBe(false);
    });

    it('is checked when checked is true', () => {
      render(<RadioCard {...defaultProps} checked={true} />);
      const radio = screen.getByRole('radio', { hidden: true }) as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });
  });

  describe('Selection', () => {
    it('calls onChange with value when clicked', () => {
      render(<RadioCard {...defaultProps} value="option1" />);
      const label = screen.getByText('Test Option').closest('label');

      fireEvent.click(label!);

      expect(mockOnChange).toHaveBeenCalledWith('option1');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('calls onChange when radio input is clicked', () => {
      render(<RadioCard {...defaultProps} value="option2" />);
      const radio = screen.getByRole('radio', { hidden: true });

      fireEvent.change(radio, { target: { value: 'option2' } });

      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('can be selected via keyboard', () => {
      render(<RadioCard {...defaultProps} value="option3" />);
      const radio = screen.getByRole('radio', { hidden: true });

      radio.focus();
      fireEvent.change(radio, { target: { value: 'option3' } });

      expect(mockOnChange).toHaveBeenCalledWith('option3');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled state', () => {
      render(<RadioCard {...defaultProps} disabled={true} />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toBeDisabled();
    });

    it('does not call onChange when disabled and clicked', () => {
      render(<RadioCard {...defaultProps} disabled={true} />);
      const label = screen.getByText('Test Option').closest('label');

      fireEvent.click(label!);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not call onChange when disabled radio is changed', () => {
      render(<RadioCard {...defaultProps} disabled={true} />);
      const radio = screen.getByRole('radio', { hidden: true });

      fireEvent.change(radio, { target: { value: 'option1' } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has radio role', () => {
      render(<RadioCard {...defaultProps} />);
      expect(screen.getByRole('radio', { hidden: true })).toBeInTheDocument();
    });

    it('has aria-label when title is string', () => {
      render(<RadioCard {...defaultProps} title="Accessible Title" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toHaveAttribute('aria-label', 'Accessible Title');
    });

    it('does not have aria-label when title is ReactNode', () => {
      render(
        <RadioCard
          {...defaultProps}
          title={<span>React Node Title</span>}
        />
      );
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).not.toHaveAttribute('aria-label');
    });

    it('radio indicator has aria-hidden', () => {
      render(<RadioCard {...defaultProps} />);
      const indicator = document.querySelector('.w-5.h-5.rounded-full');
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<RadioCard {...defaultProps} className="custom-radio" />);
      const label = screen.getByText('Test Option').closest('label');
      expect(label?.className).toContain('custom-radio');
    });

    it('preserves default classes with custom className', () => {
      render(<RadioCard {...defaultProps} className="custom-class" />);
      const label = screen.getByText('Test Option').closest('label');
      expect(label?.className).toContain('block');
      expect(label?.className).toContain('custom-class');
    });
  });

  describe('Radio Group', () => {
    it('works in a group with multiple options', () => {
      const { rerender } = render(
        <div>
          <RadioCard
            name="plan"
            value="basic"
            checked={true}
            onChange={mockOnChange}
            title="Basic"
          />
          <RadioCard
            name="plan"
            value="pro"
            checked={false}
            onChange={mockOnChange}
            title="Pro"
          />
        </div>
      );

      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();

      const proLabel = screen.getByText('Pro').closest('label');
      fireEvent.click(proLabel!);

      expect(mockOnChange).toHaveBeenCalledWith('pro');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(<RadioCard {...defaultProps} title="" />);
      const label = document.querySelector('label');
      expect(label).toBeInTheDocument();
    });

    it('handles long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<RadioCard {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles long description', () => {
      const longDescription = 'B'.repeat(500);
      render(<RadioCard {...defaultProps} description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('handles special characters in value', () => {
      render(<RadioCard {...defaultProps} value="option-1_test@value" />);
      const radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toHaveAttribute('value', 'option-1_test@value');
    });
  });

  describe('State Updates', () => {
    it('updates checked state when prop changes', () => {
      const { rerender } = render(<RadioCard {...defaultProps} checked={false} />);
      let radio = screen.getByRole('radio', { hidden: true }) as HTMLInputElement;
      expect(radio.checked).toBe(false);

      rerender(<RadioCard {...defaultProps} checked={true} />);
      radio = screen.getByRole('radio', { hidden: true }) as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it('updates title when prop changes', () => {
      const { rerender } = render(<RadioCard {...defaultProps} title="Title 1" />);
      expect(screen.getByText('Title 1')).toBeInTheDocument();

      rerender(<RadioCard {...defaultProps} title="Title 2" />);
      expect(screen.getByText('Title 2')).toBeInTheDocument();
      expect(screen.queryByText('Title 1')).not.toBeInTheDocument();
    });

    it('updates disabled state dynamically', () => {
      const { rerender } = render(<RadioCard {...defaultProps} disabled={false} />);
      let radio = screen.getByRole('radio', { hidden: true });
      expect(radio).not.toBeDisabled();

      rerender(<RadioCard {...defaultProps} disabled={true} />);
      radio = screen.getByRole('radio', { hidden: true });
      expect(radio).toBeDisabled();
    });
  });
});
