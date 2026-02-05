import { useState, useEffect, useCallback } from 'react';
import type { HistorySession } from '../types/history';
import type { ContentType } from '@/types/content-types';
import {
  getAllSessionIds,
  loadSessionMetadata,
  deleteSession as deleteSessionFromStorage,
} from '@/utils/session-manager';

interface UseHistorySessionsReturn {
  sessions: HistorySession[];
  isLoading: boolean;
  error: string | null;
  deleteSession: (sessionId: string) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Loads session metadata only (not full audio blobs) for performance
 */
async function loadOneSession(sessionId: string): Promise<HistorySession | null> {
  const sessionData = loadSessionMetadata(sessionId);

  if (!sessionData) {
    return null;
  }

  const fileSizeBytes = sessionData.fileSizeBytes as number | undefined;
  const audioName = sessionData.audioName || 'Unknown';

  return {
    sessionId,
    audioName,
    contentType: (sessionData.configuration?.contentType || sessionData.contentType) as ContentType,
    language: sessionData.configuration?.language || sessionData.language,
    hasTranscript: !!sessionData.result?.transcript,
    hasSummary: !!sessionData.result?.summary,
    createdAt: sessionData.createdAt,
    updatedAt: sessionData.updatedAt,
    fileSizeBytes,
  };
}

/**
 * Hook to manage loading and deleting history sessions
 * Loads metadata only (not full audio blobs) for performance
 */
export function useHistorySessions(): UseHistorySessionsReturn {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionIds = getAllSessionIds();

      const results = await Promise.allSettled(sessionIds.map((id) => loadOneSession(id)));
      const loadedSessions = results
        .filter((r): r is PromiseFulfilledResult<HistorySession | null> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter((s): s is HistorySession => s !== null);

      setSessions(loadedSessions);
    } catch (err) {
      setError('Failed to load sessions');
      console.error('Error loading sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    // Optimistic update: remove immediately and capture the removed session for rollback
    let removedSession: HistorySession | undefined;
    setSessions((prev) => {
      removedSession = prev.find((s) => s.sessionId === sessionId);
      return prev.filter((s) => s.sessionId !== sessionId);
    });
    setError(null);

    try {
      await deleteSessionFromStorage(sessionId);
    } catch (err) {
      // Revert on error: re-add the specific session that failed to delete
      if (removedSession) {
        setSessions((prev) => [...prev, removedSession!].sort((a, b) => b.createdAt - a.createdAt));
      }
      setError('Failed to delete session');
      console.error('Error deleting session:', err);
      throw err;
    }
  }, []);

  return {
    sessions,
    isLoading,
    error,
    deleteSession,
    reload: loadSessions,
  };
}
