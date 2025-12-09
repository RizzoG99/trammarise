import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input without label', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('renders with hint text', () => {
      render(<Input label="Email" hint="We'll never share your email" />);
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Input label="Password" error="Password is too short" />);
      expect(screen.getByText('Password is too short')).toBeInTheDocument();
    });

    it('hides hint when error is present', () => {
      render(
        <Input
          label="Email"
          hint="This is a hint"
          error="This is an error"
        />
      );
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.queryByText('This is a hint')).not.toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('shows asterisk for required fields', () => {
      render(<Input label="Required Field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not show asterisk for optional fields', () => {
      render(<Input label="Optional Field" />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('Error Styling', () => {
    it('applies error border class when error is present', () => {
      render(<Input error="Invalid input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('applies normal border class when no error', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-slate-300');
    });
  });

  describe('Width', () => {
    it('takes full width by default', () => {
      const { container } = render(<Input />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-full');
    });

    it('does not take full width when fullWidth is false', () => {
      const { container } = render(<Input fullWidth={false} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).not.toHaveClass('w-full');
    });
  });

  describe('ID Generation', () => {
    it('uses provided id', () => {
      render(<Input id="custom-id" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('uses name as id if id not provided', () => {
      render(<Input name="email-field" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-field');
    });

    it('generates random id if neither id nor name provided', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      const id = input.getAttribute('id');
      expect(id).toBeTruthy();
      expect(id?.length).toBeGreaterThan(0);
    });
  });

  describe('Label Association', () => {
    it('associates label with input via htmlFor', () => {
      render(<Input label="Email Address" id="email-input" />);
      const label = screen.getByText('Email Address');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('clicking label focuses input', () => {
      render(<Input label="Focus Me" />);
      const label = screen.getByText('Focus Me');
      const input = screen.getByLabelText('Focus Me') as HTMLInputElement;

      fireEvent.click(label);
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Interactions', () => {
    it('calls onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value when controlled', () => {
      const { rerender } = render(<Input value="initial" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      rerender(<Input value="updated" onChange={() => {}} />);
      expect(input.value).toBe('updated');
    });
  });

  describe('Props', () => {
    it('forwards standard input attributes', () => {
      render(
        <Input
          type="email"
          placeholder="Email"
          name="email"
          disabled
          maxLength={50}
        />
      );
      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Email');
      expect(input).toHaveAttribute('name', 'email');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('maxLength', '50');
    });

    it('merges custom className with wrapper classes', () => {
      const { container } = render(<Input className="custom-wrapper" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-wrapper');
      expect(wrapper).toHaveClass('flex');
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Search input" />);
      expect(screen.getByLabelText('Search input')).toBeInTheDocument();
    });

    it('supports aria-describedby for hint', () => {
      render(
        <Input
          aria-describedby="hint-text"
          hint="This is a hint"
        />
      );
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'hint-text');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty label gracefully', () => {
      render(<Input label="" />);
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('handles undefined props gracefully', () => {
      render(<Input label={undefined} error={undefined} hint={undefined} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
