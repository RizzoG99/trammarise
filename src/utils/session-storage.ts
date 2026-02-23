// Session storage utilities for API configuration
// Uses sessionStorage for security - cleared when tab closes

const STORAGE_KEY = 'trammarise_api_config';

export interface StoredConfig {
  provider: string;
  apiKey: string;
  openaiKey: string;
  timestamp: number;
}

export function saveApiConfig(provider: string, apiKey: string, openaiKey: string): void {
  const config: StoredConfig = {
    provider,
    apiKey,
    openaiKey,
    timestamp: Date.now(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getApiConfig(): StoredConfig | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearApiConfig(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

// Note: sessionStorage automatically clears when the tab/window closes
// No need to manually clear on beforeunload (which also fires on refresh/navigation)
