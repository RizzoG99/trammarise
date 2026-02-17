import { useTranslation } from 'react-i18next';
import type { NoiseProfile } from '../../../types/noise-profiles';
import { NOISE_PROFILE_OPTIONS } from '../../../types/noise-profiles';
import { Select } from '@/lib/components/ui';

export interface NoiseProfileSelectorProps {
  value: NoiseProfile;
  onChange: (value: NoiseProfile) => void;
}

export function NoiseProfileSelector({ value, onChange }: NoiseProfileSelectorProps) {
  const { t } = useTranslation();

  const options = NOISE_PROFILE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(`configuration.noiseProfiles.${option.value}`),
  }));

  return (
    <Select
      label={t('configuration.audioEnvironment.title')}
      value={value}
      onChange={(val) => onChange(val as NoiseProfile)}
      options={options}
    />
  );
}
