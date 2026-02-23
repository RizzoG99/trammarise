/**
 * Performance levels for AI processing
 * Represents the quality/speed tradeoff for transcription and summarization
 */
export type PerformanceLevel = 'standard' | 'advanced';

/**
 * All supported performance levels
 */
export const PERFORMANCE_LEVELS = ['standard', 'advanced'] as const;

/**
 * Performance level option for the UI
 */
export interface PerformanceLevelOption {
  value: PerformanceLevel;
  label: string;
  description: string;
}

/**
 * Predefined performance level options for the configuration UI
 */
export const PERFORMANCE_LEVEL_OPTIONS: readonly PerformanceLevelOption[] = [
  { value: 'standard', label: 'Standard', description: 'Fast & cost-effective' },
  { value: 'advanced', label: 'High Performance', description: 'Advanced reasoning capabilities' },
] as const;

/**
 * Type guard to check if a string is a valid performance level
 */
export function isPerformanceLevel(value: string): value is PerformanceLevel {
  return PERFORMANCE_LEVELS.includes(value as PerformanceLevel);
}

/**
 * Maps performance level to summarization/chat model
 * @param level - The performance level selected by the user
 * @returns The OpenAI chat model identifier
 */
export function getSummarizationModelForLevel(level: PerformanceLevel): string {
  return level === 'advanced'
    ? 'o3-mini' // High performance: advanced reasoning
    : 'gpt-4o'; // Standard: fast and cost-effective
}
