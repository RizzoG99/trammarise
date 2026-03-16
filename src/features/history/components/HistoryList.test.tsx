import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HistoryList } from './HistoryList';
import type { GroupedSessions, HistorySession } from '../types/history';

const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('./HistoryCard', () => ({
  HistoryCard: ({ session }: { session: HistorySession }) => (
    <div data-testid={`card-${session.sessionId}`}>{session.audioName}</div>
  ),
}));

vi.mock('./HistoryRowMobile', () => ({
  HistoryRowMobile: ({ session }: { session: HistorySession }) => (
    <div data-testid={`row-${session.sessionId}`}>{session.audioName}</div>
  ),
}));

const emptyGroups: GroupedSessions = {
  today: [],
  yesterday: [],
  thisWeek: [],
  lastWeek: [],
  older: {},
};

const makeSession = (id: string) => ({
  sessionId: id,
  audioName: `session-${id}.webm`,
  contentType: 'meeting' as const,
  language: 'en' as const,
  hasTranscript: true,
  hasSummary: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const defaultProps = {
  groupedSessions: emptyGroups,
  onDelete: vi.fn(),
  onCopySummary: vi.fn(),
  selectedIds: new Set<string>(),
  onToggleSelection: vi.fn(),
  selectionMode: false,
};

describe('HistoryList', () => {
  it('renders nothing when all groups are empty', () => {
    const { container } = render(
      <MemoryRouter>
        <HistoryList {...defaultProps} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders today group header text', () => {
    const groups = { ...emptyGroups, today: [makeSession('1')] };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    // mockT returns the key as text, so the heading renders the i18n key
    expect(screen.getByText('history.groups.today')).toBeInTheDocument();
  });

  it('renders yesterday group header text', () => {
    const groups = { ...emptyGroups, yesterday: [makeSession('2')] };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(screen.getByText('history.groups.yesterday')).toBeInTheDocument();
  });

  it('renders thisWeek group header text', () => {
    const groups = { ...emptyGroups, thisWeek: [makeSession('3')] };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(screen.getByText('history.groups.thisWeek')).toBeInTheDocument();
  });

  it('renders lastWeek group header text', () => {
    const groups = { ...emptyGroups, lastWeek: [makeSession('4')] };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(screen.getByText('history.groups.lastWeek')).toBeInTheDocument();
  });

  it('renders HistoryCard for each session in today group', () => {
    const groups = {
      ...emptyGroups,
      today: [makeSession('abc'), makeSession('xyz')],
    };
    render(
      <MemoryRouter>
        <HistoryList {...defaultProps} groupedSessions={groups} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('card-abc')).toBeInTheDocument();
    expect(screen.getByTestId('card-xyz')).toBeInTheDocument();
  });
});
