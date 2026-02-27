import { useTranslation } from 'react-i18next';
import type { ContentType } from '../../../types/content-types';
import { CONTENT_TYPE_OPTIONS } from '../../../types/content-types';
import { Select } from '@/lib/components/ui';
import { Tooltip } from '@/lib/components/ui/Tooltip/Tooltip';
import { Info } from 'lucide-react';

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
      label={
        <span className="flex items-center gap-2">
          {t('configuration.meetingType.title')}
          <Tooltip
            content={t(
              'configuration.meetingType.tooltip',
              'Select the type of content for optimizations'
            )}
            placement="top"
          >
            <Info className="w-4 h-4 text-text-tertiary" />
          </Tooltip>
        </span>
      }
      value={value}
      onChange={(val) => onChange(val as ContentType)}
      options={options}
    />
  );
}
