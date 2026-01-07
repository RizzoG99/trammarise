import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      const Icon = () => <svg data-testid="test-icon" />;
      render(<Button icon={<Icon />}>With Icon</Button>);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders icon-only button without children', () => {
      const Icon = () => <svg data-testid="test-icon" />;
      render(<Button icon={<Icon />} aria-label="Icon button" />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.queryByText('With Icon')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-indigo-600');
    });

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-slate-100');
    });

    it('applies success variant classes', () => {
      render(<Button variant="success">Success</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-emerald-600');
    });

    it('applies danger variant classes', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('applies outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-slate-50');
    });

    it('applies small variant classes', () => {
      render(<Button variant="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1');
    });

    it('applies large variant classes', () => {
      render(<Button variant="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('py-4');
    });

    it('applies circle variant classes', () => {
      const Icon = () => <svg data-testid="circle-icon" />;
      render(<Button variant="circle" icon={<Icon />} aria-label="Circle" />);
      const button = screen.getByLabelText('Circle');
      expect(button).toHaveClass('w-12');
      expect(button).toHaveClass('h-12');
      expect(button).toHaveClass('rounded-full');
    });

    it('applies circle-thick variant classes', () => {
      const Icon = () => <svg data-testid="thick-icon" />;
      render(<Button variant="circle-thick" icon={<Icon />} aria-label="Circle Thick" />);
      const button = screen.getByLabelText('Circle Thick');
      expect(button).toHaveClass('w-16');
      expect(button).toHaveClass('h-16');
      expect(button).toHaveClass('rounded-full');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      fireEvent.click(screen.getByText('Click'));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      fireEvent.click(screen.getByText('Disabled'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies disabled styles when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Props', () => {
    it('merges custom className with variant classes', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-indigo-600'); // Primary variant
    });

    it('forwards standard button attributes', () => {
      render(
        <Button type="submit" name="submit-btn" data-testid="test-button">
          Submit
        </Button>
      );
      const button = screen.getByTestId('test-button');

      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submit-btn');
    });

    it('supports aria-label for accessibility', () => {
      const Icon = () => <svg />;
      render(<Button icon={<Icon />} aria-label="Accessible button" />);

      expect(screen.getByLabelText('Accessible button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<Button>{''}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles undefined variant (uses default)', () => {
      render(<Button variant={undefined}>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-indigo-600');
    });

    it('renders correctly with both icon and children', () => {
      const Icon = () => <svg data-testid="icon" />;
      render(
        <Button icon={<Icon />}>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });
});
