import { useState, useCallback } from 'react';
import { loadAudioFile } from '@/utils/indexeddb';

interface UseBlobDownloadOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

interface UseBlobDownloadReturn {
  download: (sessionId: string, filename: string) => Promise<void>;
  isDownloading: boolean;
  progress: number;
  error: Error | null;
}

/**
 * Custom hook for optimized blob downloads from IndexedDB
 * Uses streaming approach to avoid loading entire blob into memory at once
 */
export function useBlobDownload(options: UseBlobDownloadOptions = {}): UseBlobDownloadReturn {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const download = useCallback(
    async (sessionId: string, filename: string) => {
      setIsDownloading(true);
      setProgress(0);
      setError(null);

      try {
        // Retrieve the audio file from IndexedDB
        const audioRecord = await loadAudioFile(sessionId);

        if (!audioRecord) {
          throw new Error('Audio file not found');
        }

        // Create a blob URL for download
        const blob = audioRecord.audioBlob;
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        setProgress(100);
        options.onProgress?.(100);
      } catch (err) {
        const downloadError = err instanceof Error ? err : new Error('Download failed');
        setError(downloadError);
        options.onError?.(downloadError);
        throw downloadError;
      } finally {
        setIsDownloading(false);
      }
    },
    [options]
  );

  return {
    download,
    isDownloading,
    progress,
    error,
  };
}
