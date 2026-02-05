import { useMemo } from 'react';
import { Clock, FileAudio, TrendingUp } from 'lucide-react';
import { GlassCard, Heading, Text } from '@/lib';
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Time Card */}
      <GlassCard variant="light" className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <Text variant="small" className="text-text-secondary font-medium">
            {t('history.dashboard.totalProcessed')}
          </Text>
          <Heading level="h3" className="text-xl font-bold">
            {stats.isApproximate ? '~' : ''}
            {formatDuration(stats.totalDurationSeconds)}
          </Heading>
        </div>
      </GlassCard>

      {/* Top Category Card */}
      <GlassCard variant="light" className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
          <FileAudio className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <Text variant="small" className="text-text-secondary font-medium">
            {t('history.dashboard.topCategory')}
          </Text>
          <Heading level="h3" className="text-xl font-bold truncate">
            {stats.topContentType}
          </Heading>
        </div>
      </GlassCard>

      {/* Activity Chart (Spans 2 columns on large screens) */}
      <GlassCard variant="light" className="p-4 lg:col-span-2 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            <TrendingUp className="w-3 h-3" />
          </div>
          <Text
            variant="small"
            className="text-text-secondary font-bold uppercase tracking-wider text-[10px]"
          >
            {t('history.dashboard.activity')}
          </Text>
        </div>

        <div className="flex items-end justify-between gap-2 h-16 w-full mt-2">
          {(() => {
            // Calculate max once for all bars
            const max = Math.max(...stats.activityLast7Days.map((d) => d.count), 1);

            return stats.activityLast7Days.map((day, index) => {
              const heightPct = Math.max((day.count / max) * 100, 10); // Min 10% height

              return (
                <div key={index} className="flex flex-col items-center gap-1 flex-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {t('history.dashboard.sessions', { count: day.count })}
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                      day.count > 0 ? 'bg-primary/80 hover:bg-primary' : 'bg-border/30'
                    }`}
                    style={{ height: `${day.count > 0 ? heightPct : 5}%` }}
                  />

                  {/* Label */}
                  <span className="text-[10px] text-text-tertiary font-medium">{day.date}</span>
                </div>
              );
            });
          })()}
        </div>
      </GlassCard>
    </div>
  );
}
