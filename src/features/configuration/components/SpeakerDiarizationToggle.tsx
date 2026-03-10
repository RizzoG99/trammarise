import { useTranslation } from 'react-i18next';
import { Text, ToggleSwitch } from '@/lib';

export interface SpeakerDiarizationToggleProps {
  enabled: boolean;
  speakersExpected?: number;
  onEnabledChange: (enabled: boolean) => void;
  onSpeakersExpectedChange: (count: number | undefined) => void;
  /** Whether the current user has Pro access. Defaults to true for backwards compat. */
  isProUser?: boolean;
  /** Called when a free user clicks the locked row to upgrade. */
  onUpgradeClick?: () => void;
}

function ProBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold"
      style={{
        backgroundColor: 'var(--color-accent-warning-alpha-10)',
        color: 'var(--color-accent-warning)',
      }}
    >
      {label}
    </span>
  );
}

/**
 * SpeakerDiarizationToggle - Configuration component for speaker diarization
 *
 * For Pro users: standard toggle with optional speaker count input.
 * For free users: locked row with Pro badge; clicking calls onUpgradeClick.
 */
export function SpeakerDiarizationToggle({
  enabled,
  speakersExpected,
  onEnabledChange,
  onSpeakersExpectedChange,
  isProUser = true,
  onUpgradeClick,
}: SpeakerDiarizationToggleProps) {
  const { t } = useTranslation();

  const handleSpeakerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onSpeakersExpectedChange(undefined);
    } else {
      const count = parseInt(value, 10);
      if (!isNaN(count) && count >= 2 && count <= 10) {
        onSpeakersExpectedChange(count);
      }
    }
  };

  // Free user: locked row that mimics ToggleSwitch layout with inline Pro badge
  if (!isProUser) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="w-full text-left cursor-pointer"
          onClick={onUpgradeClick}
          aria-label={`${t('configuration.speakerDiarization.title')} — ${t('configuration.speakerDiarization.proUpgradeHint', 'Upgrade to Pro to identify speakers')}`}
        >
          {/* Locked toggle row — mimics ToggleSwitch layout */}
          <div
            role="switch"
            aria-checked={false}
            aria-disabled={true}
            className="flex items-start gap-3 py-2 opacity-60 pointer-events-none select-none"
          >
            {/* Track — always off, locked */}
            <div className="relative w-11 h-6 rounded-full border flex-shrink-0 bg-bg-tertiary border-border">
              <div className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm" />
            </div>
            {/* Label + Pro badge + hint */}
            <div className="flex-1">
              <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
                {t('configuration.speakerDiarization.title')}
                <ProBadge label={t('configuration.speakerDiarization.proBadge', 'Pro')} />
              </span>
              <p className="text-xs text-text-secondary mt-0.5">
                {t(
                  'configuration.speakerDiarization.proUpgradeHint',
                  'Upgrade to Pro to identify speakers'
                )}
              </p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Pro user: standard toggle
  return (
    <div className="space-y-4">
      <ToggleSwitch
        label={t('configuration.speakerDiarization.title')}
        description={t('configuration.speakerDiarization.description')}
        checked={enabled}
        onChange={onEnabledChange}
      />

      {enabled && (
        <div className="ml-14 animate-fadeIn">
          <label htmlFor="speakers-expected" className="block mb-2">
            <Text variant="body" color="secondary" className="text-sm">
              {t('configuration.speakerDiarization.speakersExpected')}
            </Text>
          </label>
          <input
            id="speakers-expected"
            type="number"
            min="2"
            max="10"
            value={speakersExpected ?? ''}
            onChange={handleSpeakerCountChange}
            placeholder={t('configuration.speakerDiarization.speakersPlaceholder')}
            className="
              w-full px-3 py-2 rounded-lg
              bg-[var(--color-bg-surface)] border border-border
              text-text-primary text-sm
              focus:outline-none focus:border-primary
              transition-colors
            "
          />
          <Text variant="caption" color="secondary" className="mt-1 block">
            {t('configuration.speakerDiarization.speakersHint')}
          </Text>
        </div>
      )}
    </div>
  );
}
