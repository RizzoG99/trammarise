import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { HistorySession } from '../types/history';
import { calculateHistoryStats } from '../utils/historyStats';
import { formatDuration } from '../utils/formatters';

interface HistoryDashboardProps {
  sessions: HistorySession[];
}

export function HistoryDashboard({ sessions }: HistoryDashboardProps) {
  const { t } = useTranslation();
  const stats = useMemo(() => calculateHistoryStats(sessions), [sessions]);

  if (sessions.length === 0) return null;

  return (
    <p className="text-sm text-text-secondary">
      {t('history.dashboard.statStrip', {
        count: sessions.length,
        time: formatDuration(stats.totalDurationSeconds),
        topType: stats.topContentType ?? '—',
      })}
    </p>
  );
}
