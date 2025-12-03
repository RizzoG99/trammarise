import type {
  TranscriptionResponse,
  SummarizationResponse,
  ChatResponse,
  ChatMessage,
} from '../types/audio';
import { API_VALIDATION } from './constants';

const { API_DEFAULT_TIMEOUT, TRANSCRIBE_TIMEOUT, VALIDATION_TIMEOUT } = API_VALIDATION;

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  }
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(
  audioBlob: Blob, 
  apiKey: string, 
  language?: string,
  filename: string = 'audio.webm' // Default fallback
): Promise<{ transcript: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('apiKey', apiKey);
  if (language) {
    formData.append('language', language);
  }

  const response = await fetchWithTimeout('/api/transcribe', {
    method: 'POST',
    body: formData,
  }, TRANSCRIBE_TIMEOUT);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Transcription failed' }));
    throw new Error(error.message || 'Transcription failed');
  }

  const data = await response.json();

  // Validate response structure
  if (!data || typeof data.transcript !== 'string') {
    throw new Error('Invalid response from transcription API');
  }

  return data;
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
  const response = await fetchWithTimeout('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, contentType, provider, apiKey, model }),
  }, API_DEFAULT_TIMEOUT);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Summarization failed' }));
    throw new Error(error.message || 'Summarization failed');
  }

  const data = await response.json();

  // Validate response structure
  if (!data || typeof data.summary !== 'string') {
    throw new Error('Invalid response from summarization API');
  }

  return data;
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
  const response = await fetchWithTimeout('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, summary, message, history, provider, apiKey, model }),
  }, API_DEFAULT_TIMEOUT);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Chat failed' }));
    throw new Error(error.message || 'Chat failed');
  }

  const data = await response.json();

  // Validate response structure
  if (!data || typeof data.response !== 'string') {
    throw new Error('Invalid response from chat API');
  }

  return data;
}

/**
 * Validate API key for a specific provider
 */
export async function validateApiKey(
  provider: string,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetchWithTimeout('/api/validate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    }, VALIDATION_TIMEOUT);

    if (!response.ok) return false;

    const data = await response.json();

    // Validate response structure
    if (typeof data.valid !== 'boolean') {
      return false;
    }

    return data.valid;
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
