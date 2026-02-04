import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHistorySessions } from './useHistorySessions';
import * as sessionManager from '@/utils/session-manager';
import * as indexedDB from '@/utils/indexeddb';

vi.mock('@/utils/session-manager');
vi.mock('@/utils/indexeddb');

describe('useHistorySessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2026-01-28T12:00:00Z'));
  });

  const mockSessionData = (sessionId: string, createdAt: number) => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    const file = new File([blob], `recording-${sessionId}.webm`, { type: 'audio/webm' });
    return {
      sessionId,
      audioFile: {
        name: `recording-${sessionId}.webm`,
        blob,
        file,
      },
      contextFiles: [],
      language: 'en' as const,
      contentType: 'meeting' as const,
      processingMode: 'balanced' as const,
      configuration: {
        mode: 'simple' as const,
        contentType: 'meeting' as const,
        language: 'en' as const,
        provider: 'openai' as const,
        model: 'gpt-4' as const,
        openaiKey: 'test-key',
      },
      result: {
        transcript: 'Test transcript',
        summary: 'Test summary',
        chatHistory: [],
        configuration: {
          mode: 'simple' as const,
          contentType: 'meeting',
          language: 'en' as const,
          provider: 'openai' as const,
          model: 'gpt-4',
          openaiKey: 'test-key',
        },
      },
      createdAt,
      updatedAt: createdAt,
    };
  };

  it('should load all session IDs on mount', async () => {
    const sessionIds = ['session-1', 'session-2', 'session-3'];
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(sessionIds);
    vi.mocked(sessionManager.loadSession).mockImplementation((id) =>
      Promise.resolve(mockSessionData(id, Date.now()))
    );
    vi.mocked(indexedDB.loadAudioFile).mockResolvedValue({
      sessionId: 'session-1',
      audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      audioName: 'test.webm',
      createdAt: Date.now(),
    });

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(sessionManager.getAllSessionIds).toHaveBeenCalledOnce();
    expect(result.current.sessions).toHaveLength(3);
  });

  it('should extract metadata from sessionStorage', async () => {
    const createdAt = Date.now();
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['session-1']);
    vi.mocked(sessionManager.loadSession).mockResolvedValue(
      mockSessionData('session-1', createdAt)
    );
    vi.mocked(indexedDB.loadAudioFile).mockResolvedValue({
      sessionId: 'session-1',
      audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      audioName: 'test.webm',
      createdAt: Date.now(),
    });

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1);
    });

    const session = result.current.sessions[0];
    expect(session.sessionId).toBe('session-1');
    expect(session.audioName).toBe('recording-session-1.webm');
    expect(session.contentType).toBe('meeting');
    expect(session.language).toBe('en');
    expect(session.hasTranscript).toBe(true);
    expect(session.hasSummary).toBe(true);
    expect(session.createdAt).toBe(createdAt);
  });

  it('should read fileSizeBytes from session metadata', async () => {
    const expectedSize = 12345;
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['session-1']);
    vi.mocked(sessionManager.loadSession).mockResolvedValue({
      ...mockSessionData('session-1', Date.now()),
      fileSizeBytes: expectedSize,
    });

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1);
    });

    expect(result.current.sessions[0].fileSizeBytes).toBe(expectedSize);
  });

  it('should persist older sessions >24h', async () => {
    const now = Date.now();
    const older = now - 1000 * 60 * 60 * 25; // 25 hours ago
    const recent = now - 1000 * 60 * 60; // 1 hour ago

    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['old-session', 'new-session']);
    vi.mocked(sessionManager.loadSession).mockImplementation((id) => {
      const createdAt = id === 'old-session' ? older : recent;
      return Promise.resolve(mockSessionData(id, createdAt));
    });
    vi.mocked(indexedDB.loadAudioFile).mockResolvedValue({
      sessionId: 'test',
      audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      audioName: 'test.webm',
      createdAt: Date.now(),
    });

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should show both sessions
    expect(result.current.sessions).toHaveLength(2);
    expect(result.current.sessions.find((s) => s.sessionId === 'old-session')).toBeDefined();
    expect(result.current.sessions.find((s) => s.sessionId === 'new-session')).toBeDefined();
  });

  it('should handle missing/corrupted session data gracefully', async () => {
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['good', 'bad', 'ugly']);
    vi.mocked(sessionManager.loadSession).mockImplementation((id) => {
      if (id === 'bad') return Promise.resolve(null);
      if (id === 'ugly') return Promise.reject(new Error('Corrupted data'));
      return Promise.resolve(mockSessionData(id, Date.now()));
    });
    vi.mocked(indexedDB.loadAudioFile).mockResolvedValue({
      sessionId: 'test',
      audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      audioName: 'test.webm',
      createdAt: Date.now(),
    });

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only show the good session
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].sessionId).toBe('good');
    expect(result.current.error).toBeNull();
  });

  it('should handle IndexedDB read errors', async () => {
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['session-1']);
    vi.mocked(sessionManager.loadSession).mockResolvedValue(
      mockSessionData('session-1', Date.now())
    );
    vi.mocked(indexedDB.loadAudioFile).mockRejectedValue(new Error('IndexedDB error'));

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should still show session even without file size
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].fileSizeBytes).toBeUndefined();
  });

  it('should optimistically remove session on delete', async () => {
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['session-1', 'session-2']);
    vi.mocked(sessionManager.loadSession).mockImplementation((id) =>
      Promise.resolve(mockSessionData(id, Date.now()))
    );
    vi.mocked(indexedDB.loadAudioFile).mockResolvedValue({
      sessionId: 'test',
      audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      audioName: 'test.webm',
      createdAt: Date.now(),
    });
    vi.mocked(sessionManager.deleteSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(2);
    });

    // Delete a session
    await result.current.deleteSession('session-1');

    // Should be removed immediately (optimistic)
    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1);
    });
    expect(result.current.sessions[0].sessionId).toBe('session-2');
  });

  it('should persist deletion on success', async () => {
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['session-1']);
    vi.mocked(sessionManager.loadSession).mockResolvedValue(
      mockSessionData('session-1', Date.now())
    );
    vi.mocked(indexedDB.loadAudioFile).mockResolvedValue({
      sessionId: 'test',
      audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      audioName: 'test.webm',
      createdAt: Date.now(),
    });
    vi.mocked(sessionManager.deleteSession).mockResolvedValue(undefined);

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1);
    });

    await result.current.deleteSession('session-1');

    expect(sessionManager.deleteSession).toHaveBeenCalledWith('session-1');
    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(0);
    });
  });

  it('should revert UI and show error on delete failure', async () => {
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['session-1']);
    vi.mocked(sessionManager.loadSession).mockResolvedValue(
      mockSessionData('session-1', Date.now())
    );
    vi.mocked(indexedDB.loadAudioFile).mockResolvedValue({
      sessionId: 'test',
      audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      audioName: 'test.webm',
      createdAt: Date.now(),
    });
    vi.mocked(sessionManager.deleteSession).mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useHistorySessions());

    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1);
    });

    // Try to delete — deleteSession re-throws so the caller can surface the error
    await expect(result.current.deleteSession('session-1')).rejects.toThrow('Delete failed');

    // Should revert (session back in list) and show error
    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.error).toBe('Failed to delete session');
    });
  });

  it('should transition loading state correctly', async () => {
    vi.mocked(sessionManager.getAllSessionIds).mockReturnValue(['session-1']);
    vi.mocked(sessionManager.loadSession).mockResolvedValue(
      mockSessionData('session-1', Date.now())
    );
    vi.mocked(indexedDB.loadAudioFile).mockResolvedValue({
      sessionId: 'test',
      audioBlob: new Blob(['test'], { type: 'audio/webm' }),
      audioName: 'test.webm',
      createdAt: Date.now(),
    });

    const { result } = renderHook(() => useHistorySessions());

    // Should start loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.sessions).toHaveLength(0);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sessions).toHaveLength(1);
  });
});
