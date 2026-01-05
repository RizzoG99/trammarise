import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatTime } from '../../../utils/audio';

interface AudioStatusBadgesProps {
  totalDuration: number;
  qualityStatus?: 'clean' | 'noisy' | 'unknown';
}

/**
 * Displays status badges for audio metadata
 * Shows total duration and optional quality status
 */
export function AudioStatusBadges({ totalDuration, qualityStatus = 'unknown' }: AudioStatusBadgesProps) {
  const qualityConfig = {
    clean: {
      icon: CheckCircle,
      label: 'Clean Audio',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-100 dark:border-green-800',
    },
    noisy: {
      icon: AlertCircle,
      label: 'Noisy Audio',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-100 dark:border-yellow-800',
    },
    unknown: {
      icon: CheckCircle,
      label: 'Ready',
      bgColor: 'bg-gray-50 dark:bg-gray-900/30',
      textColor: 'text-gray-700 dark:text-gray-300',
      borderColor: 'border-gray-100 dark:border-gray-800',
    },
  };

  const quality = qualityConfig[qualityStatus];
  const QualityIcon = quality.icon;

  return (
    <div className="flex gap-2">
      {/* Duration Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
        <Clock size={16} />
        {formatTime(totalDuration)} Total
      </span>

      {/* Quality Badge */}
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${quality.bgColor} ${quality.textColor} border ${quality.borderColor}`}>
        <QualityIcon size={16} />
        {quality.label}
      </span>
    </div>
  );
}
