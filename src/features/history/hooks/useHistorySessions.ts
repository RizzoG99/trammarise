import { useState, useEffect, useCallback } from 'react';
import type { HistorySession } from '../types/history';
import type { ContentType } from '@/types/content-types';
import {
  getAllSessionIds,
  loadSession,
  deleteSession as deleteSessionFromStorage,
} from '@/utils/session-manager';
import { loadAudioFile } from '@/utils/indexeddb';

interface UseHistorySessionsReturn {
  sessions: HistorySession[];
  isLoading: boolean;
  error: string | null;
  deleteSession: (sessionId: string) => Promise<void>;
  reload: () => Promise<void>;
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

      const loadedSessions: HistorySession[] = [];

      for (const sessionId of sessionIds) {
        try {
          const sessionData = await loadSession(sessionId);

          if (!sessionData) {
            continue; // Skip missing sessions
          }

          // Load file size from IndexedDB (but not the full blob)
          let fileSizeBytes: number | undefined;
          try {
            const audioFile = await loadAudioFile(sessionId);
            fileSizeBytes = audioFile?.audioBlob.size;
          } catch {
            // Continue without file size if IndexedDB fails
          }

          const historySession: HistorySession = {
            sessionId,
            audioName: sessionData.audioFile.name,
            contentType: (sessionData.configuration?.contentType ||
              sessionData.contentType) as ContentType,
            language: sessionData.configuration?.language || sessionData.language,
            hasTranscript: !!sessionData.result?.transcript,
            hasSummary: !!sessionData.result?.summary,
            createdAt: sessionData.createdAt,
            updatedAt: sessionData.updatedAt,
            fileSizeBytes,
          };

          loadedSessions.push(historySession);
        } catch (err) {
          // Log but continue loading other sessions
          console.warn(`Failed to load session ${sessionId}:`, err);
        }
      }

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

  const deleteSession = useCallback(
    async (sessionId: string) => {
      // Optimistic update: remove immediately
      const previousSessions = sessions;
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      setError(null);

      try {
        await deleteSessionFromStorage(sessionId);
      } catch (err) {
        // Revert on error
        setSessions(previousSessions);
        setError('Failed to delete session');
        console.error('Error deleting session:', err);
      }
    },
    [sessions]
  );

  return {
    sessions,
    isLoading,
    error,
    deleteSession,
    reload: loadSessions,
  };
}
