import type { HistorySession } from '../types/history';

export interface HistoryStats {
  totalSessions: number;
  totalDurationSeconds: number;
  topContentType: string;
  activityLast7Days: { date: string; count: number }[];
}

/**
 * Calculates statistics from a list of history sessions
 */
export function calculateHistoryStats(sessions: HistorySession[]): HistoryStats {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalDurationSeconds: 0,
      topContentType: 'None',
      activityLast7Days: [],
    };
  }

  // 1. Total Sessions
  const totalSessions = sessions.length;

  // 2. Total Duration (using fileSizeBytes as a proxy for now if duration is missing)
  // Assuming ~1MB = 1 minute for typical audio (very rough approximation)
  // Real implementation would use session.durationSeconds when available
  const totalDurationSeconds = sessions.reduce((acc, session) => {
    return acc + (session.durationSeconds || ((session.fileSizeBytes || 0) / 1024 / 1024) * 60);
  }, 0);

  // 3. Top Content Type
  const typeCounts: Record<string, number> = {};
  sessions.forEach((session) => {
    const type = session.contentType || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  let topContentType = 'None';
  let maxCount = 0;

  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topContentType = type;
    }
  });

  // Capitalize first letter
  topContentType = topContentType.charAt(0).toUpperCase() + topContentType.slice(1);

  // 4. Activity Last 7 Days
  const activityMap: Record<string, number> = {};
  const today = new Date();

  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    activityMap[dateStr] = 0;
  }

  // Fill counts
  sessions.forEach((session) => {
    const dateStr = new Date(session.createdAt).toISOString().split('T')[0];
    if (activityMap[dateStr] !== undefined) {
      activityMap[dateStr]++;
    }
  });

  const activityLast7Days = Object.entries(activityMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      count,
    }));

  return {
    totalSessions,
    totalDurationSeconds,
    topContentType,
    activityLast7Days,
  };
}

/**
 * Formats duration in seconds to a readable string (e.g. "2h 15m")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return '< 1m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
