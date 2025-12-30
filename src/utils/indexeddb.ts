/**
 * IndexedDB abstraction layer for persistent audio file storage
 *
 * This module provides a clean API for storing and retrieving audio files
 * and context files using browser IndexedDB. Files are stored with automatic
 * 24-hour expiration.
 */

import type { AudioFileRecord, ContextFilesRecord } from './indexeddb-types';
import { IndexedDBError } from './indexeddb-types';

// Database configuration
const DB_NAME = 'trammarise-db';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio-files';
const CONTEXT_STORE = 'context-files';
const MAX_FILE_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Singleton database instance
let dbInstance: IDBDatabase | null = null;

/**
 * Check if IndexedDB is available in the current environment
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Initialize the IndexedDB database
 * Creates object stores if they don't exist
 * Returns a singleton instance
 */
export async function initDatabase(): Promise<IDBDatabase> {
  // Return existing instance if available
  if (dbInstance) return dbInstance;

  if (!isIndexedDBAvailable()) {
    throw new IndexedDBError(
      'IndexedDB is not available in this browser',
      'initDatabase'
    );
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new IndexedDBError(
        'Failed to open database',
        'initDatabase',
        request.error || undefined
      ));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create audio-files store if it doesn't exist
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        const audioStore = db.createObjectStore(AUDIO_STORE, {
          keyPath: 'sessionId',
        });
        audioStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }

      // Create context-files store if it doesn't exist
      if (!db.objectStoreNames.contains(CONTEXT_STORE)) {
        const contextStore = db.createObjectStore(CONTEXT_STORE, {
          keyPath: 'sessionId',
        });
        contextStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

/**
 * Save an audio file to IndexedDB
 */
export async function saveAudioFile(
  sessionId: string,
  audioBlob: Blob,
  audioName: string
): Promise<void> {
  try {
    const db = await initDatabase();
    const now = Date.now();

    const record: AudioFileRecord = {
      sessionId,
      audioBlob,
      audioName,
      createdAt: now,
      expiresAt: now + MAX_FILE_AGE_MS,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(new IndexedDBError(
          `Failed to save audio file for session ${sessionId}`,
          'saveAudioFile',
          request.error || undefined
        ));
      };
    });
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}

/**
 * Load an audio file from IndexedDB
 * Returns null if not found or expired
 */
export async function loadAudioFile(
  sessionId: string
): Promise<AudioFileRecord | null> {
  try {
    const db = await initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.get(sessionId);

      request.onsuccess = () => {
        const record = request.result as AudioFileRecord | undefined;

        // Check if record exists and is not expired
        if (record && Date.now() > record.expiresAt) {
          // Delete expired file
          deleteAudioFile(sessionId).catch(console.error);
          resolve(null);
        } else {
          resolve(record || null);
        }
      };

      request.onerror = () => {
        reject(new IndexedDBError(
          `Failed to load audio file for session ${sessionId}`,
          'loadAudioFile',
          request.error || undefined
        ));
      };
    });
  } catch (error) {
    console.error('Error loading audio file:', error);
    return null;
  }
}

/**
 * Delete an audio file from IndexedDB
 */
export async function deleteAudioFile(sessionId: string): Promise<void> {
  try {
    const db = await initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.delete(sessionId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(new IndexedDBError(
          `Failed to delete audio file for session ${sessionId}`,
          'deleteAudioFile',
          request.error || undefined
        ));
      };
    });
  } catch (error) {
    console.error('Error deleting audio file:', error);
    // Don't throw - deletion failures shouldn't block other operations
  }
}

/**
 * Save context files to IndexedDB
 */
export async function saveContextFiles(
  sessionId: string,
  files: File[]
): Promise<void> {
  try {
    const db = await initDatabase();
    const now = Date.now();

    const record: ContextFilesRecord = {
      sessionId,
      files,
      createdAt: now,
      expiresAt: now + MAX_FILE_AGE_MS,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONTEXT_STORE], 'readwrite');
      const store = transaction.objectStore(CONTEXT_STORE);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(new IndexedDBError(
          `Failed to save context files for session ${sessionId}`,
          'saveContextFiles',
          request.error || undefined
        ));
      };
    });
  } catch (error) {
    console.error('Error saving context files:', error);
    throw error;
  }
}

/**
 * Load context files from IndexedDB
 * Returns empty array if not found or expired
 */
export async function loadContextFiles(sessionId: string): Promise<File[]> {
  try {
    const db = await initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONTEXT_STORE], 'readonly');
      const store = transaction.objectStore(CONTEXT_STORE);
      const request = store.get(sessionId);

      request.onsuccess = () => {
        const record = request.result as ContextFilesRecord | undefined;

        // Check if record exists and is not expired
        if (record && Date.now() > record.expiresAt) {
          // Delete expired files
          deleteContextFiles(sessionId).catch(console.error);
          resolve([]);
        } else {
          resolve(record?.files || []);
        }
      };

      request.onerror = () => {
        reject(new IndexedDBError(
          `Failed to load context files for session ${sessionId}`,
          'loadContextFiles',
          request.error || undefined
        ));
      };
    });
  } catch (error) {
    console.error('Error loading context files:', error);
    return [];
  }
}

/**
 * Delete context files from IndexedDB
 */
export async function deleteContextFiles(sessionId: string): Promise<void> {
  try {
    const db = await initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONTEXT_STORE], 'readwrite');
      const store = transaction.objectStore(CONTEXT_STORE);
      const request = store.delete(sessionId);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(new IndexedDBError(
          `Failed to delete context files for session ${sessionId}`,
          'deleteContextFiles',
          request.error || undefined
        ));
      };
    });
  } catch (error) {
    console.error('Error deleting context files:', error);
    // Don't throw - deletion failures shouldn't block other operations
  }
}

/**
 * Clean up all expired files from the database
 * Returns the number of deleted records
 */
export async function cleanupExpiredFiles(): Promise<number> {
  try {
    const db = await initDatabase();
    const now = Date.now();
    let deletedCount = 0;

    // Cleanup audio files
    await new Promise<void>((resolve) => {
      const audioTx = db.transaction([AUDIO_STORE], 'readwrite');
      const audioStore = audioTx.objectStore(AUDIO_STORE);
      const audioIndex = audioStore.index('expiresAt');
      const audioRange = IDBKeyRange.upperBound(now);
      const audioCursor = audioIndex.openCursor(audioRange);

      audioCursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve();
        }
      };

      audioCursor.onerror = () => resolve();
    });

    // Cleanup context files
    await new Promise<void>((resolve) => {
      const contextTx = db.transaction([CONTEXT_STORE], 'readwrite');
      const contextStore = contextTx.objectStore(CONTEXT_STORE);
      const contextIndex = contextStore.index('expiresAt');
      const contextRange = IDBKeyRange.upperBound(now);
      const contextCursor = contextIndex.openCursor(contextRange);

      contextCursor.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve();
        }
      };

      contextCursor.onerror = () => resolve();
    });

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired files:', error);
    return 0;
  }
}

/**
 * Delete all files from the database
 */
export async function deleteAllFiles(): Promise<void> {
  try {
    const db = await initDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE, CONTEXT_STORE], 'readwrite');

      // Clear audio files
      const audioStore = transaction.objectStore(AUDIO_STORE);
      audioStore.clear();

      // Clear context files
      const contextStore = transaction.objectStore(CONTEXT_STORE);
      contextStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error deleting all files:', error);
  }
}

/**
 * Check if the database is healthy and accessible
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const db = await initDatabase();

    // Try to open a transaction as a health check
    const tx = db.transaction([AUDIO_STORE], 'readonly');
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });

    return true;
  } catch {
    return false;
  }
}
