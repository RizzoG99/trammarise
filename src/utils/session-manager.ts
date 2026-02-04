import type { SessionData } from '../types/routing';
import {
  saveAudioFile,
  loadAudioFile,
  deleteAudioFile,
  saveContextFiles,
  loadContextFiles,
  deleteContextFiles,
  cleanupExpiredFiles,
  deleteAllFiles,
} from './indexeddb';

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
    };

    localStorage.setItem(getSessionKey(sessionId), JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to save session:', error);
    throw new Error('Failed to save session data');
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
 * Delete a session from localStorage and IndexedDB
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    localStorage.removeItem(getSessionKey(sessionId));
    await Promise.all([deleteAudioFile(sessionId), deleteContextFiles(sessionId)]);
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
 * Cleanup old sessions (only effectively cleans up orphan files now)
 */
export async function cleanupOldSessions(): Promise<void> {
  // No expiration logic for sessions anymore
  // But we still run file cleanup for any orphaned files
  await cleanupExpiredFiles();
}

/**
 * Clear all sessions (useful for testing/reset)
 */
export async function clearAllSessions(): Promise<void> {
  const sessionIds = getAllSessionIds();
  await Promise.all(sessionIds.map(deleteSession));
  await deleteAllFiles();
}
