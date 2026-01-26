/**
 * All supported noise profiles for audio transcription/summarization
 */
export const NOISE_PROFILE_VALUES = ['quiet', 'meeting_room', 'cafe', 'outdoor', 'phone'] as const;

/**
 * Union type of all noise profile values
 */
export type NoiseProfile = (typeof NOISE_PROFILE_VALUES)[number];

/**
 * Noise profile selector item for the UI
 */
export interface NoiseProfileOption {
  value: NoiseProfile;
  label: string;
  description: string;
}

/**
 * Predefined noise profile options for the configuration UI
 */
export const NOISE_PROFILE_OPTIONS: readonly NoiseProfileOption[] = [
  {
    value: 'quiet',
    label: 'Quiet Environment',
    description: 'Studio, office, or controlled setting',
  },
  {
    value: 'meeting_room',
    label: 'Meeting Room',
    description: 'Conference room with multiple speakers',
  },
  {
    value: 'cafe',
    label: 'Cafe / Restaurant',
    description: 'Background chatter and ambient noise',
  },
  {
    value: 'outdoor',
    label: 'Outdoor',
    description: 'Wind, traffic, or environmental noise',
  },
  {
    value: 'phone',
    label: 'Phone / Digital Call',
    description: 'Compressed audio from calls',
  },
] as const;

/**
 * Type guard to check if a string is a valid noise profile
 */
export function isNoiseProfile(value: string): value is NoiseProfile {
  return NOISE_PROFILE_VALUES.includes(value as NoiseProfile);
}
