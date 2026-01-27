import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ApiKeyProvider, useApiKey } from './ApiKeyContext';
import { ReactNode } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Wrapper for the provider
const wrapper = ({ children }: { children: ReactNode }) => (
  <ApiKeyProvider>{children}</ApiKeyProvider>
);

describe('ApiKeyContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with null key if localStorage is empty', () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });
    expect(result.current.apiKey).toBeNull();
    expect(result.current.isValid).toBe(false);
  });

  it('should initialize with key from localStorage if present', () => {
    window.localStorage.setItem('trammarise_openai_api_key', 'sk-existing-key');
    const { result } = renderHook(() => useApiKey(), { wrapper });
    expect(result.current.apiKey).toBe('sk-existing-key');
    expect(result.current.isValid).toBe(true);
  });

  it('should setApiKey and save to localStorage', () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });

    act(() => {
      result.current.setApiKey('sk-new-key');
    });

    expect(result.current.apiKey).toBe('sk-new-key');
    expect(result.current.isValid).toBe(true);
    expect(window.localStorage.getItem('trammarise_openai_api_key')).toBe('sk-new-key');
  });

  it('should clearApiKey and remove from localStorage', () => {
    window.localStorage.setItem('trammarise_openai_api_key', 'sk-to-remove');
    const { result } = renderHook(() => useApiKey(), { wrapper });

    act(() => {
      result.current.clearApiKey();
    });

    expect(result.current.apiKey).toBeNull();
    expect(result.current.isValid).toBe(false);
    expect(window.localStorage.getItem('trammarise_openai_api_key')).toBeNull();
  });

  it('should testConnection successfully', async () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });

    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    let success;
    await act(async () => {
      success = await result.current.testConnection('sk-test-key');
    });

    expect(success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/models',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-test-key',
        }),
      })
    );
  });

  it('should fail testConnection on API error', async () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    let success;
    await act(async () => {
      success = await result.current.testConnection('sk-invalid-key');
    });

    expect(success).toBe(false);
  });
});
