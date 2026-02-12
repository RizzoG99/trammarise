import { useState, useCallback } from 'react';
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
import { useSubscription } from '@/context/SubscriptionContext';

interface UseHistorySessionsReturn {
  sessions: HistorySession[];
  isLoading: boolean;
  error: string | null;
  deleteSession: (sessionId: string) => Promise<void>;
  reload: () => Promise<void>;
  totalCount: number;
}

// Helper to load sessions from local storage
async function loadSessionsFromLocal(): Promise<HistorySession[]> {
  const ids = getAllSessionIds();
  const rawSessions = await Promise.all(ids.map((id) => loadSessionMetadata(id)));

  return rawSessions
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .map((s) => ({
      sessionId: s.sessionId,
      audioName: s.audioName || 'Untitled Audio',
      contentType: s.contentType,
      language: s.language as LanguageCode,
      hasTranscript: !!s.result?.transcript,
      hasSummary: !!s.result?.summary,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      fileSizeBytes: s.fileSizeBytes,
    }));
}

// ... existing code ...

export function useHistorySessions(): UseHistorySessionsReturn {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const { subscription } = useSubscription();
  const userTier = subscription?.tier || 'free';

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let loadedSessions: HistorySession[] = [];

      // ... (fetching logic remains same) ...
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
          loadedSessions = apiSessions;
        } catch (apiError) {
          // Fall back to localStorage if API fails
          console.warn('API fetch failed, falling back to localStorage:', apiError);
          loadedSessions = await loadSessionsFromLocal();
        }
      } else {
        // Not authenticated, use localStorage
        loadedSessions = await loadSessionsFromLocal();
      }

      setTotalCount(loadedSessions.length);

      // Apply Tier Limits (Free: Max 5 items)
      if (userTier === 'free') {
        // Enforce 5 item limit for Free tier
        const limitedSessions = loadedSessions.slice(0, 5);
        setSessions(limitedSessions);
      } else {
        setSessions(loadedSessions);
      }
    } catch (err) {
      setError('Failed to load sessions');
      console.error('Error loading sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, userTier]);

  // ... (deleteSession logic) ...
  const deleteSession = useCallback(
    async (sessionId: string) => {
      // Optimistic update
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setError(null);

      try {
        await deleteSessionFromStorage(sessionId);
      } catch (err) {
        // Revert on error
        await loadSessions();
        setError('Failed to delete session');
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
    totalCount,
  };
}
