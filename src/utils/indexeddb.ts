/**
 * IndexedDB abstraction layer for persistent audio file storage
 *
 * This module provides a clean API for storing and retrieving audio files
 * and context files using browser IndexedDB.
 */

import type { AudioFileRecord, ContextFilesRecord } from './indexeddb-types';
import { IndexedDBError } from './indexeddb-types';

// Database configuration
const DB_NAME = 'trammarise-db';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio-files';
const CONTEXT_STORE = 'context-files';

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
    throw new IndexedDBError('IndexedDB is not available in this browser', 'initDatabase');
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(
        new IndexedDBError('Failed to open database', 'initDatabase', request.error || undefined)
      );
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
        audioStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create context-files store if it doesn't exist
      if (!db.objectStoreNames.contains(CONTEXT_STORE)) {
        const contextStore = db.createObjectStore(CONTEXT_STORE, {
          keyPath: 'sessionId',
        });
        contextStore.createIndex('createdAt', 'createdAt', { unique: false });
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
      // Removed expiresAt
    } as AudioFileRecord;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(
          new IndexedDBError(
            `Failed to save audio file for session ${sessionId}`,
            'saveAudioFile',
            request.error || undefined
          )
        );
      };
    });
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}

/**
 * Load an audio file from IndexedDB
 * Returns null if not found
 */
export async function loadAudioFile(sessionId: string): Promise<AudioFileRecord | null> {
  try {
    const db = await initDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.get(sessionId);

      request.onsuccess = () => {
        const record = request.result as AudioFileRecord | undefined;
        resolve(record || null);
      };

      request.onerror = () => {
        reject(
          new IndexedDBError(
            `Failed to load audio file for session ${sessionId}`,
            'loadAudioFile',
            request.error || undefined
          )
        );
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
        reject(
          new IndexedDBError(
            `Failed to delete audio file for session ${sessionId}`,
            'deleteAudioFile',
            request.error || undefined
          )
        );
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
export async function saveContextFiles(sessionId: string, files: File[]): Promise<void> {
  try {
    const db = await initDatabase();
    const now = Date.now();

    const record: ContextFilesRecord = {
      sessionId,
      files,
      createdAt: now,
      // Removed expiresAt
    } as ContextFilesRecord;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONTEXT_STORE], 'readwrite');
      const store = transaction.objectStore(CONTEXT_STORE);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(
          new IndexedDBError(
            `Failed to save context files for session ${sessionId}`,
            'saveContextFiles',
            request.error || undefined
          )
        );
      };
    });
  } catch (error) {
    console.error('Error saving context files:', error);
    throw error;
  }
}

/**
 * Load context files from IndexedDB
 * Returns empty array if not found
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
        resolve(record?.files || []);
      };

      request.onerror = () => {
        reject(
          new IndexedDBError(
            `Failed to load context files for session ${sessionId}`,
            'loadContextFiles',
            request.error || undefined
          )
        );
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
        reject(
          new IndexedDBError(
            `Failed to delete context files for session ${sessionId}`,
            'deleteContextFiles',
            request.error || undefined
          )
        );
      };
    });
  } catch (error) {
    console.error('Error deleting context files:', error);
  }
}

/**
 * Update logic: cleanupExpiredFiles is now a no-op regarding expiration
 * It returns 0 as nothing is "expired" by time anymore.
 */
export async function cleanupExpiredFiles(): Promise<number> {
  // No-op: files persist indefinitely until manually deleted
  return 0;
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
