import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';
import { vi } from 'vitest';

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders correctly with default props', () => {
    render(
      <Select
        value=""
        onChange={() => {}}
        options={options}
        label="Test Select"
        placeholder="Choose..."
      />
    );

    expect(screen.getByText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('Choose...')).toBeInTheDocument();
  });

  it('displays the selected value', () => {
    render(<Select value="option2" onChange={() => {}} options={options} />);

    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<Select value="" onChange={() => {}} options={options} />);

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getByText('Option 1')).toBeVisible();
    expect(screen.getByText('Option 2')).toBeVisible();
    expect(screen.getByText('Option 3')).toBeVisible();
  });

  it('calls onChange when an option is selected', () => {
    const handleChange = vi.fn();
    render(<Select value="" onChange={handleChange} options={options} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Option 2'));

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('filters options when searchable is true', () => {
    render(<Select value="" onChange={() => {}} options={options} searchable />);

    fireEvent.click(screen.getByRole('button'));

    // Search input should be visible
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Option 3' } });

    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeVisible();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <Select value="" onChange={() => {}} options={options} error="This field is required" />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
