/**
 * Performance levels for AI processing
 * Represents the quality/speed tradeoff for transcription and summarization
 */
export type PerformanceLevel = 'standard' | 'advanced';

/**
 * Maps performance level to transcription model
 * @param level - The performance level selected by the user
 * @returns The OpenAI transcription model identifier
 */
export function getTranscriptionModelForLevel(level: PerformanceLevel): string {
  return level === 'advanced'
    ? 'gpt-4o-transcribe'        // High performance: better accuracy, higher cost
    : 'gpt-4o-mini-transcribe';  // Standard: good accuracy, cost-effective
}

/**
 * Maps performance level to summarization/chat model
 * @param level - The performance level selected by the user
 * @returns The OpenAI chat model identifier
 */
export function getSummarizationModelForLevel(level: PerformanceLevel): string {
  return level === 'advanced'
    ? 'o3-mini'  // High performance: advanced reasoning
    : 'gpt-4o';  // Standard: fast and cost-effective
}
