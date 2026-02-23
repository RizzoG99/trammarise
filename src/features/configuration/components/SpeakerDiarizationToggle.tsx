import { useTranslation } from 'react-i18next';
import { Text, ToggleSwitch } from '@/lib';

export interface SpeakerDiarizationToggleProps {
  enabled: boolean;
  speakersExpected?: number;
  onEnabledChange: (enabled: boolean) => void;
  onSpeakersExpectedChange: (count: number | undefined) => void;
}

/**
 * SpeakerDiarizationToggle - Configuration component for speaker diarization
 *
 * Allows users to enable speaker diarization (identifying different speakers)
 * and optionally specify the expected number of speakers for better accuracy.
 *
 * @example
 * ```tsx
 * <SpeakerDiarizationToggle
 *   enabled={enableSpeakerDiarization}
 *   speakersExpected={speakersExpected}
 *   onEnabledChange={setEnableSpeakerDiarization}
 *   onSpeakersExpectedChange={setSpeakersExpected}
 * />
 * ```
 */
export function SpeakerDiarizationToggle({
  enabled,
  speakersExpected,
  onEnabledChange,
  onSpeakersExpectedChange,
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
