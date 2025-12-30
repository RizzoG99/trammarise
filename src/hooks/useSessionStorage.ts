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
    let isMounted = true;

    async function load() {
      if (!sessionId) {
        setSession(null);
        setIsLoading(false);
        return;
      }

      try {
        const loadedSession = await loadSession(sessionId);
        if (isMounted) {
          setSession(loadedSession);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  // Update session data
  const updateSession = useCallback(
    async (data: Partial<SessionData>) => {
      if (!sessionId) return;

      try {
        await saveSession(sessionId, data);
        const updatedSession = await loadSession(sessionId);
        setSession(updatedSession);
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    },
    [sessionId]
  );

  // Clear session
  const clearSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await deleteSession(sessionId);
      setSession(null);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, [sessionId]);

  return {
    session,
    isLoading,
    updateSession,
    clearSession,
  };
}
