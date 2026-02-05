import type { HistorySession, GroupedSessions } from '../types/history';

/**
 * Groups sessions by date into chronological categories using calendar-day boundaries
 * @param sessions - Array of history sessions
 * @returns Grouped sessions by date category
 */
export function groupSessionsByDate(sessions: HistorySession[]): GroupedSessions {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);

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
    const sessionDate = new Date(session.createdAt);
    sessionDate.setHours(0, 0, 0, 0);
    const sessionTime = sessionDate.getTime();

    if (sessionTime >= today.getTime()) {
      grouped.today.push(session);
    } else if (sessionTime >= yesterday.getTime()) {
      grouped.yesterday.push(session);
    } else if (sessionTime >= sevenDaysAgo.getTime()) {
      grouped.thisWeek.push(session);
    } else if (sessionTime >= fourteenDaysAgo.getTime()) {
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
