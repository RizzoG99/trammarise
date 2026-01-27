import { useTranslation } from 'react-i18next';
import type { ContentType } from '../../../types/content-types';
import { CONTENT_TYPE_OPTIONS } from '../../../types/content-types';
import { Text } from '@/lib';

export interface ContentTypeSelectorProps {
  value: ContentType;
  onChange: (contentType: ContentType) => void;
}

export function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label htmlFor="content-type-select" className="block mb-2">
        <Text variant="body" color="primary" className="font-medium">
          {t('configuration.meetingType.title')}
        </Text>
      </label>
      <select
        id="content-type-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ContentType)}
        className="
          w-full px-4 py-3 rounded-lg
          bg-[var(--color-bg-surface)] border border-border
          text-text-primary
          focus:outline-none focus:border-primary
          transition-colors
        "
      >
        {CONTENT_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(`configuration.meetingType.options.${option.value}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
