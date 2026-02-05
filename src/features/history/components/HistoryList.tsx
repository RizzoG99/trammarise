import { HistoryCard } from './HistoryCard';
import type { GroupedSessions, HistorySession } from '../types/history';

interface HistoryListProps {
  groupedSessions: GroupedSessions;
  onDelete: (sessionId: string) => void;
  selectedIds: Set<string>;
  onToggleSelection: (sessionId: string) => void;
  selectionMode: boolean;
}

const DateGroupHeader = ({ title }: { title: string }) => (
  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
    {title}
  </h3>
);

export function HistoryList({
  groupedSessions,
  onDelete,
  selectedIds,
  onToggleSelection,
  selectionMode,
}: HistoryListProps) {
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
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${groupIndex * 100}ms` }}
    >
      <DateGroupHeader title={title} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="space-y-12">
      {groupedSessions.today.length > 0 && renderGroup('Today', groupedSessions.today, 0)}
      {groupedSessions.yesterday.length > 0 &&
        renderGroup('Yesterday', groupedSessions.yesterday, 1)}
      {groupedSessions.thisWeek.length > 0 && renderGroup('This Week', groupedSessions.thisWeek, 2)}
      {groupedSessions.lastWeek.length > 0 && renderGroup('Last Week', groupedSessions.lastWeek, 3)}

      {Object.entries(groupedSessions.older).map(([monthYear, sessions], groupIndex) => (
        <div key={monthYear}>{renderGroup(monthYear, sessions, groupIndex + 4)}</div>
      ))}
    </div>
  );
}
