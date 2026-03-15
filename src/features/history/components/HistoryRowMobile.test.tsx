import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HistoryRowMobile } from './HistoryRowMobile';
import type { HistorySession } from '../types/history';

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const mockSession: HistorySession = {
  sessionId: 'session-abc',
  audioName: 'Team standup 2026-03-10',
  contentType: 'meeting',
  language: 'en',
  hasTranscript: true,
  hasSummary: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const defaultProps = {
  session: mockSession,
  onDelete: vi.fn(),
  onDownload: vi.fn(),
  onCopySummary: vi.fn(),
  onSelect: vi.fn(),
  selectionMode: false,
  selected: false,
};

beforeEach(() => vi.clearAllMocks());

describe('HistoryRowMobile', () => {
  it('renders session name', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    expect(screen.getByText('Team standup 2026-03-10')).toBeInTheDocument();
  });

  it('renders subtitle with contentType', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    expect(screen.getByText(/meeting/i)).toBeInTheDocument();
  });

  it('renders Done badge when hasSummary is true', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    expect(screen.getByText(/processed/i)).toBeInTheDocument();
  });

  it('renders Pending badge when hasSummary is false', () => {
    const pendingSession = { ...mockSession, hasSummary: false };
    renderWithRouter(<HistoryRowMobile {...defaultProps} session={pendingSession} />);
    expect(screen.getByText(/unprocessed/i)).toBeInTheDocument();
  });

  it('dots button opens the dropdown menu', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    const dotsBtn = screen.getByRole('button', { name: /more options/i });
    await user.click(dotsBtn);
    expect(screen.getByText(/download audio/i)).toBeInTheDocument();
    expect(screen.getByText(/^delete$/i)).toBeInTheDocument();
  });

  it('shows Copy Summary when session.hasSummary is true', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    expect(screen.getByText(/copy summary/i)).toBeInTheDocument();
  });

  it('clicking Copy Summary calls onCopySummary and closes menu', async () => {
    const user = userEvent.setup();
    const onCopySummary = vi.fn();
    renderWithRouter(<HistoryRowMobile {...defaultProps} onCopySummary={onCopySummary} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    await user.click(screen.getByText(/copy summary/i));
    expect(onCopySummary).toHaveBeenCalledWith('session-abc');
    expect(screen.queryByText(/copy summary/i)).not.toBeInTheDocument();
  });

  it('does not show Copy Summary when session.hasSummary is false', async () => {
    const user = userEvent.setup();
    const noSummary = { ...mockSession, hasSummary: false };
    renderWithRouter(<HistoryRowMobile {...defaultProps} session={noSummary} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    expect(screen.queryByText(/copy summary/i)).not.toBeInTheDocument();
  });

  it('clicking Download audio calls onDownload and closes menu', async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();
    renderWithRouter(<HistoryRowMobile {...defaultProps} onDownload={onDownload} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    await user.click(screen.getByText(/download audio/i));
    expect(onDownload).toHaveBeenCalledWith('session-abc', 'Team standup 2026-03-10');
    expect(screen.queryByText(/download audio/i)).not.toBeInTheDocument();
  });

  it('clicking Delete calls onDelete and closes menu', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithRouter(<HistoryRowMobile {...defaultProps} onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    await user.click(screen.getByText(/^delete$/i));
    expect(onDelete).toHaveBeenCalledWith('session-abc');
    expect(screen.queryByText(/^delete$/i)).not.toBeInTheDocument();
  });

  it('Escape key closes the open menu', async () => {
    const user = userEvent.setup();
    renderWithRouter(<HistoryRowMobile {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /more options/i }));
    expect(screen.getByText(/download audio/i)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByText(/download audio/i)).not.toBeInTheDocument();
  });

  it('checkbox is not rendered when selectionMode is false', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} selectionMode={false} />);
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('checkbox is visible when selectionMode is true', () => {
    renderWithRouter(<HistoryRowMobile {...defaultProps} selectionMode={true} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('clicking checkbox calls onSelect with sessionId', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithRouter(
      <HistoryRowMobile {...defaultProps} selectionMode={true} onSelect={onSelect} />
    );
    await user.click(screen.getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalledWith('session-abc');
  });
});
