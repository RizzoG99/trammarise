import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionRepository } from '../SessionRepository';
import type { CreateSessionDTO, UpdateSessionDTO } from '../SessionRepository';

// ── Supabase mock ────────────────────────────────────────────────────────────

const mockGetSession = vi.fn();
const mockSupabaseFrom = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: { getSession: (...args: unknown[]) => mockGetSession(...args) },
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockSession() {
  mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'user-uuid' } } } });
}

/** DB row shape (snake_case) for a session */
const dbRow = {
  id: 'uuid-123',
  user_id: 'user-uuid',
  session_id: 'test-session-123',
  audio_name: 'test-audio.mp3',
  file_size_bytes: 1024000,
  audio_url: null,
  duration_seconds: null,
  language: 'en',
  content_type: 'meeting',
  processing_mode: null,
  noise_profile: null,
  selection_mode: null,
  region_start: null,
  region_end: null,
  transcript: null,
  summary: null,
  chat_history: [],
  ai_config: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  deleted_at: null,
};

/** Camel-case Session that should come out of fromDbRow() for dbRow above */
const expectedSession = {
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

function makeChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    insert: () => chain,
    upsert: () => chain,
    update: () => chain,
    select: () => chain,
    eq: () => chain,
    is: () => chain,
    order: () => chain,
    range: () => chain,
    single: () => Promise.resolve({ data: dbRow, error: null }),
    maybeSingle: () => Promise.resolve({ data: dbRow, error: null }),
    ...overrides,
  };
  return chain;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SessionRepository', () => {
  let repository: SessionRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SessionRepository();
    mockSession();
  });

  const createData: CreateSessionDTO = {
    sessionId: 'test-session-123',
    audioName: 'test-audio.mp3',
    fileSizeBytes: 1024000,
    language: 'en',
    contentType: 'meeting',
  };

  describe('create', () => {
    it('should create session and return camelCase Session', async () => {
      mockSupabaseFrom.mockReturnValue(makeChain());
      const result = await repository.create(createData);
      expect(result).toEqual(expectedSession);
    });

    it('should throw error when unauthenticated', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } });
      await expect(repository.create(createData)).rejects.toThrow('Not authenticated');
    });

    it('should throw error on DB error', async () => {
      mockSupabaseFrom.mockReturnValue(
        makeChain({ single: () => Promise.resolve({ data: null, error: { message: 'DB error' } }) })
      );
      await expect(repository.create(createData)).rejects.toThrow('Failed to create session');
    });
  });

  describe('upsert', () => {
    it('should upsert session and return camelCase Session', async () => {
      mockSupabaseFrom.mockReturnValue(makeChain());
      const result = await repository.upsert(createData);
      expect(result).toEqual(expectedSession);
    });

    it('should throw error on DB error', async () => {
      mockSupabaseFrom.mockReturnValue(
        makeChain({ single: () => Promise.resolve({ data: null, error: { message: 'DB error' } }) })
      );
      await expect(repository.upsert(createData)).rejects.toThrow('Failed to upsert session');
    });
  });

  describe('get', () => {
    it('should return Session when found', async () => {
      mockSupabaseFrom.mockReturnValue(makeChain());
      const result = await repository.get('test-session-123');
      expect(result).toEqual(expectedSession);
    });

    it('should return null when not found', async () => {
      mockSupabaseFrom.mockReturnValue(
        makeChain({ maybeSingle: () => Promise.resolve({ data: null, error: null }) })
      );
      const result = await repository.get('non-existent');
      expect(result).toBeNull();
    });

    it('should throw error on DB error', async () => {
      mockSupabaseFrom.mockReturnValue(
        makeChain({
          maybeSingle: () => Promise.resolve({ data: null, error: { message: 'DB error' } }),
        })
      );
      await expect(repository.get('test-session-123')).rejects.toThrow('Failed to fetch session');
    });
  });

  describe('update', () => {
    const updateData: UpdateSessionDTO = {
      transcript: 'Updated transcript',
      summary: 'Updated summary',
    };

    it('should update session and return camelCase Session', async () => {
      mockSupabaseFrom.mockReturnValue(makeChain());
      const result = await repository.update('test-session-123', updateData);
      expect(result).toEqual(expectedSession);
    });

    it('should throw error on DB error', async () => {
      mockSupabaseFrom.mockReturnValue(
        makeChain({ single: () => Promise.resolve({ data: null, error: { message: 'DB error' } }) })
      );
      await expect(repository.update('test-session-123', updateData)).rejects.toThrow(
        'Failed to update session'
      );
    });
  });

  describe('delete', () => {
    it('should soft delete session without throwing', async () => {
      const chain = makeChain({ eq: () => Promise.resolve({ error: null }) });
      // update chain returns Promise directly on eq call
      const updateChain: Record<string, unknown> = {
        update: () => chain,
        eq: () => Promise.resolve({ error: null }),
      };
      mockSupabaseFrom.mockReturnValue(updateChain);
      await expect(repository.delete('test-session-123')).resolves.toBeUndefined();
    });

    it('should throw error on DB error', async () => {
      const chain: Record<string, unknown> = {
        update: () => chain,
        eq: () => Promise.resolve({ error: { message: 'DB error' } }),
      };
      mockSupabaseFrom.mockReturnValue(chain);
      await expect(repository.delete('test-session-123')).rejects.toThrow(
        'Failed to delete session'
      );
    });
  });

  describe('list', () => {
    it('should return sessions list with total count', async () => {
      const chain = makeChain({
        range: () =>
          Promise.resolve({
            data: [dbRow],
            error: null,
            count: 1,
          }),
      });
      mockSupabaseFrom.mockReturnValue(chain);
      const result = await repository.list();
      expect(result.sessions).toEqual([expectedSession]);
      expect(result.total).toBe(1);
    });

    it('should return empty list when no sessions', async () => {
      const chain = makeChain({
        range: () => Promise.resolve({ data: [], error: null, count: 0 }),
      });
      mockSupabaseFrom.mockReturnValue(chain);
      const result = await repository.list(10, 20);
      expect(result.sessions).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should throw error on DB error', async () => {
      const chain = makeChain({
        range: () => Promise.resolve({ data: null, error: { message: 'DB error' }, count: null }),
      });
      mockSupabaseFrom.mockReturnValue(chain);
      await expect(repository.list()).rejects.toThrow('Failed to fetch sessions');
    });
  });
});
