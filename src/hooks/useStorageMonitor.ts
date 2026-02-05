import { useState, useEffect, useCallback } from 'react';

export interface StorageQuota {
  usage: number;
  quota: number;
  percentUsed: number;
}

export type StorageWarningLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

interface UseStorageMonitorOptions {
  checkInterval?: number; // milliseconds
  warningThresholds?: {
    low?: number; // default: 50%
    medium?: number; // default: 75%
    high?: number; // default: 90%
    critical?: number; // default: 95%
  };
  onWarning?: (level: StorageWarningLevel, quota: StorageQuota) => void;
}

interface UseStorageMonitorReturn {
  quota: StorageQuota | null;
  warningLevel: StorageWarningLevel;
  isChecking: boolean;
  error: Error | null;
  checkQuota: () => Promise<void>;
}

const DEFAULT_THRESHOLDS = {
  low: 50,
  medium: 75,
  high: 90,
  critical: 95,
};

/**
 * Hook to monitor storage usage and warn when approaching limits
 */
export function useStorageMonitor(options: UseStorageMonitorOptions = {}): UseStorageMonitorReturn {
  const {
    checkInterval = 60000, // Check every minute by default
    warningThresholds = DEFAULT_THRESHOLDS,
    onWarning,
  } = options;

  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [warningLevel, setWarningLevel] = useState<StorageWarningLevel>('none');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getWarningLevel = useCallback(
    (percentUsed: number): StorageWarningLevel => {
      const thresholds = { ...DEFAULT_THRESHOLDS, ...warningThresholds };
      if (percentUsed >= thresholds.critical!) return 'critical';
      if (percentUsed >= thresholds.high!) return 'high';
      if (percentUsed >= thresholds.medium!) return 'medium';
      if (percentUsed >= thresholds.low!) return 'low';
      return 'none';
    },
    [warningThresholds]
  );

  const checkQuota = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      if (!navigator.storage || !navigator.storage.estimate) {
        throw new Error('Storage API not supported');
      }

      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quotaValue = estimate.quota || 0;
      const percentUsed = quotaValue > 0 ? (usage / quotaValue) * 100 : 0;

      const quotaInfo: StorageQuota = {
        usage,
        quota: quotaValue,
        percentUsed,
      };

      setQuota(quotaInfo);

      const level = getWarningLevel(percentUsed);
      setWarningLevel(level);

      if (level !== 'none' && onWarning) {
        onWarning(level, quotaInfo);
      }
    } catch (err) {
      const storageError = err instanceof Error ? err : new Error('Failed to check storage');
      setError(storageError);
      console.error('Storage check failed:', storageError);
    } finally {
      setIsChecking(false);
    }
  }, [getWarningLevel, onWarning]);

  // Initial check and periodic monitoring
  useEffect(() => {
    checkQuota();

    const intervalId = setInterval(checkQuota, checkInterval);

    return () => clearInterval(intervalId);
  }, [checkQuota, checkInterval]);

  return {
    quota,
    warningLevel,
    isChecking,
    error,
    checkQuota,
  };
}
