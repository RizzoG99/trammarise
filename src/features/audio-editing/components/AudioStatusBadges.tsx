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
      style: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
        borderColor: 'rgba(16, 185, 129, 0.2)',
      },
    },
    noisy: {
      icon: AlertCircle,
      label: 'Noisy Audio',
      style: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: '#f59e0b',
        borderColor: 'rgba(245, 158, 11, 0.2)',
      },
    },
    unknown: {
      icon: CheckCircle,
      label: 'Ready',
      style: {
        backgroundColor: 'var(--color-bg-tertiary)',
        color: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border)',
      },
    },
  };

  const quality = qualityConfig[qualityStatus];
  const QualityIcon = quality.icon;

  return (
    <div className="flex gap-2">
      {/* Duration Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: 'var(--color-primary-alpha-10)', color: 'var(--color-primary)', borderColor: 'var(--color-primary-alpha-20)' }}>
        <Clock size={16} />
        {formatTime(totalDuration)} Total
      </span>

      {/* Quality Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" style={quality.style}>
        <QualityIcon size={16} />
        {quality.label}
      </span>
    </div>
  );
}
