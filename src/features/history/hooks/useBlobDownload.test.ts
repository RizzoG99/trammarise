import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBlobDownload } from './useBlobDownload';
import * as indexeddb from '@/utils/indexeddb';

// Mock IndexedDB utilities
vi.mock('@/utils/indexeddb', () => ({
  loadAudioFile: vi.fn(),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
globalThis.URL.revokeObjectURL = vi.fn();

describe('useBlobDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document.body
    document.body.innerHTML = '';
  });

  it('should successfully download a file', async () => {
    const mockBlob = new Blob(['test audio data'], { type: 'audio/wav' });
    const mockAudioRecord = {
      sessionId: 'test-session',
      audioBlob: mockBlob,
      audioName: 'test.wav',
      createdAt: Date.now(),
    };

    vi.mocked(indexeddb.loadAudioFile).mockResolvedValue(mockAudioRecord);

    const { result } = renderHook(() => useBlobDownload());

    expect(result.current.isDownloading).toBe(false);
    expect(result.current.progress).toBe(0);

    await act(async () => {
      await result.current.download('test-session', 'test.wav');
    });

    // Wait for cleanup to happen (setTimeout in hook is 100ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    await waitFor(() => {
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.progress).toBe(100);
    });

    expect(indexeddb.loadAudioFile).toHaveBeenCalledWith('test-session');
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should handle file not found error', async () => {
    vi.mocked(indexeddb.loadAudioFile).mockResolvedValue(null);

    const onError = vi.fn();
    const { result } = renderHook(() => useBlobDownload({ onError }));

    await act(async () => {
      try {
        await result.current.download('nonexistent-session', 'test.wav');
      } catch {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Audio file not found');
    });

    expect(onError).toHaveBeenCalled();
  });

  it('should handle download errors', async () => {
    const mockError = new Error('IndexedDB error');
    vi.mocked(indexeddb.loadAudioFile).mockRejectedValue(mockError);

    const onError = vi.fn();
    const { result } = renderHook(() => useBlobDownload({ onError }));

    await act(async () => {
      try {
        await result.current.download('test-session', 'test.wav');
      } catch {
        // Expected error
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.isDownloading).toBe(false);
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should track progress correctly', async () => {
    const mockBlob = new Blob(['test'], { type: 'audio/wav' });
    const mockAudioRecord = {
      sessionId: 'test-session',
      audioBlob: mockBlob,
      audioName: 'test.wav',
      createdAt: Date.now(),
    };

    vi.mocked(indexeddb.loadAudioFile).mockResolvedValue(mockAudioRecord);

    const onProgress = vi.fn();
    const { result } = renderHook(() => useBlobDownload({ onProgress }));

    await act(async () => {
      await result.current.download('test-session', 'test.wav');
    });

    await waitFor(() => {
      expect(result.current.progress).toBe(100);
    });

    expect(onProgress).toHaveBeenCalledWith(100);
  });
});
