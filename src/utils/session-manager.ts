import type { SessionData } from '../types/routing';

const SESSION_KEY_PREFIX = 'trammarise_session_';
const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

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
 */
export function saveSession(sessionId: string, data: Partial<SessionData>): void {
  try {
    const existingData = loadSession(sessionId);
    const sessionData: SessionData = {
      ...existingData,
      ...data,
      sessionId,
      updatedAt: Date.now(),
      createdAt: existingData?.createdAt || Date.now(),
    } as SessionData;

    sessionStorage.setItem(getSessionKey(sessionId), JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Load session data from sessionStorage
 */
export function loadSession(sessionId: string): SessionData | null {
  try {
    const data = sessionStorage.getItem(getSessionKey(sessionId));
    if (!data) return null;

    const session: SessionData = JSON.parse(data);

    // Check if session has expired
    if (Date.now() - session.createdAt > MAX_SESSION_AGE_MS) {
      deleteSession(sessionId);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
}

/**
 * Delete a session from sessionStorage
 */
export function deleteSession(sessionId: string): void {
  try {
    sessionStorage.removeItem(getSessionKey(sessionId));
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
}
