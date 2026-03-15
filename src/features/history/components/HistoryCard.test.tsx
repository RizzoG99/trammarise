import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { HistoryCard } from './HistoryCard';
import { MemoryRouter } from 'react-router-dom';
import type { HistorySession } from '../types/history';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('HistoryCard', () => {
  const mockSession: HistorySession = {
    sessionId: 'test-session-123',
    audioName: 'team-meeting.webm',
    contentType: 'meeting',
    language: 'en',
    hasTranscript: true,
    hasSummary: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    fileSizeBytes: 5242880, // 5 MB
    durationSeconds: 300, // 5 minutes
  };

  it('should render audio name correctly', () => {
    renderWithRouter(<HistoryCard session={mockSession} onDelete={() => {}} />);

    expect(screen.getByText('team-meeting.webm')).toBeInTheDocument();
  });

  it('should display formatted creation date', () => {
    renderWithRouter(<HistoryCard session={mockSession} onDelete={() => {}} />);

    // Should show "Today at" or similar
    expect(screen.getByText(/today at/i)).toBeInTheDocument();
  });

  it('should show content type badge', () => {
    renderWithRouter(<HistoryCard session={mockSession} onDelete={() => {}} />);

    const badges = screen.getAllByText(/meeting/i);
    // Should have the badge (in addition to filename potentially matching)
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('should show language badge', () => {
    renderWithRouter(<HistoryCard session={mockSession} onDelete={() => {}} />);

    // Expects i18n key
    expect(screen.getByText(/common.languages.en/i)).toBeInTheDocument();
  });

  it('should show "Done" badge when hasSummary=true', () => {
    renderWithRouter(<HistoryCard session={mockSession} onDelete={() => {}} />);

    expect(screen.getByText(/Done/i)).toBeInTheDocument();
  });

  it('should show "Pending" badge when hasSummary=false', () => {
    const unprocessedSession = { ...mockSession, hasSummary: false };
    renderWithRouter(<HistoryCard session={unprocessedSession} onDelete={() => {}} />);

    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  it('should truncate long audio names with ellipsis', () => {
    const longNameSession = {
      ...mockSession,
      audioName: 'this-is-a-very-long-audio-filename-that-should-be-truncated-properly.webm',
    };
    renderWithRouter(<HistoryCard session={longNameSession} onDelete={() => {}} />);

    const nameElement = screen.getByText(longNameSession.audioName);
    // Check for truncation class (should have overflow-hidden and text-ellipsis)
    expect(nameElement.className).toMatch(/truncate/);
  });

  it('should call onDelete when trash icon clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    renderWithRouter(<HistoryCard session={mockSession} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('test-session-123');
  });

  it('should navigate to results page on card click', async () => {
    renderWithRouter(<HistoryCard session={mockSession} onDelete={() => {}} />);

    const cardLink = screen.getByRole('link', { name: /team-meeting\.webm/i });
    expect(cardLink).toHaveAttribute('href', '/results/test-session-123');
  });

  it('should have ARIA labels on buttons', () => {
    renderWithRouter(<HistoryCard session={mockSession} onDelete={() => {}} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toHaveAccessibleName();
  });

  it('should display different content type badges', () => {
    const lectureSession = { ...mockSession, contentType: 'lecture' as const };
    const { rerender } = renderWithRouter(
      <HistoryCard session={lectureSession} onDelete={() => {}} />
    );

    expect(screen.getByText(/lecture/i)).toBeInTheDocument();

    const interviewSession = { ...mockSession, contentType: 'interview' as const };
    rerender(
      <MemoryRouter>
        <HistoryCard session={interviewSession} onDelete={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText(/interview/i)).toBeInTheDocument();
  });

  it('should handle missing file size gracefully', () => {
    const sessionWithoutSize = { ...mockSession, fileSizeBytes: undefined };
    renderWithRouter(<HistoryCard session={sessionWithoutSize} onDelete={() => {}} />);

    expect(screen.getByText('team-meeting.webm')).toBeInTheDocument();
  });

  it('should handle missing duration gracefully', () => {
    const sessionWithoutDuration = { ...mockSession, durationSeconds: undefined };
    renderWithRouter(<HistoryCard session={sessionWithoutDuration} onDelete={() => {}} />);

    expect(screen.getByText('team-meeting.webm')).toBeInTheDocument();
  });

  it('should show duration badge when durationSeconds is present', () => {
    renderWithRouter(<HistoryCard session={mockSession} onDelete={() => {}} />);
    // mockSession has durationSeconds: 300 → formatDuration(300) = "5m 0s"
    const durationEl = screen.getByText(/\d+[mhs]/i);
    expect(durationEl).toBeInTheDocument();
  });

  it('should not show duration when durationSeconds is undefined', () => {
    const sessionWithoutDuration = { ...mockSession, durationSeconds: undefined };
    renderWithRouter(<HistoryCard session={sessionWithoutDuration} onDelete={() => {}} />);
    expect(screen.queryByText(/\d+[mhs]\s+\d+[s]/)).not.toBeInTheDocument();
  });

  it('should apply border-l-4 class for content-type differentiation', () => {
    const { container } = renderWithRouter(
      <HistoryCard session={mockSession} onDelete={() => {}} />
    );
    const cardWithBorder = container.querySelector('.border-l-4');
    expect(cardWithBorder).not.toBeNull();
  });

  it('should show copy button when hasSummary=true and onCopySummary provided', () => {
    renderWithRouter(
      <HistoryCard session={mockSession} onDelete={() => {}} onCopySummary={vi.fn()} />
    );

    const copyButton = screen.getByRole('button', { name: /copy/i });
    expect(copyButton).toBeInTheDocument();
  });

  it('should not show copy button when hasSummary=false', () => {
    const unprocessed = { ...mockSession, hasSummary: false };
    renderWithRouter(
      <HistoryCard session={unprocessed} onDelete={() => {}} onCopySummary={vi.fn()} />
    );

    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('should call onCopySummary when copy button clicked', async () => {
    const user = userEvent.setup();
    const onCopySummary = vi.fn().mockResolvedValue(undefined);

    renderWithRouter(
      <HistoryCard session={mockSession} onDelete={() => {}} onCopySummary={onCopySummary} />
    );

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    expect(onCopySummary).toHaveBeenCalledWith('test-session-123');
  });
});
