import { useTranslation } from 'react-i18next';
import type { LanguageCode } from '../../../types/languages';
import { LANGUAGE_OPTIONS } from '../../../types/languages';
import { Select } from '@/lib/components/ui';

export interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const { t } = useTranslation();

  const options = LANGUAGE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(`configuration.language.options.${option.value}`),
  }));

  return (
    <Select
      label={t('configuration.language.title')}
      value={value}
      onChange={(val) => onChange(val as LanguageCode)}
      options={options}
    />
  );
}
