import type { SessionData } from '../types/routing';
import {
  saveAudioFile,
  loadAudioFile,
  deleteAudioFile,
  saveContextFiles,
  loadContextFiles,
  deleteContextFiles,
  deleteAllFiles,
} from './indexeddb';
import { sessionRepository } from '@/repositories/SessionRepository';
import { uploadAudioFile, deleteAudioFile as deleteStorageAudioFile } from './storage-manager';

const SESSION_KEY_PREFIX = 'trammarise_session_';

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get session storage key for a session ID
 */
function getSessionKey(sessionId: string): string {
  return `${SESSION_KEY_PREFIX}${sessionId}`;
}

/**
 * Save session data to localStorage and IndexedDB
 * Files and Blobs are stored in IndexedDB, metadata in localStorage
 */
export async function saveSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
  try {
    const existingData = await loadSession(sessionId);

    // Extract files to store in IndexedDB
    const { audioFile, contextFiles, ...serializableData } = data;

    // Save files to IndexedDB if provided
    if (audioFile) {
      await saveAudioFile(sessionId, audioFile.blob, audioFile.name);
    }
    if (contextFiles !== undefined) {
      await saveContextFiles(sessionId, contextFiles);
    }

    // Merge with existing data (excluding files)
    const sessionData = {
      ...existingData,
      ...serializableData,
      sessionId,
      updatedAt: Date.now(),
      createdAt: existingData?.createdAt || Date.now(),
      ...(audioFile
        ? {
            fileSizeBytes: audioFile.blob.size,
            audioName: audioFile.name,
          }
        : {}),
    };

    localStorage.setItem(getSessionKey(sessionId), JSON.stringify(sessionData));

    // If authenticated, also save to server
    // This will fail silently if user is not authenticated (API returns 401)
    try {
      let audioUrl: string | undefined;

      // Upload audio file to Supabase Storage if present
      if (audioFile) {
        audioUrl = await uploadAudioFile(sessionId, audioFile.blob, audioFile.name);
      }

      // Check if session exists
      const existingSession = await sessionRepository.get(sessionId);

      if (existingSession) {
        // Update existing session - only send fields that changed
        const updateData: Record<string, unknown> = {};
        if (audioUrl) updateData.audioUrl = audioUrl;
        if (sessionData.processingMode) updateData.processingMode = sessionData.processingMode;
        if (sessionData.noiseProfile) updateData.noiseProfile = sessionData.noiseProfile;
        if (sessionData.selectionMode) updateData.selectionMode = sessionData.selectionMode;
        if (sessionData.regionStart !== undefined) updateData.regionStart = sessionData.regionStart;
        if (sessionData.regionEnd !== undefined) updateData.regionEnd = sessionData.regionEnd;

        // Extract from result if present
        if (sessionData.result) {
          if (sessionData.result.transcript) updateData.transcript = sessionData.result.transcript;
          if (sessionData.result.summary) updateData.summary = sessionData.result.summary;
          if (sessionData.result.chatHistory)
            updateData.chatHistory = sessionData.result.chatHistory;
          if (sessionData.result.configuration)
            updateData.aiConfig = sessionData.result.configuration;
        }

        await sessionRepository.update(sessionId, updateData);
      } else {
        // Create new session - all required fields must be present
        const createData: import('../repositories/SessionRepository').CreateSessionDTO = {
          sessionId,
          audioName: sessionData.audioName || 'unknown.wav',
          fileSizeBytes: sessionData.fileSizeBytes || 0,
          language: sessionData.language || 'en',
          contentType: sessionData.contentType || 'other',
        };

        if (audioUrl) createData.audioUrl = audioUrl;
        if (sessionData.processingMode) createData.processingMode = sessionData.processingMode;
        if (sessionData.noiseProfile) createData.noiseProfile = sessionData.noiseProfile;
        if (sessionData.selectionMode) createData.selectionMode = sessionData.selectionMode;
        if (sessionData.regionStart !== undefined) createData.regionStart = sessionData.regionStart;
        if (sessionData.regionEnd !== undefined) createData.regionEnd = sessionData.regionEnd;

        // Extract from result if present
        if (sessionData.result) {
          if (sessionData.result.transcript) createData.transcript = sessionData.result.transcript;
          if (sessionData.result.summary) createData.summary = sessionData.result.summary;
          if (sessionData.result.chatHistory)
            createData.chatHistory = sessionData.result.chatHistory;
          if (sessionData.result.configuration)
            createData.aiConfig = sessionData.result.configuration;
        }

        await sessionRepository.create(createData);
      }
    } catch (apiError) {
      // Silently fail - user might not be authenticated or API might be unavailable
      // localStorage is the fallback, so we don't throw
      console.debug('Server save skipped (user may not be authenticated):', apiError);
    }
  } catch (error) {
    console.error('Failed to save session:', error);
    throw new Error('Failed to save session data');
  }
}

/**
 * Load session metadata only from localStorage (no IndexedDB access)
 * This is faster for listing sessions as it doesn't load audio blobs
 */
export function loadSessionMetadata(
  sessionId: string
): Omit<SessionData, 'audioFile' | 'contextFiles'> | null {
  try {
    const data = localStorage.getItem(getSessionKey(sessionId));
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load session metadata ${sessionId}:`, error);
    return null;
  }
}

/**
 * Load session data from localStorage and IndexedDB
 * Restores files from IndexedDB
 */
export async function loadSession(sessionId: string): Promise<SessionData | null> {
  try {
    const data = localStorage.getItem(getSessionKey(sessionId));
    if (!data) return null;

    const session = JSON.parse(data);

    // Load files from IndexedDB
    const audioFileRecord = await loadAudioFile(sessionId);
    if (audioFileRecord) {
      session.audioFile = {
        name: audioFileRecord.audioName,
        blob: audioFileRecord.audioBlob,
        file: new File([audioFileRecord.audioBlob], audioFileRecord.audioName, {
          type: audioFileRecord.audioBlob.type,
        }),
      };
    }

    const contextFiles = await loadContextFiles(sessionId);
    if (contextFiles.length > 0) {
      session.contextFiles = contextFiles;
    }

    return session as SessionData;
  } catch (error) {
    console.error(`Failed to load session ${sessionId}:`, {
      error,
      type: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

/**
 * Delete a session from localStorage, IndexedDB, and server
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    // Remove from localStorage and IndexedDB
    localStorage.removeItem(getSessionKey(sessionId));
    await Promise.all([deleteAudioFile(sessionId), deleteContextFiles(sessionId)]);

    // Try to delete from server as well
    // This will fail silently if user is not authenticated
    try {
      await sessionRepository.delete(sessionId);
      // Also try to delete audio file from Supabase Storage
      const metadata = loadSessionMetadata(sessionId);
      if (metadata?.audioName) {
        await deleteStorageAudioFile(sessionId, metadata.audioName);
      }
    } catch (apiError) {
      // Silently fail - user might not be authenticated or API might be unavailable
      console.debug('Server delete skipped (user may not be authenticated):', apiError);
    }
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}

/**
 * Get all session IDs
 */
export function getAllSessionIds(): string[] {
  const sessionIds: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SESSION_KEY_PREFIX)) {
        sessionIds.push(key.replace(SESSION_KEY_PREFIX, ''));
      }
    }
  } catch (error) {
    console.error('Failed to get session IDs:', error);
  }
  return sessionIds;
}

/**
 * Clear all sessions (useful for testing/reset)
 */
export async function clearAllSessions(): Promise<void> {
  const sessionIds = getAllSessionIds();
  await Promise.all(sessionIds.map(deleteSession));
  await deleteAllFiles();
}

/**
 * Check if there is enough storage space
 * Returns true if storage is available, false if quota exceeded
 */
export async function checkStorageQuota(): Promise<{
  quotaExceeded: boolean;
  usageRatio: number; // 0 to 1
}> {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      if (usage !== undefined && quota !== undefined) {
        return {
          quotaExceeded: usage >= quota * 0.9, // Warn at 90%
          usageRatio: usage / quota,
        };
      }
    }
  } catch (error) {
    console.warn('Unable to estimate storage usage:', error);
  }
  return { quotaExceeded: false, usageRatio: 0 };
}

/**
 * Migrate sessions from sessionStorage to localStorage
 * One-time migration for users upgrading from previous version
 */
export function migrateFromSessionStorage(): void {
  try {
    const keysToRemove: string[] = [];

    // Identify sessions in sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(SESSION_KEY_PREFIX)) {
        const data = sessionStorage.getItem(key);
        if (data) {
          // Move to localStorage if not already present
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, data);
            console.log(`Migrated session ${key} to localStorage`);
          }
          keysToRemove.push(key);
        }
      }
    }

    // cleanup migrated sessions
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
/**
 * Cleanup old sessions based on LRU (Least Recently Used) strategy
 * Removes oldest sessions until target count is reached
 * @param targetCount - Maximum number of sessions to keep (default: 10)
 * @returns Number of sessions deleted
 */
export async function cleanupOldSessions(targetCount: number = 10): Promise<number> {
  try {
    const allSessions: Array<{ sessionId: string; updatedAt: number }> = [];

    // Collect all sessions with their update times
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SESSION_KEY_PREFIX)) {
        const sessionId = key.replace(SESSION_KEY_PREFIX, '');
        const metadata = loadSessionMetadata(sessionId);
        if (metadata) {
          allSessions.push({
            sessionId,
            updatedAt: metadata.updatedAt,
          });
        }
      }
    }

    // If we're under the target, no cleanup needed
    if (allSessions.length <= targetCount) {
      return 0;
    }

    // Sort by updatedAt (oldest first)
    allSessions.sort((a, b) => a.updatedAt - b.updatedAt);

    // Calculate how many to delete
    const deleteCount = allSessions.length - targetCount;
    const sessionsToDelete = allSessions.slice(0, deleteCount);

    // Delete the oldest sessions
    for (const { sessionId } of sessionsToDelete) {
      await deleteSession(sessionId);
    }

    return deleteCount;
  } catch (error) {
    console.error('Failed to cleanup old sessions:', error);
    throw new Error('Failed to cleanup sessions');
  }
}
