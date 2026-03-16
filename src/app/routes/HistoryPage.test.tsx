import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HistoryPage } from './HistoryPage';
import type { HistorySession } from '@/features/history/types/history';

// ── i18n ──────────────────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts ? `${key}:${JSON.stringify(opts)}` : key,
  }),
}));

// ── Auth / subscription ───────────────────────────────────────────────────
vi.mock('@/hooks/useUser', () => ({ useUser: () => ({ isSignedIn: false }) }));

const mockUseSubscription = vi.fn(() => ({ subscription: { tier: 'free' } }));
vi.mock('@/context/SubscriptionContext', () => ({
  useSubscription: () => mockUseSubscription(),
}));

// ── History sessions hook ─────────────────────────────────────────────────
const mockDeleteSession = vi.fn();
vi.mock('@/features/history/hooks/useHistorySessions', () => ({
  useHistorySessions: vi.fn(),
}));
import { useHistorySessions } from '@/features/history/hooks/useHistorySessions';

// ── Session storage ───────────────────────────────────────────────────────
vi.mock('@/utils/session-manager', () => ({
  loadSessionMetadata: vi.fn(),
  getAllSessionIds: vi.fn(() => []),
  deleteSession: vi.fn(),
}));
import { loadSessionMetadata } from '@/utils/session-manager';

// ── Heavy UI components ───────────────────────────────────────────────────
vi.mock('@/components/layout/PageLayout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/features/history/components/HistoryList', () => ({
  HistoryList: ({
    onDelete,
    onCopySummary,
    onToggleSelection,
  }: {
    onDelete: (id: string) => void;
    onCopySummary: (id: string) => void;
    onToggleSelection: (id: string) => void;
  }) => (
    <div data-testid="history-list">
      <button onClick={() => onDelete('s0')} data-testid="delete-s0">
        delete
      </button>
      <button onClick={() => onCopySummary('s0')} data-testid="copy-s0">
        copy
      </button>
      <button onClick={() => onToggleSelection('s0')} data-testid="select-s0">
        select
      </button>
    </div>
  ),
}));

vi.mock('@/features/history/components/HistoryEmptyState', () => ({
  HistoryEmptyState: ({ onClearFilters }: { onClearFilters: () => void }) => (
    <div data-testid="empty-state">
      <button onClick={onClearFilters} data-testid="clear-filters">
        clear
      </button>
    </div>
  ),
}));

vi.mock('@/features/history/components/DeleteConfirmModal', () => ({
  DeleteConfirmModal: ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
  }) =>
    isOpen ? (
      <div data-testid="delete-modal">
        <button onClick={onConfirm} data-testid="confirm-delete" disabled={isDeleting}>
          confirm
        </button>
        <button onClick={onClose} data-testid="cancel-delete">
          cancel
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/marketing/UpgradeModal', () => ({
  UpgradeModal: () => null,
}));

vi.mock('@/lib/components/ui/PageLoader/PageLoader', () => ({
  PageLoader: () => <div data-testid="page-loader" />,
}));

vi.mock('@/lib/components/ui/Snackbar', () => ({
  Snackbar: ({ message, isOpen }: { message: string; isOpen: boolean }) =>
    isOpen ? <div data-testid="snackbar">{message}</div> : null,
}));

// ── Helpers ───────────────────────────────────────────────────────────────
const makeSessions = (count: number): HistorySession[] =>
  Array.from({ length: count }, (_, i) => ({
    sessionId: `s${i}`,
    audioName: `Recording ${i}`,
    contentType: 'meeting' as const,
    language: 'en' as const,
    hasTranscript: true,
    hasSummary: true,
    createdAt: Date.now() - i * 1000,
    updatedAt: Date.now() - i * 1000,
  }));

const renderPage = () =>
  render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>
  );

// ── Tests ─────────────────────────────────────────────────────────────────
describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHistorySessions).mockReturnValue({
      sessions: makeSessions(3),
      isLoading: false,
      error: null,
      deleteSession: mockDeleteSession.mockResolvedValue(undefined),
      reload: vi.fn(),
      totalCount: 3,
    });
    mockUseSubscription.mockReturnValue({ subscription: { tier: 'free' } });
  });

  // ── Loading / error states ──────────────────────────────────────────────
  it('shows page loader while loading', () => {
    vi.mocked(useHistorySessions).mockReturnValue({
      sessions: [],
      isLoading: true,
      error: null,
      deleteSession: vi.fn(),
      reload: vi.fn(),
      totalCount: 0,
    });
    renderPage();
    expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('history-list')).not.toBeInTheDocument();
  });

  it('shows error alert when error is set', () => {
    vi.mocked(useHistorySessions).mockReturnValue({
      sessions: [],
      isLoading: false,
      error: 'Network failure',
      deleteSession: vi.fn(),
      reload: vi.fn(),
      totalCount: 0,
    });
    renderPage();
    expect(screen.getByText('history.error.title')).toBeInTheDocument();
    expect(screen.getByText('Network failure')).toBeInTheDocument();
  });

  // ── Pro banner ─────────────────────────────────────────────────────────
  it('shows pro banner when free tier and totalCount > 5', () => {
    vi.mocked(useHistorySessions).mockReturnValue({
      sessions: makeSessions(5),
      isLoading: false,
      error: null,
      deleteSession: vi.fn(),
      reload: vi.fn(),
      totalCount: 8,
    });
    renderPage();
    expect(screen.getByText('history.proBanner.title')).toBeInTheDocument();
  });

  it('hides pro banner when totalCount <= 5', () => {
    renderPage(); // defaultHookReturn has totalCount: 3
    expect(screen.queryByText('history.proBanner.title')).not.toBeInTheDocument();
  });

  it('hides pro banner for pro tier even with high count', () => {
    mockUseSubscription.mockReturnValue({ subscription: { tier: 'pro' } });
    vi.mocked(useHistorySessions).mockReturnValue({
      sessions: makeSessions(3),
      isLoading: false,
      error: null,
      deleteSession: vi.fn(),
      reload: vi.fn(),
      totalCount: 20,
    });
    renderPage();
    expect(screen.queryByText('history.proBanner.title')).not.toBeInTheDocument();
  });

  // ── Single delete ───────────────────────────────────────────────────────
  it('opens delete modal when delete triggered for a session', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('delete-s0'));
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  it('calls deleteSession and shows success snackbar on confirm', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('delete-s0'));
    await user.click(screen.getByTestId('confirm-delete'));
    await waitFor(() => {
      expect(mockDeleteSession).toHaveBeenCalledWith('s0');
      expect(screen.getByTestId('snackbar')).toHaveTextContent(
        'history.messages.deleteSingleSuccess'
      );
    });
  });

  it('shows error snackbar when deleteSession rejects', async () => {
    mockDeleteSession.mockRejectedValueOnce(new Error('delete failed'));
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('delete-s0'));
    await user.click(screen.getByTestId('confirm-delete'));
    await waitFor(() => {
      expect(screen.getByTestId('snackbar')).toHaveTextContent(
        'history.messages.deleteSingleError'
      );
    });
  });

  it('closes modal without deleting on cancel', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('delete-s0'));
    await user.click(screen.getByTestId('cancel-delete'));
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    expect(mockDeleteSession).not.toHaveBeenCalled();
  });

  // ── Bulk delete ─────────────────────────────────────────────────────────
  it('shows selection bar after selecting a session', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('select-s0'));
    expect(
      screen.getByText((content) => content.includes('history.batch.selected'))
    ).toBeInTheDocument();
  });

  it('shows success snackbar after bulk delete confirm', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByTestId('select-s0'));
    await user.click(screen.getByRole('button', { name: /history\.menu\.delete/i }));
    await user.click(screen.getByTestId('confirm-delete'));
    await waitFor(() => {
      expect(mockDeleteSession).toHaveBeenCalledWith('s0');
      expect(screen.getByTestId('snackbar')).toHaveTextContent('history.messages.deleteSuccess');
    });
  });

  // ── Search filtering ────────────────────────────────────────────────────
  it('shows history list when sessions exist', () => {
    renderPage();
    expect(screen.getByTestId('history-list')).toBeInTheDocument();
  });

  it('shows empty state when no sessions', () => {
    vi.mocked(useHistorySessions).mockReturnValue({
      sessions: [],
      isLoading: false,
      error: null,
      deleteSession: vi.fn(),
      reload: vi.fn(),
      totalCount: 0,
    });
    renderPage();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  // ── Copy summary ────────────────────────────────────────────────────────
  it('shows success snackbar on copy summary', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    vi.mocked(loadSessionMetadata).mockReturnValue({
      sessionId: 's0',
      audioName: 'Recording 0',
      contentType: 'meeting' as const,
      language: 'en' as const,
      hasTranscript: true,
      hasSummary: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      result: { summary: 'The summary text' },
    } as ReturnType<typeof loadSessionMetadata>);
    renderPage();
    fireEvent.click(screen.getByTestId('copy-s0'));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('The summary text');
      expect(screen.getByTestId('snackbar')).toHaveTextContent(
        'history.messages.copySummarySuccess'
      );
    });
  });

  it('shows error snackbar when clipboard write fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('no permission')) },
      writable: true,
      configurable: true,
    });
    vi.mocked(loadSessionMetadata).mockReturnValue({
      sessionId: 's0',
      audioName: 'Recording 0',
      contentType: 'meeting' as const,
      language: 'en' as const,
      hasTranscript: true,
      hasSummary: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      result: { summary: 'text' },
    } as ReturnType<typeof loadSessionMetadata>);
    renderPage();
    fireEvent.click(screen.getByTestId('copy-s0'));
    await waitFor(() => {
      expect(screen.getByTestId('snackbar')).toHaveTextContent('history.messages.copySummaryError');
    });
  });
});
