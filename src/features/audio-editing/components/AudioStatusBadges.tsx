import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatTime } from '../../../utils/audio';
import { useTranslation } from 'react-i18next';

interface AudioStatusBadgesProps {
  totalDuration: number;
  qualityStatus?: 'clean' | 'noisy' | 'unknown';
}

/**
 * Displays status badges for audio metadata
 * Shows total duration and optional quality status
 */
export function AudioStatusBadges({
  totalDuration,
  qualityStatus = 'unknown',
}: AudioStatusBadgesProps) {
  const { t } = useTranslation();

  const qualityConfig = {
    clean: {
      icon: CheckCircle,
      label: t('audioStatus.clean'),
      style: {
        backgroundColor: 'var(--color-accent-success-alpha-10)',
        color: 'var(--color-accent-success)',
        borderColor: 'var(--color-accent-success-alpha-20)',
      },
    },
    noisy: {
      icon: AlertCircle,
      label: t('audioStatus.noisy'),
      style: {
        backgroundColor: 'var(--color-accent-warning-alpha-10)',
        color: 'var(--color-accent-warning)',
        borderColor: 'var(--color-accent-warning-alpha-20)',
      },
    },
    unknown: {
      icon: CheckCircle,
      label: t('audioStatus.ready'),
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
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: 'var(--color-primary-alpha-10)',
          color: 'var(--color-primary)',
          borderColor: 'var(--color-primary-alpha-20)',
        }}
      >
        <Clock size={16} />
        {formatTime(totalDuration)} {t('audioStatus.total')}
      </span>

      {/* Quality Badge */}
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
        style={quality.style}
      >
        <QualityIcon size={16} />
        {quality.label}
      </span>
    </div>
  );
}
