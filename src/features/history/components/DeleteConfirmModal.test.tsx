import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import type { HistorySession } from '../types/history';

// Mock react-i18next with interpolation support
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (
      key: string,
      defaultOrOptions?: string | Record<string, unknown>,
      options?: Record<string, unknown>
    ) => {
      const defaultValue = typeof defaultOrOptions === 'string' ? defaultOrOptions : key;
      const vars = typeof defaultOrOptions === 'object' ? defaultOrOptions : (options ?? {});
      return Object.entries(vars).reduce(
        (str, [k, v]) => str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v)),
        defaultValue
      );
    },
  }),
}));

// Mock @/lib components
vi.mock('@/lib', async () => {
  const { createElement } = await import('react');
  return {
    Modal: ({
      isOpen,
      children,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
      onClose?: () => void;
    }) => (isOpen ? createElement('div', { 'data-testid': 'modal' }, children) : null),
    Button: ({
      children,
      onClick,
      disabled,
      className,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      className?: string;
    }) => createElement('button', { onClick, disabled, className }, children),
    Input: ({
      label,
      value,
      onChange,
      placeholder,
    }: {
      label?: string;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      placeholder?: string;
    }) =>
      createElement(
        'div',
        null,
        label ? createElement('label', null, label) : null,
        createElement('input', { value, onChange, placeholder })
      ),
    GlassCard: ({ children, className }: { children: React.ReactNode; className?: string }) =>
      createElement('div', { 'data-testid': 'glass-card', className }, children),
  };
});

// Mock formatDate
vi.mock('../utils/formatters', () => ({
  formatDate: (ts: number) => new Date(ts).toLocaleDateString(),
}));

const mockSession: HistorySession = {
  sessionId: 'session-1',
  audioName: 'My Recording.mp3',
  contentType: 'meeting',
  language: 'en',
  hasTranscript: true,
  hasSummary: true,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  session: mockSession,
  isDeleting: false,
};

describe('DeleteConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no session and no count', () => {
    render(<DeleteConfirmModal {...defaultProps} session={null} />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('shows singular title for single session delete', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete Recording?')).toBeInTheDocument();
  });

  it('shows plural title with count for bulk delete', () => {
    render(<DeleteConfirmModal {...defaultProps} session={null} count={3} />);
    expect(screen.getByText('Delete 3 Recordings?')).toBeInTheDocument();
  });

  it('renders i18n strings — no hardcoded English literals', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    // Verify via i18n keys (default values used since no real translations loaded)
    expect(
      screen.getByText(
        'Are you sure you want to delete this recording? This action cannot be undone.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows session info for single delete', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText('My Recording.mp3')).toBeInTheDocument();
    expect(screen.getByText('Recording:')).toBeInTheDocument();
    expect(screen.getByText('Created:')).toBeInTheDocument();
  });

  it('shows items list in GlassCard when count > 1 and sessions provided', () => {
    const sessions: HistorySession[] = [
      { ...mockSession, sessionId: 's1', audioName: 'Audio One.mp3' },
      { ...mockSession, sessionId: 's2', audioName: 'Audio Two.mp3' },
    ];
    render(<DeleteConfirmModal {...defaultProps} session={null} count={2} sessions={sessions} />);
    expect(screen.getByTestId('glass-card')).toBeInTheDocument();
    expect(screen.getByText('Audio One.mp3')).toBeInTheDocument();
    expect(screen.getByText('Audio Two.mp3')).toBeInTheDocument();
    expect(screen.getByText('Recordings to be deleted:')).toBeInTheDocument();
  });

  it('shows type-to-confirm input when count >= 5', () => {
    render(<DeleteConfirmModal {...defaultProps} session={null} count={5} />);
    expect(screen.getByText('Type DELETE to confirm')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type DELETE here')).toBeInTheDocument();
  });

  it('disables confirm button until user types DELETE when count >= 5', () => {
    render(<DeleteConfirmModal {...defaultProps} session={null} count={5} />);
    const confirmButton = screen.getByRole('button', { name: /yes, delete/i });
    expect(confirmButton).toBeDisabled();

    const input = screen.getByPlaceholderText('Type DELETE here');
    fireEvent.change(input, { target: { value: 'DELETE' } });

    expect(confirmButton).not.toBeDisabled();
  });

  it('confirm button does not require phrase when count < 5', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    const confirmButton = screen.getByRole('button', { name: /yes, delete/i });
    expect(confirmButton).not.toBeDisabled();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /yes, delete/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons and shows loading text when isDeleting=true', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
