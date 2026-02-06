import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { HistorySession } from '../types/history';
import type { ContentType } from '@/types/content-types';
import type { LanguageCode } from '@/types/languages';
import {
  getAllSessionIds,
  loadSessionMetadata,
  deleteSession as deleteSessionFromStorage,
} from '@/utils/session-manager';
import { sessionRepository } from '@/repositories/SessionRepository';

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
 * Load sessions from localStorage
 */
async function loadSessionsFromLocal(): Promise<HistorySession[]> {
  const sessionIds = getAllSessionIds();

  const results = await Promise.allSettled(sessionIds.map((id) => loadOneSession(id)));
  const loadedSessions = results
    .filter((r): r is PromiseFulfilledResult<HistorySession | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((s): s is HistorySession => s !== null);

  return loadedSessions;
}

/**
 * Hook to manage loading and deleting history sessions
 * Loads metadata only (not full audio blobs) for performance
 * Fetches from API when authenticated, localStorage otherwise
 */
export function useHistorySessions(): UseHistorySessionsReturn {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useUser();

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If authenticated, fetch from API
      if (isSignedIn) {
        try {
          const response = await sessionRepository.list();
          const apiSessions: HistorySession[] = response.sessions.map((session) => ({
            sessionId: session.sessionId,
            audioName: session.audioName,
            contentType: session.contentType as ContentType,
            language: session.language as LanguageCode,
            hasTranscript: !!session.transcript,
            hasSummary: !!session.summary,
            createdAt: new Date(session.createdAt).getTime(),
            updatedAt: new Date(session.updatedAt).getTime(),
            fileSizeBytes: session.fileSizeBytes,
          }));
          setSessions(apiSessions);
        } catch (apiError) {
          // Fall back to localStorage if API fails
          console.warn('API fetch failed, falling back to localStorage:', apiError);
          const localSessions = await loadSessionsFromLocal();
          setSessions(localSessions);
        }
      } else {
        // Not authenticated, use localStorage
        const localSessions = await loadSessionsFromLocal();
        setSessions(localSessions);
      }
    } catch (err) {
      setError('Failed to load sessions');
      console.error('Error loading sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      // Optimistic update: remove immediately
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      setError(null);

      try {
        await deleteSessionFromStorage(sessionId);
      } catch (err) {
        // Revert on error: reload sessions from storage to ensure sync
        await loadSessions();
        setError('Failed to delete session');
        console.error('Error deleting session:', err);
        throw err;
      }
    },
    [loadSessions]
  );

  return {
    sessions,
    isLoading,
    error,
    deleteSession,
    reload: loadSessions,
  };
}
