/**
 * All supported content types for audio transcription/summarization
 */
export const CONTENT_TYPE_VALUES = [
  'meeting',
  'lecture',
  'interview',
  'podcast',
  'voice-memo',
  'sales-call',
  'medical-clinical',
  'legal',
  'daily-stand-up',
  'focus-group',
  'other',
] as const;

/**
 * Union type of all content type values
 */
export type ContentType = (typeof CONTENT_TYPE_VALUES)[number];

/**
 * Content type selector item for the UI
 */
export interface ContentTypeOption {
  value: ContentType;
  label: string;
}

/**
 * Predefined content type options for the configuration UI
 */
export const CONTENT_TYPE_OPTIONS: readonly ContentTypeOption[] = [
  { value: 'daily-stand-up', label: 'Daily Stand-up' },
  { value: 'focus-group', label: 'Focus Group' },
  { value: 'interview', label: 'Interview' },
  { value: 'lecture', label: 'Lecture/Class' },
  { value: 'legal', label: 'Legal' },
  { value: 'medical-clinical', label: 'Medical Clinical' },
  { value: 'meeting', label: 'Meeting Notes' },
  { value: 'podcast', label: 'Podcast Episode' },
  { value: 'sales-call', label: 'Sales Call' },
  { value: 'voice-memo', label: 'Voice Memo' },
  { value: 'other', label: 'Other (specify)' },
] as const;

/**
 * Type guard to check if a string is a valid content type
 */
export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPE_VALUES.includes(value as ContentType);
}
