import type {
  SummarizationResponse,
  ChatResponse,
  ChatMessage,
  TranscriptionResponse,
} from '../types/audio';
import { API_VALIDATION } from '../utils/constants';
import { fetchWithTimeout } from '../utils/fetch-with-timeout';

const { API_DEFAULT_TIMEOUT, TRANSCRIBE_TIMEOUT, VALIDATION_TIMEOUT } = API_VALIDATION;

/**
 * Configuration for transcription requests
 */
export interface TranscribeConfig {
  audioBlob: Blob;
  apiKey: string;
  language?: string;
  filename?: string;
}

/**
 * Configuration for summarization requests
 */
export interface SummarizeConfig {
  transcript: string;
  contentType: string;
  provider: string;
  apiKey: string;
  model?: string;
  contextFiles?: File[];
  language?: string;
}

/**
 * Configuration for chat requests
 */
export interface ChatConfig {
  transcript: string;
  summary: string;
  message: string;
  history: ChatMessage[];
  provider: string;
  apiKey: string;
  model?: string;
  language?: string;
}

/**
 * Configuration for PDF generation requests
 */
export interface GeneratePDFConfig {
  transcript: string;
  summary: string;
  contentType: string;
  provider: string;
  apiKey: string;
  model?: string;
  language?: string;
}

/**
 * Repository for audio-related API operations
 * Centralizes all API calls and provides consistent error handling,
 * timeout management, and response validation
 */
export class AudioRepository {
  /**
   * Transcribe audio using OpenAI Whisper API
   */
  async transcribe(config: TranscribeConfig): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', config.audioBlob, config.filename || 'audio.webm');
    formData.append('apiKey', config.apiKey);
    if (config.language) {
      formData.append('language', config.language);
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
  async summarize(config: SummarizeConfig): Promise<SummarizationResponse> {
    const formData = new FormData();
    formData.append('transcript', config.transcript);
    formData.append('contentType', config.contentType);
    formData.append('provider', config.provider);
    formData.append('apiKey', config.apiKey);

    if (config.model) {
      formData.append('model', config.model);
    }

    if (config.contextFiles && config.contextFiles.length > 0) {
      config.contextFiles.forEach((file) => {
        formData.append('contextFiles', file);
      });
    }

    if (config.language) {
      formData.append('language', config.language);
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
  async chat(config: ChatConfig): Promise<ChatResponse> {
    const response = await fetchWithTimeout(
      '/api/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: config.transcript,
          summary: config.summary,
          message: config.message,
          history: config.history,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          language: config.language,
        }),
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
  async generatePDF(config: GeneratePDFConfig): Promise<Blob> {
    const response = await fetchWithTimeout(
      '/api/generate-pdf',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: config.transcript,
          summary: config.summary,
          contentType: config.contentType,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          language: config.language,
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
  async validateApiKey(provider: string, apiKey: string): Promise<boolean> {
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
}

// Export singleton instance
export const audioRepository = new AudioRepository();
