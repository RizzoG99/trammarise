/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  isValid: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  testConnection: (key: string) => Promise<boolean>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const STORAGE_KEY = 'trammarise_openai_api_key';

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  // Initialize from storage directly in useState
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    const storedKey = window.localStorage.getItem(STORAGE_KEY);
    return storedKey || null;
  });

  const setApiKey = useCallback((key: string) => {
    const trimmedKey = key.trim();
    setApiKeyState(trimmedKey);
    window.localStorage.setItem(STORAGE_KEY, trimmedKey);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const testConnection = useCallback(async (keyToTest: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${keyToTest}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('API Key validation failed:', error);
      return false;
    }
  }, []);

  // Derived state: for now, if we have a key, we assume it's roughly valid until tested.
  // The plan implies `isValid` is true if key exists.
  // In a stricter sense, we might want `isVerified` but that requires persistent verification state.
  // For the purpose of the test suite I wrote: `expect(result.current.isValid).toBe(true);` when key is set.
  const isValid = !!apiKey;

  return (
    <ApiKeyContext.Provider value={{ apiKey, isValid, setApiKey, clearApiKey, testConnection }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}
