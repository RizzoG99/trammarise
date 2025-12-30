import { useState, useEffect, useCallback } from 'react';
import { loadSession, saveSession, deleteSession } from '../utils/session-manager';
import type { SessionData } from '../types/routing';

/**
 * Hook for managing session storage
 * Provides type-safe access to session data with auto-sync
 */
export function useSessionStorage(sessionId: string | null) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount or when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    const loadedSession = loadSession(sessionId);
    setSession(loadedSession);
    setIsLoading(false);
  }, [sessionId]);

  // Update session data
  const updateSession = useCallback(
    (data: Partial<SessionData>) => {
      if (!sessionId) return;

      saveSession(sessionId, data);
      const updatedSession = loadSession(sessionId);
      setSession(updatedSession);
    },
    [sessionId]
  );

  // Clear session
  const clearSession = useCallback(() => {
    if (!sessionId) return;

    deleteSession(sessionId);
    setSession(null);
  }, [sessionId]);

  return {
    session,
    isLoading,
    updateSession,
    clearSession,
  };
}
