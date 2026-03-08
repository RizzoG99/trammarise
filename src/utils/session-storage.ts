// Session storage utilities for API configuration
// Uses sessionStorage for security - cleared when tab closes

const STORAGE_KEY = 'trammarise_api_config';

export interface StoredConfig {
  provider: string;
  apiKey: string;
  openaiKey: string;
  timestamp: number;
}

export function saveApiConfig(
  provider: string,
  apiKey: string,
  openaiKey: string,
  persist = false
): void {
  const config: StoredConfig = {
    provider,
    apiKey,
    openaiKey,
    timestamp: Date.now(),
  };

  const payload = JSON.stringify(config);
  sessionStorage.setItem(STORAGE_KEY, payload);
  if (persist) {
    localStorage.setItem(STORAGE_KEY, payload);
  }
}

export function getApiConfig(): StoredConfig | null {
  const stored = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearApiConfig(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

export function isApiConfigPersisted(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// Note: sessionStorage automatically clears when the tab/window closes
// No need to manually clear on beforeunload (which also fires on refresh/navigation)

const ONBOARDING_USE_CASE_KEY = 'trammarise_onboarding_use_case';

export function saveOnboardingUseCase(useCase: string): void {
  sessionStorage.setItem(ONBOARDING_USE_CASE_KEY, useCase);
}

export function getOnboardingUseCase(): string | null {
  return sessionStorage.getItem(ONBOARDING_USE_CASE_KEY);
}
