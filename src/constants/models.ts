// Curated list of popular AI models available through OpenRouter (2025)
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow: number;
}

export const CURATED_MODELS: AIModel[] = [
  // OpenAI Models (2025)
  {
    id: 'openai/o3',
    name: 'GPT-o3',
    provider: 'OpenAI',
    description: 'Flagship reasoning model with advanced multi-step logic',
    contextWindow: 128000,
  },
  {
    id: 'openai/o3-mini',
    name: 'GPT-o3 Mini',
    provider: 'OpenAI',
    description: 'Cost-efficient reasoning model for coding & math',
    contextWindow: 128000,
  },
  {
    id: 'openai/gpt-4.5',
    name: 'GPT-4.5',
    provider: 'OpenAI',
    description: 'Latest chat model with enhanced reasoning',
    contextWindow: 128000,
  },
  {
    id: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    description: 'Advanced coding and long-context reasoning',
    contextWindow: 1000000,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Multimodal model with vision capabilities',
    contextWindow: 128000,
  },
  
  // Anthropic Models (2025)
  {
    id: 'anthropic/claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    description: 'Frontier reasoning model for complex tasks',
    contextWindow: 200000,
  },
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
    contextWindow: 200000,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Previous generation, still highly capable',
    contextWindow: 200000,
  },
  
  // Google Models (2025)
  {
    id: 'google/gemini-3-pro',
    name: 'Gemini 3 Pro',
    provider: 'Google',
    description: 'Flagship multimodal reasoning model',
    contextWindow: 1000000,
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Advanced reasoning with thinking capabilities',
    contextWindow: 1000000,
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Fast and cost-effective',
    contextWindow: 1000000,
  },
  
  // Meta Models
  {
    id: 'meta-llama/llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    description: 'Largest open-source model',
    contextWindow: 128000,
  },
  {
    id: 'meta-llama/llama-3.1-70b',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    description: 'Balanced open-source option',
    contextWindow: 128000,
  },
  
  // Mistral Models
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    description: 'High-performance European model',
    contextWindow: 128000,
  },
  
  // Other Models
  {
    id: 'deepseek/deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'Cost-effective Chinese model',
    contextWindow: 64000,
  },
  {
    id: 'qwen/qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'Qwen',
    description: 'Strong multilingual capabilities',
    contextWindow: 128000,
  },
];
