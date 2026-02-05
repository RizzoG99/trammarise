import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/lib/components/ui/Button';
import { useTranslation } from 'react-i18next';
import type { StorageQuota, StorageWarningLevel } from '@/hooks/useStorageMonitor';

interface StorageWarningProps {
  level: StorageWarningLevel;
  quota: StorageQuota;
  onDismiss: () => void;
  onCleanup?: () => void;
}

const LEVEL_STYLES: Record<StorageWarningLevel, { bg: string; border: string; text: string }> = {
  none: { bg: '', border: '', text: '' },
  low: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
  },
  medium: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
  },
  high: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-800 dark:text-orange-200',
  },
  critical: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
  },
};

export function StorageWarning({ level, quota, onDismiss, onCleanup }: StorageWarningProps) {
  const { t } = useTranslation();

  if (level === 'none') return null;

  const styles = LEVEL_STYLES[level];
  const usageGB = (quota.usage / 1024 ** 3).toFixed(2);
  const quotaGB = (quota.quota / 1024 ** 3).toFixed(2);

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-md rounded-lg border-2 ${styles.bg} ${styles.border} p-4 shadow-lg animate-in slide-in-from-right`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 ${styles.text} flex-shrink-0 mt-0.5`} />

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${styles.text} mb-1`}>
            {t(
              `storage.warning.${level}.title`,
              `Storage ${level === 'critical' ? 'Critical' : 'Warning'}`
            )}
          </h3>

          <p className={`text-sm ${styles.text} mb-2`}>
            {t(
              `storage.warning.${level}.message`,
              `You're using ${quota.percentUsed.toFixed(1)}% of your available storage (${usageGB}GB / ${quotaGB}GB).`
            )}
          </p>

          {level === 'critical' && (
            <p className={`text-sm ${styles.text} font-medium mb-3`}>
              {t('storage.warning.critical.action', 'Delete old recordings to free up space.')}
            </p>
          )}

          <div className="flex items-center gap-2">
            {onCleanup && (
              <Button
                variant="outline"
                onClick={onCleanup}
                className={`text-sm ${styles.text} border-current hover:bg-black/5 dark:hover:bg-white/5`}
              >
                {t('storage.cleanup', 'Manage Storage')}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onDismiss}
              className={`text-sm ${styles.text} hover:bg-black/5 dark:hover:bg-white/5`}
            >
              {t('common.dismiss', 'Dismiss')}
            </Button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className={`${styles.text} hover:opacity-70 transition-opacity`}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
