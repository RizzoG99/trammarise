import { useTranslation } from 'react-i18next';
import type { NoiseProfile } from '../../../types/noise-profiles';
import { NOISE_PROFILE_OPTIONS } from '../../../types/noise-profiles';
import { Text } from '@/lib';

export interface NoiseProfileSelectorProps {
  value: NoiseProfile;
  onChange: (value: NoiseProfile) => void;
}

export function NoiseProfileSelector({ value, onChange }: NoiseProfileSelectorProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label htmlFor="noise-profile-select" className="block mb-2">
        <Text variant="body" color="primary" className="font-medium">
          {t('configuration.audioEnvironment.title')}
        </Text>
      </label>
      <select
        id="noise-profile-select"
        value={value}
        onChange={(e) => onChange(e.target.value as NoiseProfile)}
        className="
          w-full px-4 py-3 rounded-lg
          bg-[var(--color-bg-surface)] border border-border
          text-text-primary
          focus:outline-none focus:border-primary
          transition-colors
        "
      >
        {NOISE_PROFILE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(`configuration.noiseProfiles.${option.value}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
