import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrimTimeInputs } from './TrimTimeInputs';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('TrimTimeInputs', () => {
  const noop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Start and End labels', () => {
    render(
      <TrimTimeInputs start={null} end={null} duration={120} onChange={noop} onClear={noop} />
    );
    expect(screen.getByText('audioEditing.startLabel')).toBeInTheDocument();
    expect(screen.getByText('audioEditing.endLabel')).toBeInTheDocument();
  });

  it('shows empty inputs when start/end are null', () => {
    render(
      <TrimTimeInputs start={null} end={null} duration={120} onChange={noop} onClear={noop} />
    );
    const [startInput, endInput] = screen.getAllByRole('textbox');
    expect(startInput).toHaveValue('');
    expect(endInput).toHaveValue('');
  });

  it('formats start and end times as M:SS when provided', () => {
    render(<TrimTimeInputs start={90} end={150} duration={300} onChange={noop} onClear={noop} />);
    const [startInput, endInput] = screen.getAllByRole('textbox');
    expect(startInput).toHaveValue('1:30');
    expect(endInput).toHaveValue('2:30');
  });

  it('displays duration when both start and end are set', () => {
    render(<TrimTimeInputs start={30} end={90} duration={300} onChange={noop} onClear={noop} />);
    expect(screen.getByText('1:00')).toBeInTheDocument();
  });

  it('does not show duration when region is not set', () => {
    render(
      <TrimTimeInputs start={null} end={null} duration={300} onChange={noop} onClear={noop} />
    );
    expect(screen.queryByText('audioEditing.durationLabel')).not.toBeInTheDocument();
  });

  it('calls onChange with parsed seconds on valid start input blur', () => {
    render(<TrimTimeInputs start={null} end={60} duration={120} onChange={noop} onClear={noop} />);
    const [startInput] = screen.getAllByRole('textbox');
    fireEvent.change(startInput, { target: { value: '0:30' } });
    fireEvent.blur(startInput);
    expect(noop).toHaveBeenCalledWith(30, 60);
  });

  it('calls onChange with parsed seconds on valid end input blur', () => {
    render(<TrimTimeInputs start={10} end={null} duration={120} onChange={noop} onClear={noop} />);
    const [, endInput] = screen.getAllByRole('textbox');
    fireEvent.change(endInput, { target: { value: '1:00' } });
    fireEvent.blur(endInput);
    expect(noop).toHaveBeenCalledWith(10, 60);
  });

  it('shows validation error on invalid time format', () => {
    render(
      <TrimTimeInputs start={null} end={null} duration={120} onChange={noop} onClear={noop} />
    );
    const [startInput] = screen.getAllByRole('textbox');
    fireEvent.change(startInput, { target: { value: 'abc' } });
    fireEvent.blur(startInput);
    expect(screen.getByText('audioEditing.timeInput.invalidFormat')).toBeInTheDocument();
  });

  it('shows Clear selection button when region is set', () => {
    render(<TrimTimeInputs start={10} end={60} duration={120} onChange={noop} onClear={noop} />);
    expect(screen.getByRole('button', { name: 'audioEditing.clearRegion' })).toBeInTheDocument();
  });

  it('does not show Clear selection button when region is not set', () => {
    render(
      <TrimTimeInputs start={null} end={null} duration={120} onChange={noop} onClear={noop} />
    );
    expect(
      screen.queryByRole('button', { name: 'audioEditing.clearRegion' })
    ).not.toBeInTheDocument();
  });

  it('calls onClear when Clear selection is clicked', () => {
    render(<TrimTimeInputs start={10} end={60} duration={120} onChange={noop} onClear={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'audioEditing.clearRegion' }));
    expect(noop).toHaveBeenCalled();
  });

  it('clamps end to duration on blur', () => {
    render(<TrimTimeInputs start={10} end={null} duration={60} onChange={noop} onClear={noop} />);
    const [, endInput] = screen.getAllByRole('textbox');
    fireEvent.change(endInput, { target: { value: '2:00' } }); // 120s > 60s duration
    fireEvent.blur(endInput);
    expect(noop).toHaveBeenCalledWith(10, 60);
  });
});
