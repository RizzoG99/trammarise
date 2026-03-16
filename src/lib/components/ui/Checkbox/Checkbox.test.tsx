import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} aria-label="Select item" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('renders checked when checked=true', () => {
    render(<Checkbox checked={true} onChange={vi.fn()} aria-label="Select item" />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} aria-label="Select item" />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('has the provided aria-label', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} aria-label="Select meeting" />);
    expect(screen.getByRole('checkbox', { name: 'Select meeting' })).toBeInTheDocument();
  });
});
