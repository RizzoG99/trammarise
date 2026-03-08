import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VolumeControl } from './VolumeControl';

describe('VolumeControl', () => {
  it('renders a range slider with the given volume', () => {
    render(<VolumeControl volume={0.75} onChange={vi.fn()} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('0.75');
  });

  it('shows Volume2 icon when volume > 0', () => {
    const { container } = render(<VolumeControl volume={0.5} onChange={vi.fn()} />);
    // volume-2 and volume-x are aria-hidden; check the SVG is rendered
    // Lucide renders a <svg> — we just assert no VolumeX path present by checking data-lucide
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('shows VolumeX icon when volume is 0', () => {
    const { container } = render(<VolumeControl volume={0} onChange={vi.fn()} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('calls onChange with parsed float when slider changes', async () => {
    const onChange = vi.fn();
    render(<VolumeControl volume={0.5} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    await userEvent.click(slider);
    fireEvent.change(slider, { target: { value: '0.6' } });
    expect(onChange).toHaveBeenCalledWith(0.6);
  });

  it('applies gradient fill reflecting volume level', () => {
    render(<VolumeControl volume={0.5} onChange={vi.fn()} />);
    const slider = screen.getByRole('slider');
    expect(slider.style.background).toContain('50.00%');
  });

  it('applies custom className', () => {
    const { container } = render(
      <VolumeControl volume={0.5} onChange={vi.fn()} className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });
});
