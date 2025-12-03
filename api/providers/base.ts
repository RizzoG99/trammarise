// Base provider interface for AI services

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SummarizeParams {
  transcript: string;
  contentType?: string;
  apiKey: string;
  model?: string; // Optional model parameter for providers that support it
}

export interface ChatParams {
  transcript: string;
  summary: string;
  message: string;
  history: ChatMessage[];
  apiKey: string;
  model?: string; // Optional model parameter for providers that support it
}

export interface AIProvider {
  name: string;

  // Summarize transcript with optional content type context
  summarize(params: SummarizeParams): Promise<string>;

  // Chat with context of transcript and summary
  chat(params: ChatParams): Promise<string>;

  // Validate API key
  validateApiKey(apiKey: string): Promise<boolean>;
}
