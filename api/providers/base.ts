// Base provider interface for AI services

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SummarizeParams {
  transcript: string;
  contentType: string;
  apiKey: string;
  model?: string; // Optional model parameter for providers that support it
  language?: string; // Optional language for summary generation
  context?: {
    text: string;
    images: { type: string; data: string }[];
    noiseProfile?: string;
  };
}

export interface ChatParams {
  transcript: string;
  summary: string;
  message: string;
  history: ChatMessage[];
  apiKey: string;
  model?: string; // Optional model parameter for providers that support it
  language?: string; // Optional language for chat prompts
}

export interface AIProvider {
  name: string;

  // Summarize transcript with optional content type context
  summarize(params: SummarizeParams): Promise<string>;

  // Chat with context of transcript and summary
  chat(params: ChatParams): Promise<string>;

  // Validate API key
  validateApiKey(apiKey: string): Promise<boolean>;

  // Transcribe audio file
  transcribe(params: TranscribeParams): Promise<string>;
}

export interface TranscribeParams {
  filePath: string;
  apiKey: string;
  model?: string;
  language?: string;
  prompt?: string;
  temperature?: number;
}
