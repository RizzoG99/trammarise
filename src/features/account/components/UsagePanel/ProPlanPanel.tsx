// src/features/account/components/UsagePanel/ProPlanPanel.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/react';
import { Zap, ChevronRight, AlertTriangle, XCircle } from 'lucide-react';
import type { Subscription, SubscriptionStatus } from '@/context/subscription-types';
import { fetchWithAuth } from '@/utils/fetch-with-auth';
import { ROUTES } from '@/types/routing';

interface Props {
  subscription: Subscription;
}

interface UsageCurrentResponse {
  eventCount: number;
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getStatusBadge(
  status: SubscriptionStatus,
  cancelAtPeriodEnd: boolean,
  periodEnd: string,
  t: (key: string, opts?: Record<string, unknown>) => string
): { label: string; variant: 'cancels' | 'pastDue' | 'unpaid' | 'canceled' | 'trial' } | null {
  if (status === 'trialing')
    return {
      label: t('usagePanel.pro.badge.trial', { date: formatDate(periodEnd) }),
      variant: 'cancels',
    };
  if (cancelAtPeriodEnd)
    return {
      label: t('usagePanel.pro.badge.cancels', { date: formatDate(periodEnd) }),
      variant: 'cancels',
    };
  if (status === 'past_due')
    return { label: t('usagePanel.pro.badge.pastDue'), variant: 'pastDue' };
  if (status === 'unpaid') return { label: t('usagePanel.pro.badge.unpaid'), variant: 'pastDue' };
  if (status === 'canceled')
    return { label: t('usagePanel.pro.badge.canceled'), variant: 'canceled' };
  return null;
}

const BADGE_STYLES = {
  cancels: 'bg-accent-warning/10 border-accent-warning/25 text-accent-warning',
  pastDue: 'bg-accent-error/10 border-accent-error/25 text-accent-error',
  canceled: 'bg-accent-error/10 border-accent-error/25 text-accent-error',
  trial: 'bg-accent-warning/10 border-accent-warning/25 text-accent-warning',
  unpaid: 'bg-accent-error/10 border-accent-error/25 text-accent-error',
} as const;

export function ProPlanPanel({ subscription }: Props) {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [eventCount, setEventCount] = useState<number | null>(null);

  const { minutesUsed, minutesIncluded, currentPeriodEnd, cancelAtPeriodEnd, status } =
    subscription;
  const pct = minutesIncluded > 0 ? Math.round((minutesUsed / minutesIncluded) * 100) : 0;
  const remaining = Math.max(0, minutesIncluded - minutesUsed);
  const isWarning = pct >= 80 && pct < 100;
  const isQuotaReached = pct >= 100;
  const statusBadge = getStatusBadge(status, cancelAtPeriodEnd, currentPeriodEnd, t);
  const formattedDate = formatDate(currentPeriodEnd);

  useEffect(() => {
    fetchWithAuth(getToken, '/api/usage/current')
      .then((r) => r.json() as Promise<UsageCurrentResponse>)
      .then((data: UsageCurrentResponse) => setEventCount(data.eventCount))
      .catch(() => setEventCount(0));
  }, [getToken]);

  const barColor = isQuotaReached
    ? 'var(--color-accent-error)'
    : isWarning
      ? 'var(--color-accent-warning)'
      : 'var(--color-primary)';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/30 text-primary">
            {t('usagePanel.pro.planBadge')}
          </span>
          {statusBadge && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${BADGE_STYLES[statusBadge.variant]}`}
            >
              {statusBadge.label}
            </span>
          )}
        </div>
        <a
          href={ROUTES.PRICING}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {t('usagePanel.pro.managePlan')}
          <ChevronRight size={14} aria-hidden="true" />
        </a>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Warning / quota banners */}
      {isQuotaReached && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-lg bg-accent-error/10 border border-accent-error/25"
        >
          <XCircle
            size={15}
            className="text-accent-error flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-accent-error">
              {t('usagePanel.pro.quota.title')}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('usagePanel.pro.quota.body', { date: formattedDate })}
            </p>
          </div>
        </div>
      )}
      {isWarning && !isQuotaReached && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-lg bg-accent-warning/10 border border-accent-warning/25"
        >
          <AlertTriangle
            size={15}
            className="text-accent-warning flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-accent-warning">
              {t('usagePanel.pro.warning.title')}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('usagePanel.pro.warning.body', { minutesUsed, minutesIncluded, remaining })}
            </p>
          </div>
        </div>
      )}

      {/* Minutes section */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3">
          {t('usagePanel.pro.sectionMinutes')}
        </p>

        <div className="flex justify-between items-baseline mb-2">
          <span className="text-base font-semibold text-text-primary">
            {t('usagePanel.pro.minutesUsed', { minutesUsed, minutesIncluded })}
          </span>
          <span
            className="text-sm font-medium"
            style={{
              color: isQuotaReached
                ? 'var(--color-accent-error)'
                : isWarning
                  ? 'var(--color-accent-warning)'
                  : 'var(--color-text-secondary)',
            }}
          >
            {pct}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('usagePanel.pro.progressAriaLabel', { pct })}
          className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
          />
        </div>

        <p className="text-xs text-text-tertiary mt-2">
          {cancelAtPeriodEnd
            ? t('usagePanel.pro.accessEnds', { date: formattedDate })
            : t('usagePanel.pro.renews', { date: formattedDate })}
        </p>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Transcription count */}
      <div className="flex items-center gap-3 p-3.5 rounded-lg bg-bg-tertiary/50 border border-border">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <div>
          <div className="text-xl font-bold text-text-primary leading-none">
            {eventCount ?? '—'}
          </div>
          <div className="text-sm text-text-secondary mt-0.5">
            {t('usagePanel.pro.transcriptionCount', { count: eventCount ?? 0 })}
          </div>
        </div>
      </div>

      {/* Upgrade CTA (quota reached only) */}
      {isQuotaReached && (
        <a
          href={ROUTES.PRICING}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Zap size={14} aria-hidden="true" />
          {t('usagePanel.pro.quota.upgradeBtn')}
        </a>
      )}
    </div>
  );
}
