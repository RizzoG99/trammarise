/**
 * Maps content types to contextual prompts for improved transcription accuracy
 * These prompts help the AI understand the context and domain of the audio
 */

export const TRANSCRIPTION_PROMPTS: Record<string, string> = {
  meeting: "The following is a meeting recording with discussions, decisions, action items, and collaborative dialogue.",
  lecture: "The following is a lecture or class recording covering educational content, explanations, and teaching material.",
  interview: "The following is an interview recording with questions, answers, and conversational exchanges.",
  podcast: "The following is a podcast episode with conversational dialogue, discussions, and commentary.",
  'voice-memo': "The following is a personal voice memo or note with thoughts, reminders, and observations.",
};

/**
 * Generates a context prompt for transcription based on content type
 * Falls back to generic prompt for unknown content types
 */
export function getTranscriptionPrompt(contentType: string, customType?: string): string {
  // If it's a predefined type, use the mapped prompt
  if (contentType in TRANSCRIPTION_PROMPTS) {
    return TRANSCRIPTION_PROMPTS[contentType];
  }

  // For custom content types, create a contextual prompt
  if (customType && customType.trim()) {
    return `The following is a recording about ${customType.trim()}.`;
  }

  // Generic fallback prompt
  return "The following is an audio recording for transcription.";
}

/**
 * Maps performance level to transcription model
 * @deprecated Use getTranscriptionModelForLevel from types/performance-levels.ts instead
 */
export function getTranscriptionModel(model: string): string {
  // Map the performance level to appropriate transcription model
  if (model === 'advanced') {
    return 'gpt-4o-transcribe'; // High performance
  }
  // Default to mini-transcribe for 'standard' and others (cost-effective)
  return 'gpt-4o-mini-transcribe';
}
