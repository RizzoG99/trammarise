import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RecordButton, PauseButton, StopButton } from './RecordingButtons';

describe('RecordButton', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<RecordButton onClick={() => {}} />);
      const button = screen.getByRole('button', { name: 'Start recording' });
      expect(button).toBeInTheDocument();
    });

    it('renders microphone icon', () => {
      const { container } = render(<RecordButton onClick={() => {}} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      render(<RecordButton onClick={() => {}} aria-label="Custom label" />);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('shows pulse ring when not recording and not disabled', () => {
      const { container } = render(<RecordButton onClick={() => {}} />);
      const pulseRing = container.querySelector('.pulse-ring');
      expect(pulseRing).toBeInTheDocument();
    });

    it('hides pulse ring when recording', () => {
      const { container } = render(<RecordButton onClick={() => {}} isRecording={true} />);
      const pulseRing = container.querySelector('.pulse-ring');
      expect(pulseRing).not.toBeInTheDocument();
    });

    it('hides pulse ring when disabled', () => {
      const { container } = render(<RecordButton onClick={() => {}} disabled={true} />);
      const pulseRing = container.querySelector('.pulse-ring');
      expect(pulseRing).not.toBeInTheDocument();
    });

    it('applies disabled attribute when disabled', () => {
      render(<RecordButton onClick={() => {}} disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled attribute when recording', () => {
      render(<RecordButton onClick={() => {}} isRecording={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is enabled when not recording and not disabled', () => {
      render(<RecordButton onClick={() => {}} />);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<RecordButton onClick={handleClick} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<RecordButton onClick={handleClick} disabled={true} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when recording', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<RecordButton onClick={handleClick} isRecording={true} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<RecordButton onClick={() => {}} className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('has larger padding when not recording and not disabled', () => {
      render(<RecordButton onClick={() => {}} />);
      expect(screen.getByRole('button')).toHaveClass('p-6');
    });

    it('has smaller padding when recording', () => {
      render(<RecordButton onClick={() => {}} isRecording={true} />);
      expect(screen.getByRole('button')).toHaveClass('p-3');
    });

    it('has smaller padding when disabled', () => {
      render(<RecordButton onClick={() => {}} disabled={true} />);
      expect(screen.getByRole('button')).toHaveClass('p-3');
    });
  });
});

describe('PauseButton', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<PauseButton onClick={() => {}} />);
      const button = screen.getByRole('button', { name: 'Pause recording' });
      expect(button).toBeInTheDocument();
    });

    it('shows pause icon when not paused', () => {
      const { container } = render(<PauseButton onClick={() => {}} isPaused={false} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('shows play icon when paused', () => {
      const { container } = render(<PauseButton onClick={() => {}} isPaused={true} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      render(<PauseButton onClick={() => {}} aria-label="Custom label" />);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('uses default aria-label "Pause recording" when not paused', () => {
      render(<PauseButton onClick={() => {}} isPaused={false} />);
      expect(screen.getByRole('button', { name: 'Pause recording' })).toBeInTheDocument();
    });

    it('uses default aria-label "Resume recording" when paused', () => {
      render(<PauseButton onClick={() => {}} isPaused={true} />);
      expect(screen.getByRole('button', { name: 'Resume recording' })).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('applies disabled attribute when disabled', () => {
      render(<PauseButton onClick={() => {}} disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is enabled when not disabled', () => {
      render(<PauseButton onClick={() => {}} />);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<PauseButton onClick={handleClick} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<PauseButton onClick={handleClick} disabled={true} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<PauseButton onClick={() => {}} className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('has rounded-full class', () => {
      render(<PauseButton onClick={() => {}} />);
      expect(screen.getByRole('button')).toHaveClass('rounded-full');
    });
  });

  describe('Pause/Resume Toggle', () => {
    it('toggles between pause and resume states', () => {
      const { rerender } = render(<PauseButton onClick={() => {}} isPaused={false} />);
      expect(screen.getByRole('button', { name: 'Pause recording' })).toBeInTheDocument();

      rerender(<PauseButton onClick={() => {}} isPaused={true} />);
      expect(screen.getByRole('button', { name: 'Resume recording' })).toBeInTheDocument();
    });
  });
});

describe('StopButton', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<StopButton onClick={() => {}} />);
      const button = screen.getByRole('button', { name: 'Stop recording' });
      expect(button).toBeInTheDocument();
    });

    it('renders square icon', () => {
      const { container } = render(<StopButton onClick={() => {}} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      render(<StopButton onClick={() => {}} aria-label="Custom label" />);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('applies disabled attribute when disabled', () => {
      render(<StopButton onClick={() => {}} disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is enabled when not disabled', () => {
      render(<StopButton onClick={() => {}} />);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<StopButton onClick={handleClick} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<StopButton onClick={handleClick} disabled={true} />);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      render(<StopButton onClick={() => {}} className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('has rounded-full class', () => {
      render(<StopButton onClick={() => {}} />);
      expect(screen.getByRole('button')).toHaveClass('rounded-full');
    });

    it('has shadow-lg class', () => {
      render(<StopButton onClick={() => {}} />);
      expect(screen.getByRole('button')).toHaveClass('shadow-lg');
    });
  });
});

describe('All Recording Buttons', () => {
  it('all buttons render together', () => {
    const handleRecord = vi.fn();
    const handlePause = vi.fn();
    const handleStop = vi.fn();

    render(
      <div>
        <RecordButton onClick={handleRecord} />
        <PauseButton onClick={handlePause} />
        <StopButton onClick={handleStop} />
      </div>
    );

    expect(screen.getByRole('button', { name: 'Start recording' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause recording' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeInTheDocument();
  });
});
