import { useTranslation } from 'react-i18next';
import { HistoryCard } from './HistoryCard';
import { HistoryRowMobile } from './HistoryRowMobile';
import type { GroupedSessions, HistorySession } from '../types/history';

interface HistoryListProps {
  groupedSessions: GroupedSessions;
  onDelete: (sessionId: string) => void;
  onDownload: (sessionId: string, audioName: string) => void;
  onCopySummary: (sessionId: string) => void;
  selectedIds: Set<string>;
  onToggleSelection: (sessionId: string) => void;
  selectionMode: boolean;
}

// Token cleanup: was text-gray-500 dark:text-gray-400
const DateGroupHeader = ({ title }: { title: string }) => (
  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 mt-6 first:mt-0 px-1">
    {title}
  </h3>
);

export function HistoryList({
  groupedSessions,
  onDelete,
  onDownload,
  onCopySummary,
  selectedIds,
  onToggleSelection,
  selectionMode,
}: HistoryListProps) {
  const { t } = useTranslation();

  const hasAnySessions =
    groupedSessions.today.length > 0 ||
    groupedSessions.yesterday.length > 0 ||
    groupedSessions.thisWeek.length > 0 ||
    groupedSessions.lastWeek.length > 0 ||
    Object.keys(groupedSessions.older).length > 0;

  if (!hasAnySessions) {
    return null;
  }

  const renderGroup = (title: string, sessions: HistorySession[], groupIndex: number = 0) => (
    <div
      key={title}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${groupIndex * 100}ms` }}
    >
      <DateGroupHeader title={title} />

      {/* Mobile: compact list rows */}
      <div className="sm:hidden bg-bg-surface border border-border rounded-xl overflow-hidden">
        {sessions.map((session) => (
          <HistoryRowMobile
            key={session.sessionId}
            session={session}
            onDelete={onDelete}
            onDownload={onDownload}
            onCopySummary={onCopySummary}
            selected={selectedIds.has(session.sessionId)}
            onSelect={onToggleSelection}
            selectionMode={selectionMode}
          />
        ))}
      </div>

      {/* Desktop: grid cards */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session, index) => (
          <div
            key={session.sessionId}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
          >
            <HistoryCard
              session={session}
              onDelete={onDelete}
              selected={selectedIds.has(session.sessionId)}
              onSelect={onToggleSelection}
              selectionMode={selectionMode}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {groupedSessions.today.length > 0 &&
        renderGroup(t('history.groups.today'), groupedSessions.today, 0)}
      {groupedSessions.yesterday.length > 0 &&
        renderGroup(t('history.groups.yesterday'), groupedSessions.yesterday, 1)}
      {groupedSessions.thisWeek.length > 0 &&
        renderGroup(t('history.groups.thisWeek'), groupedSessions.thisWeek, 2)}
      {groupedSessions.lastWeek.length > 0 &&
        renderGroup(t('history.groups.lastWeek'), groupedSessions.lastWeek, 3)}
      {Object.entries(groupedSessions.older).map(([monthYear, sessions], groupIndex) =>
        renderGroup(monthYear, sessions, groupIndex + 4)
      )}
    </div>
  );
}
