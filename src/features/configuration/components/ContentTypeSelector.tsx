import { useTranslation } from 'react-i18next';
import type { ContentType } from '../../../types/content-types';
import { CONTENT_TYPE_OPTIONS } from '../../../types/content-types';
import { Select } from '@/lib/components/ui';

export interface ContentTypeSelectorProps {
  value: ContentType;
  onChange: (contentType: ContentType) => void;
}

export function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  const { t } = useTranslation();

  const options = CONTENT_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: t(`configuration.meetingType.options.${option.value}`),
  }));

  return (
    <Select
      label={t('configuration.meetingType.title')}
      value={value}
      onChange={(val) => onChange(val as ContentType)}
      options={options}
    />
  );
}
