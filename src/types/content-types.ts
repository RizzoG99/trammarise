/**
 * All supported content types for audio transcription/summarization
 */
export const CONTENT_TYPE_VALUES = [
  'meeting',
  'lecture',
  'interview',
  'podcast',
  'voice-memo',
  'other',
] as const;

/**
 * Union type of all content type values
 */
export type ContentType = typeof CONTENT_TYPE_VALUES[number];

/**
 * Content type selector item for the UI
 */
export interface ContentTypeOption {
  value: ContentType;
  label: string;
  icon: string;
}

/**
 * Predefined content type options for the configuration UI
 */
export const CONTENT_TYPE_OPTIONS: readonly ContentTypeOption[] = [
  { value: 'meeting', label: 'Meeting Notes', icon: '📝' },
  { value: 'lecture', label: 'Lecture/Class', icon: '🎓' },
  { value: 'interview', label: 'Interview', icon: '🎤' },
  { value: 'podcast', label: 'Podcast Episode', icon: '🎙️' },
  { value: 'voice-memo', label: 'Voice Memo', icon: '🗣️' },
  { value: 'other', label: 'Other (specify)', icon: '✏️' },
] as const;

/**
 * Type guard to check if a string is a valid content type
 */
export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPE_VALUES.includes(value as ContentType);
}
