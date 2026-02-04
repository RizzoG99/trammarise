import type { HistorySession, GroupedSessions } from '../types/history';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Groups sessions by date into chronological categories
 * @param sessions - Array of history sessions
 * @returns Grouped sessions by date category
 */
export function groupSessionsByDate(sessions: HistorySession[]): GroupedSessions {
  const now = Date.now();

  const grouped: GroupedSessions = {
    today: [],
    yesterday: [],
    thisWeek: [],
    lastWeek: [],
    older: {},
  };

  // Filter out invalid sessions
  const validSessions = sessions.filter((session) => {
    const timestamp = session.createdAt;
    return timestamp && !isNaN(timestamp) && timestamp > 0;
  });

  // Sort all sessions by newest first before grouping
  const sortedSessions = [...validSessions].sort((a, b) => b.createdAt - a.createdAt);

  for (const session of sortedSessions) {
    const ageInMs = now - session.createdAt;
    const ageInDays = ageInMs / MS_PER_DAY;

    if (ageInDays < 1) {
      grouped.today.push(session);
    } else if (ageInDays < 2) {
      grouped.yesterday.push(session);
    } else if (ageInDays <= 7) {
      grouped.thisWeek.push(session);
    } else if (ageInDays <= 14) {
      grouped.lastWeek.push(session);
    } else {
      // Group by month for older sessions
      const monthKey = formatMonthYear(session.createdAt);
      if (!grouped.older[monthKey]) {
        grouped.older[monthKey] = [];
      }
      grouped.older[monthKey].push(session);
    }
  }

  return grouped;
}

/**
 * Formats a timestamp into "Month YYYY" format
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string like "January 2026"
 */
function formatMonthYear(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
}
