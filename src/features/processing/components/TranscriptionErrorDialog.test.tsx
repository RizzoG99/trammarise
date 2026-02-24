import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TranscriptionErrorDialog } from './TranscriptionErrorDialog';

// Mock react-router-dom (useNavigate needed by TranscriptionErrorDialog)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValueOrOptions?: string | Record<string, unknown>) => {
      if (typeof defaultValueOrOptions === 'string') {
        return defaultValueOrOptions;
      }
      return key; // Fallback to key if no default value provided
    },
  }),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  errorMessage: 'Specific mock error message',
};

describe('TranscriptionErrorDialog', () => {
  it('renders nothing when closed', () => {
    render(<TranscriptionErrorDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Transcription Error')).not.toBeInTheDocument();
  });

  it('renders the title and default explanation when open', () => {
    render(<TranscriptionErrorDialog {...defaultProps} />);
    expect(screen.getByText('Transcription Error')).toBeInTheDocument();
    expect(
      screen.getByText("We couldn't transcribe your audio file. This can happen for a few reasons.")
    ).toBeInTheDocument();
  });

  it('renders the possible reasons block', () => {
    render(<TranscriptionErrorDialog {...defaultProps} />);
    expect(screen.getByText('Possible reasons:')).toBeInTheDocument();
    expect(screen.getByText('The audio format is unsupported or corrupted.')).toBeInTheDocument();
    expect(
      screen.getByText('The recording contains mostly silence or background noise.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('A momentary network error interrupted the connection.')
    ).toBeInTheDocument();
  });

  it('renders the specific errorMessage if passed', () => {
    render(<TranscriptionErrorDialog {...defaultProps} />);
    expect(screen.getByText('Specific mock error message')).toBeInTheDocument();
  });

  it('does not render errorMessage block if undefined', () => {
    render(<TranscriptionErrorDialog {...defaultProps} errorMessage={undefined} />);
    expect(screen.queryByText('Specific mock error message')).not.toBeInTheDocument();
  });

  it('calls onClose when "Close & Try Again" button is clicked', () => {
    const onClose = vi.fn();
    render(<TranscriptionErrorDialog {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: /Close & Try Again/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
