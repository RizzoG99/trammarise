import type {
  TranscriptionResponse,
  SummarizationResponse,
  ChatResponse,
  ChatMessage,
} from '../types/audio';

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(audioBlob: Blob, apiKey: string, language?: string): Promise<{ transcript: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('apiKey', apiKey);
  if (language) {
    formData.append('language', language);
  }

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Transcription failed');
  }

  return response.json();
}

/**
 * Summarize transcript using selected AI provider
 */
export async function summarizeTranscript(
  transcript: string,
  contentType: string,
  provider: string,
  apiKey: string,
  model?: string
): Promise<SummarizationResponse> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, contentType, provider, apiKey, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Summarization failed');
  }

  return response.json();
}

/**
 * Chat with AI to refine summary or ask questions
 */
export async function chatWithAI(
  transcript: string,
  summary: string,
  message: string,
  history: ChatMessage[],
  provider: string,
  apiKey: string,
  model?: string
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, summary, message, history, provider, apiKey, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Chat failed');
  }

  return response.json();
}

/**
 * Validate API key for a specific provider
 */
export async function validateApiKey(
  provider: string,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/validate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });

    if (!response.ok) return false;

    const { valid } = await response.json();
    return valid;
  } catch {
    return false;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}
