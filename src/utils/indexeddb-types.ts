/**
 * TypeScript type definitions for IndexedDB operations
 */

/**
 * Audio file record stored in IndexedDB
 */
export interface AudioFileRecord {
  sessionId: string;
  audioBlob: Blob;
  audioName: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Context files record stored in IndexedDB
 */
export interface ContextFilesRecord {
  sessionId: string;
  files: File[];
  createdAt: number;
  expiresAt: number;
}

/**
 * IndexedDB configuration
 */
export interface IndexedDBConfig {
  dbName: string;
  version: number;
  audioStoreName: string;
  contextStoreName: string;
  maxAgeMs: number;
}

/**
 * Custom error class for IndexedDB operations
 */
export class IndexedDBError extends Error {
  public readonly operation: string;
  public override readonly cause?: Error;

  constructor(
    message: string,
    operation: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'IndexedDBError';
    this.operation = operation;
    this.cause = cause;
  }
}
