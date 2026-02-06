import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SessionRepository } from '../SessionRepository';
import type { CreateSessionDTO, UpdateSessionDTO, Session } from '../SessionRepository';

describe('SessionRepository', () => {
  let repository: SessionRepository;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repository = new SessionRepository();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('should create session via API', async () => {
      // Arrange
      const createData: CreateSessionDTO = {
        sessionId: 'test-session-123',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 1024000,
        language: 'en',
        contentType: 'meeting',
      };

      const mockResponse: Session = {
        id: 'uuid-123',
        userId: 'user-uuid',
        sessionId: 'test-session-123',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 1024000,
        audioUrl: null,
        durationSeconds: null,
        language: 'en',
        contentType: 'meeting',
        processingMode: null,
        noiseProfile: null,
        selectionMode: null,
        regionStart: null,
        regionEnd: null,
        transcript: null,
        summary: null,
        chatHistory: [],
        aiConfig: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });
    });

    it('should throw error on failed creation', async () => {
      // Arrange
      const createData: CreateSessionDTO = {
        sessionId: 'test-session-123',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 1024000,
        language: 'en',
        contentType: 'meeting',
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Database error' }),
      });

      // Act & Assert
      await expect(repository.create(createData)).rejects.toThrow('Failed to create session');
    });
  });

  describe('get', () => {
    it('should fetch session by sessionId', async () => {
      // Arrange
      const sessionId = 'test-session-123';
      const mockResponse: Session = {
        id: 'uuid-123',
        userId: 'user-uuid',
        sessionId: 'test-session-123',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 1024000,
        audioUrl: 'https://example.com/audio.mp3',
        durationSeconds: 60,
        language: 'en',
        contentType: 'meeting',
        processingMode: 'standard',
        noiseProfile: null,
        selectionMode: 'full',
        regionStart: null,
        regionEnd: null,
        transcript: 'Test transcript',
        summary: 'Test summary',
        chatHistory: [],
        aiConfig: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        deletedAt: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await repository.get(sessionId);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(`/api/sessions/${sessionId}`, {
        method: 'GET',
      });
    });

    it('should return null when session not found', async () => {
      // Arrange
      const sessionId = 'non-existent';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Act
      const result = await repository.get(sessionId);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error on server error', async () => {
      // Arrange
      const sessionId = 'test-session-123';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(repository.get(sessionId)).rejects.toThrow('Failed to fetch session');
    });
  });

  describe('update', () => {
    it('should update session via API', async () => {
      // Arrange
      const sessionId = 'test-session-123';
      const updateData: UpdateSessionDTO = {
        transcript: 'Updated transcript',
        summary: 'Updated summary',
      };

      const mockResponse: Session = {
        id: 'uuid-123',
        userId: 'user-uuid',
        sessionId: 'test-session-123',
        audioName: 'test-audio.mp3',
        fileSizeBytes: 1024000,
        audioUrl: 'https://example.com/audio.mp3',
        durationSeconds: 60,
        language: 'en',
        contentType: 'meeting',
        processingMode: 'standard',
        noiseProfile: null,
        selectionMode: 'full',
        regionStart: null,
        regionEnd: null,
        transcript: 'Updated transcript',
        summary: 'Updated summary',
        chatHistory: [],
        aiConfig: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:01:00Z',
        deletedAt: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const result = await repository.update(sessionId, updateData);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    });

    it('should throw error on failed update', async () => {
      // Arrange
      const sessionId = 'test-session-123';
      const updateData: UpdateSessionDTO = { transcript: 'Updated' };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(repository.update(sessionId, updateData)).rejects.toThrow(
        'Failed to update session'
      );
    });
  });

  describe('delete', () => {
    it('should soft delete session via API', async () => {
      // Arrange
      const sessionId = 'test-session-123';

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Act
      await repository.delete(sessionId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
    });

    it('should throw error on failed deletion', async () => {
      // Arrange
      const sessionId = 'test-session-123';

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(repository.delete(sessionId)).rejects.toThrow('Failed to delete session');
    });
  });

  describe('list', () => {
    it('should fetch list of sessions with default pagination', async () => {
      // Arrange
      const mockSessions: Session[] = [
        {
          id: 'uuid-1',
          userId: 'user-uuid',
          sessionId: 'session-1',
          audioName: 'audio1.mp3',
          fileSizeBytes: 1024000,
          audioUrl: null,
          durationSeconds: null,
          language: 'en',
          contentType: 'meeting',
          processingMode: null,
          noiseProfile: null,
          selectionMode: null,
          regionStart: null,
          regionEnd: null,
          transcript: null,
          summary: null,
          chatHistory: [],
          aiConfig: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          deletedAt: null,
        },
        {
          id: 'uuid-2',
          userId: 'user-uuid',
          sessionId: 'session-2',
          audioName: 'audio2.mp3',
          fileSizeBytes: 2048000,
          audioUrl: null,
          durationSeconds: null,
          language: 'it',
          contentType: 'lecture',
          processingMode: null,
          noiseProfile: null,
          selectionMode: null,
          regionStart: null,
          regionEnd: null,
          transcript: null,
          summary: null,
          chatHistory: [],
          aiConfig: null,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
          deletedAt: null,
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ sessions: mockSessions, total: 2 }),
      });

      // Act
      const result = await repository.list();

      // Assert
      expect(result.sessions).toEqual(mockSessions);
      expect(result.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith('/api/sessions/list?limit=50&offset=0', {
        method: 'GET',
      });
    });

    it('should fetch list with custom pagination', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ sessions: [], total: 0 }),
      });

      // Act
      await repository.list(10, 20);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/sessions/list?limit=10&offset=20', {
        method: 'GET',
      });
    });

    it('should throw error on failed list fetch', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(repository.list()).rejects.toThrow('Failed to fetch sessions');
    });
  });
});
