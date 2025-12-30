import type { SessionData } from '../types/routing';
import type { AudioFile } from '../types/audio';

const SESSION_KEY_PREFIX = 'trammarise_session_';
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache for Files and Blobs (cannot be serialized to sessionStorage)
const fileCache = new Map<string, { audioFile: AudioFile; contextFiles: File[] }>();

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
 * Save session data to sessionStorage
 * Files and Blobs are stored in-memory cache, metadata in sessionStorage
 */
export function saveSession(sessionId: string, data: Partial<SessionData>): void {
  try {
    const existingData = loadSession(sessionId);
    
    // Extract files to store in memory cache
    const { audioFile, contextFiles, ...serializableData } = data;
    
    // Store files in-memory cache if provided
    if (audioFile || contextFiles) {
      const existingFiles = fileCache.get(sessionId);
      fileCache.set(sessionId, {
        audioFile: audioFile || existingFiles?.audioFile!,
        contextFiles: contextFiles !== undefined ? contextFiles : (existingFiles?.contextFiles || []),
      });
    }
    
    // Merge with existing data (excluding files)
    const sessionData = {
      ...existingData,
      ...serializableData,
      sessionId,
      updatedAt: Date.now(),
      createdAt: existingData?.createdAt || Date.now(),
      // Add placeholder refs for files (actual files in cache)
      hasAudioFile: audioFile !== undefined || existingData?.audioFile !== undefined,
      hasContextFiles: (contextFiles !== undefined ? contextFiles.length > 0 : (existingData?.contextFiles || []).length > 0),
    };

    sessionStorage.setItem(getSessionKey(sessionId), JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Load session data from sessionStorage
 * Restores files from in-memory cache
 */
export function loadSession(sessionId: string): SessionData | null {
  try {
    const data = sessionStorage.getItem(getSessionKey(sessionId));
    if (!data) return null;

    const session = JSON.parse(data);

    // Check if session has expired
    if (Date.now() - session.createdAt > MAX_SESSION_AGE_MS) {
      deleteSession(sessionId);
      return null;
    }

    // Restore files from memory cache
    const cachedFiles = fileCache.get(sessionId);
    if (cachedFiles) {
      session.audioFile = cachedFiles.audioFile;
      session.contextFiles = cachedFiles.contextFiles;
    }

    // Remove internal flags
    delete session.hasAudioFile;
    delete session.hasContextFiles;

    return session as SessionData;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

/**
 * Delete a session from sessionStorage and clear file cache
 */
export function deleteSession(sessionId: string): void {
  try {
    sessionStorage.removeItem(getSessionKey(sessionId));
    fileCache.delete(sessionId);
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
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
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
 * Cleanup old sessions (older than MAX_SESSION_AGE_MS)
 */
export function cleanupOldSessions(): void {
  const sessionIds = getAllSessionIds();
  sessionIds.forEach(sessionId => {
    const session = loadSession(sessionId);
    if (!session) {
      // loadSession already deleted expired session
      return;
    }
  });
}

/**
 * Clear all sessions (useful for testing/reset)
 */
export function clearAllSessions(): void {
  const sessionIds = getAllSessionIds();
  sessionIds.forEach(deleteSession);
  fileCache.clear();
}
