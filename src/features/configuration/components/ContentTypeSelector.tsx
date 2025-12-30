import type { ContentType } from '../../../types/content-types';
import { CONTENT_TYPE_OPTIONS } from '../../../types/content-types';
import { Text } from '../../../components/ui/Text';

export interface ContentTypeSelectorProps {
  value: ContentType;
  onChange: (contentType: ContentType) => void;
}

export function ContentTypeSelector({ value, onChange }: ContentTypeSelectorProps) {
  return (
    <div>
      <label htmlFor="content-type-select" className="block mb-2">
        <Text variant="body" color="primary" className="font-medium">
          Meeting Type
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
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
