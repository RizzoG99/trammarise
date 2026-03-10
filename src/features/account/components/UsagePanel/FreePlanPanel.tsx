// src/features/account/components/UsagePanel/FreePlanPanel.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Key,
  Lock,
  MessageSquare,
  Users,
  Cloud,
  ExternalLink,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase/client';
import { getApiConfig } from '@/utils/session-storage';
import { ROUTES } from '@/types/routing';

const LOCKED_FEATURES = [
  { key: 'hostedApi', Icon: Key },
  { key: 'chat', Icon: MessageSquare },
  { key: 'diarization', Icon: Users },
  { key: 'cloudSync', Icon: Cloud },
] as const;

export function FreePlanPanel() {
  const { t } = useTranslation();
  const [eventCount, setEventCount] = useState<number | null>(null);
  const hasApiKey = getApiConfig() !== null;

  useEffect(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    supabaseClient
      .from('usage_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())
      .then(({ count }) => setEventCount(count ?? 0))
      .catch(() => setEventCount(0));
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-bg-tertiary border border-border text-text-secondary">
            {t('usagePanel.free.planBadge')}
          </span>
        </div>
        <a
          href={ROUTES.PRICING}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Zap size={13} aria-hidden="true" />
          {t('usagePanel.free.upgradeBtn')}
        </a>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* This month */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3">
          {t('usagePanel.free.sectionThisMonth')}
        </p>

        {/* Transcription count callout */}
        <div className="flex items-center gap-3 p-3.5 rounded-lg bg-bg-tertiary/50 border border-border mb-3">
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
              {t('usagePanel.free.transcriptionCount', { count: eventCount ?? 0 })}
            </div>
          </div>
        </div>

        {/* BYOK status or no-key warning */}
        {hasApiKey ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Key size={14} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
              {t('usagePanel.free.byokStatus')}
            </div>
            <a
              href="https://platform.openai.com/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:opacity-80 transition-opacity"
            >
              {t('usagePanel.free.checkBalance')}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-warning/10 border border-accent-warning/25">
            <AlertCircle
              size={15}
              className="text-accent-warning flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm text-accent-warning font-medium">
                {t('usagePanel.free.noKeyWarning')}
              </p>
              <a
                href="/account?section=apiKeys"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors underline mt-0.5"
              >
                {t('usagePanel.free.noKeyCta')}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Missing features */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-1">
          {t('usagePanel.free.sectionMissing')}
        </p>
        <p className="text-xs text-text-tertiary mb-3">
          {t('usagePanel.free.sectionMissingCaption')}
        </p>

        <div className="space-y-0.5">
          {LOCKED_FEATURES.map(({ key, Icon }) => (
            <div
              key={key}
              className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-tertiary/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-bg-tertiary border border-border flex items-center justify-center flex-shrink-0 text-text-tertiary">
                <Icon size={13} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text-secondary">
                    {t(`usagePanel.free.feature.${key}.name`)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-tertiary bg-bg-tertiary border border-border rounded px-1.5 py-0.5">
                    <Lock size={8} aria-hidden="true" />
                    {t('usagePanel.free.proBadge')}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5 leading-snug">
                  {t(`usagePanel.free.feature.${key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Bottom upgrade CTA */}
      <a
        href={ROUTES.PRICING}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
      >
        <Zap size={14} aria-hidden="true" />
        {t('usagePanel.free.upgradeBtn')}
      </a>
    </div>
  );
}
