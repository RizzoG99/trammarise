import type { SummarizationResponse, ChatResponse, ChatMessage } from '../types/audio';
import { API_VALIDATION } from './constants';
import { fetchWithTimeout } from './fetch-with-timeout';

const { API_DEFAULT_TIMEOUT, TRANSCRIBE_TIMEOUT, VALIDATION_TIMEOUT } = API_VALIDATION;

/**
 * Create a transcription job (server-side chunking)
 */
export async function createTranscriptionJob(
  audioBlob: Blob,
  apiKey: string,
  language?: string,
  model?: string,
  contentType?: string,
  performanceLevel?: string,
  filename: string = 'audio.webm'
): Promise<{ jobId: string; statusUrl: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('apiKey', apiKey);
  if (language) {
    formData.append('language', language);
  }
  if (model) {
    formData.append('model', model);
  }
  if (contentType) {
    formData.append('contentType', contentType);
  }
  if (performanceLevel) {
    formData.append('performanceLevel', performanceLevel);
  }

  const response = await fetchWithTimeout(
    '/api/transcribe',
    {
      method: 'POST',
      body: formData,
    },
    TRANSCRIBE_TIMEOUT
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Failed to create transcription job' }));
    throw new Error(error.message || 'Failed to create transcription job');
  }

  const data = await response.json();

  // Validate response structure
  if (!data || typeof data.jobId !== 'string') {
    throw new Error('Invalid response from transcription API');
  }

  return {
    jobId: data.jobId,
    statusUrl: data.statusUrl,
  };
}

/**
 * Cancel a transcription job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const response = await fetch(`/api/transcribe-job/${jobId}/cancel`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to cancel job' }));
    throw new Error(error.message || 'Failed to cancel job');
  }
}

/**
 * Poll job status until completion
 */
export async function pollJobStatus(
  jobId: string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  const POLL_INTERVAL = 2000; // 2 seconds
  const MAX_POLLS = 150; // 5 minutes total (150 * 2s = 300s)

  let pollCount = 0;

  while (pollCount < MAX_POLLS) {
    try {
      const response = await fetch(`/api/transcribe-job/${jobId}/status`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Job not found');
        }
        throw new Error('Failed to fetch job status');
      }

      const data = await response.json();

      // Call progress callback
      if (onProgress) {
        onProgress(data.progress, data.status);
      }

      // Check job status
      if (data.status === 'completed') {
        if (!data.transcript) {
          throw new Error('Job completed but no transcript found');
        }
        return data.transcript;
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Transcription job failed');
      }

      if (data.status === 'cancelled') {
        throw new Error('Transcription job was cancelled');
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      pollCount++;
    } catch (error) {
      // If it's a network error, retry a few times
      if (pollCount < 3) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        pollCount++;
        continue;
      }
      throw error;
    }
  }

  throw new Error('Transcription job timed out');
}

/**
 * Transcribe audio using OpenAI Transcription API
 * @deprecated Use createTranscriptionJob + pollJobStatus for server-side chunking
 */
export async function transcribeAudio(
  audioBlob: Blob,
  apiKey: string,
  language?: string,
  model?: string,
  contentType?: string,
  filename: string = 'audio.webm' // Default fallback
): Promise<{ transcript: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('apiKey', apiKey);
  if (language) {
    formData.append('language', language);
  }
  if (model) {
    formData.append('model', model);
  }
  if (contentType) {
    formData.append('contentType', contentType);
  }

  const response = await fetchWithTimeout(
    '/api/transcribe',
    {
      method: 'POST',
      body: formData,
    },
    TRANSCRIBE_TIMEOUT
  );

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
  model?: string,
  contextFiles?: File[],
  language?: string
): Promise<SummarizationResponse> {
  const formData = new FormData();
  formData.append('transcript', transcript);
  formData.append('contentType', contentType);
  formData.append('provider', provider);
  formData.append('apiKey', apiKey);

  if (model) {
    formData.append('model', model);
  }

  if (contextFiles && contextFiles.length > 0) {
    contextFiles.forEach((file) => {
      formData.append('contextFiles', file);
    });
  }

  if (language) {
    formData.append('language', language);
  }

  const response = await fetchWithTimeout(
    '/api/summarize',
    {
      method: 'POST',
      body: formData,
    },
    API_DEFAULT_TIMEOUT
  );

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
  const response = await fetchWithTimeout(
    '/api/chat',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, summary, message, history, provider, apiKey, model }),
    },
    API_DEFAULT_TIMEOUT
  );

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
 * Generate PDF from transcript and summary using AI formatting
 */
export async function generatePDF(
  transcript: string,
  summary: string,
  contentType: string,
  provider: string,
  apiKey: string,
  model?: string,
  language?: string
): Promise<Blob> {
  const response = await fetchWithTimeout(
    '/api/generate-pdf',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        summary,
        contentType,
        provider,
        apiKey,
        model,
        language,
      }),
    },
    60000
  ); // 60 second timeout for PDF generation

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'PDF generation failed' }));
    throw new Error(error.message || 'PDF generation failed');
  }

  // Return the PDF as a blob with explicit type
  const blob = await response.blob();
  return new Blob([blob], { type: 'application/pdf' });
}

/**
 * Validate API key for a specific provider
 */
export async function validateApiKey(provider: string, apiKey: string): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      '/api/validate-key',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey }),
      },
      VALIDATION_TIMEOUT
    );

    if (!response.ok) {
      console.error('API key validation failed:', {
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    const data = await response.json();

    // Validate response structure
    if (typeof data.valid !== 'boolean') {
      console.error('Invalid validation response structure:', data);
      return false;
    }

    return data.valid;
  } catch (error) {
    const err = error as { message?: string; name?: string };
    console.error('API key validation error:', {
      message: err?.message,
      name: err?.name,
    });
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
