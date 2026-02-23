import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ApiKeyProvider, useApiKey } from './ApiKeyContext';
import type { ReactNode } from 'react';

// Mock localStorage (for migration test)
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

// Mock sessionStorage (primary storage)
const sessionStorageMock = (() => {
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

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Wrapper for the provider
const wrapper = ({ children }: { children: ReactNode }) => (
  <ApiKeyProvider>{children}</ApiKeyProvider>
);

describe('ApiKeyContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with null key if sessionStorage is empty', () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });
    expect(result.current.apiKey).toBeNull();
    expect(result.current.isValid).toBe(false);
  });

  it('should initialize with key from sessionStorage if present', () => {
    window.sessionStorage.setItem('trammarise_openai_api_key', 'sk-existing-key');
    const { result } = renderHook(() => useApiKey(), { wrapper });
    expect(result.current.apiKey).toBe('sk-existing-key');
    expect(result.current.isValid).toBe(true);
  });

  it('should migrate key from localStorage to sessionStorage on first load', () => {
    // Set key in localStorage (old storage)
    window.localStorage.setItem('trammarise_openai_api_key', 'sk-migrated-key');
    const { result } = renderHook(() => useApiKey(), { wrapper });

    // Should have migrated to sessionStorage
    expect(result.current.apiKey).toBe('sk-migrated-key');
    expect(result.current.isValid).toBe(true);
    expect(window.sessionStorage.getItem('trammarise_openai_api_key')).toBe('sk-migrated-key');
    expect(window.localStorage.getItem('trammarise_openai_api_key')).toBeNull();
  });

  it('should setApiKey and save to sessionStorage', () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });

    act(() => {
      result.current.setApiKey('sk-new-key');
    });

    expect(result.current.apiKey).toBe('sk-new-key');
    expect(result.current.isValid).toBe(true);
    expect(window.sessionStorage.getItem('trammarise_openai_api_key')).toBe('sk-new-key');
    expect(window.localStorage.getItem('trammarise_openai_api_key')).toBeNull();
  });

  it('should clearApiKey and remove from sessionStorage', () => {
    window.sessionStorage.setItem('trammarise_openai_api_key', 'sk-to-remove');
    const { result } = renderHook(() => useApiKey(), { wrapper });

    act(() => {
      result.current.clearApiKey();
    });

    expect(result.current.apiKey).toBeNull();
    expect(result.current.isValid).toBe(false);
    expect(window.sessionStorage.getItem('trammarise_openai_api_key')).toBeNull();
  });

  it('should testConnection successfully', async () => {
    const { result } = renderHook(() => useApiKey(), { wrapper });

    // Mock global fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    let success;
    await act(async () => {
      success = await result.current.testConnection('sk-test-key');
    });

    expect(success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
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

    globalThis.fetch = vi.fn().mockResolvedValue({
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
