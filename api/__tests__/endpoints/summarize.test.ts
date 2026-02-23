import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../../summarize';
import { AIProviderFactory } from '../../providers/ai-factory';
import { extractPdfText } from '../../utils/pdf-extractor';

interface BusboyMock {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  triggerField: (name: string, value: string) => void;
  triggerFile: (name: string, file: unknown, info: unknown) => void;
  triggerFinish: () => void;
}

// Mock dependencies
vi.mock('busboy', () => {
  return {
    default: () => {
      const listeners: Record<string, (...args: unknown[]) => void> = {};
      const mock: BusboyMock = {
        on: (event: string, callback: (...args: unknown[]) => void) => {
          listeners[event] = callback;
        },
        // Helper to trigger events for testing
        triggerField: (name: string, value: string) => {
          if (listeners['field']) listeners['field'](name, value);
        },
        triggerFile: (name: string, file: unknown, info: unknown) => {
          if (listeners['file']) listeners['file'](name, file, info);
        },
        triggerFinish: () => {
          if (listeners['finish']) listeners['finish']();
        },
      };
      return mock;
    },
  };
});

// Mock authentication and dependencies
vi.mock('../../middleware/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: 'test-user-123', clerkId: 'clerk_123' }),
  AuthError: class AuthError extends Error {
    constructor(
      message: string,
      public statusCode: number
    ) {
      super(message);
      this.name = 'AuthError';
    }
  },
}));

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { tier: 'pro' },
        error: null,
      }),
    }),
    rpc: vi.fn().mockResolvedValue({ error: null }),
  },
}));

vi.mock('../../middleware/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue(undefined),
  RateLimitError: class RateLimitError extends Error {
    constructor(
      message: string,
      public retryAfter: number
    ) {
      super(message);
      this.name = 'RateLimitError';
    }
  },
  RATE_LIMITS: {
    SUMMARIZE: { maxRequests: 100, windowMs: 60000 },
  },
}));

vi.mock('../../middleware/usage-tracking', () => ({
  checkQuota: vi.fn().mockResolvedValue({ allowed: true }),
  trackUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../utils/file-validator', () => ({
  validatePdfFile: vi.fn().mockReturnValue({ valid: true }),
}));

vi.mock('../../providers/ai-factory');
vi.mock('../../utils/pdf-extractor');

describe('Summarize API Endpoint', () => {
  let req: { method: string; headers: Record<string, string>; pipe: ReturnType<typeof vi.fn> };
  let res: { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  let mockProvider: { summarize: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=---boundary' },
      pipe: vi.fn(),
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Mock AI provider
    mockProvider = {
      summarize: vi.fn().mockResolvedValue('Mock Summary'),
    };
    vi.mocked(AIProviderFactory.getProvider).mockReturnValue(
      mockProvider as unknown as ReturnType<typeof AIProviderFactory.getProvider>
    );
  });

  it('should process context files (PDF) and pass extracted text to provider', async () => {
    // Mock PDF extraction
    vi.mocked(extractPdfText).mockResolvedValue('Extracted PDF Content');

    // We need to capture the busboy instance created inside the handler
    // Since we mocked busboy default export, we can't easily capture the *internal* instance
    // without more complex mocking, but our mock implementation allows interaction if we control the mock.
    // However, the handler instantiates busboy.

    // Better approach: Since we mocked the module, we can control what the factory returns.
    // But the handler calls the factory.

    // Let's rely on the mock implementation we defined above.
    // We need a way to drive the event loop of the busboy mock *after* the handler has started.
    // But the handler awaits the parsePromise.

    // We need to simulate the stream piping.
    // The handler does: req.pipe(bb);

    // We can intercept req.pipe to trigger the busboy events.
    req.pipe.mockImplementation((bb: BusboyMock) => {
      // Simulate field parsing
      bb.triggerField('transcript', 'Test transcript');
      bb.triggerField('contentType', 'meeting');
      bb.triggerField('provider', 'openai');
      bb.triggerField('apiKey', 'sk-test-key-123456');

      // Simulate file parsing
      const mockFileStream = {
        on: (event: string, cb: (...args: unknown[]) => void) => {
          if (event === 'data') cb(Buffer.from('Fake PDF Data'));
          if (event === 'end') cb();
        },
      };

      bb.triggerFile('contextFiles', mockFileStream, {
        filename: 'test.pdf',
        mimeType: 'application/pdf',
      });

      // We need to wait a tick for file processing promises to potentially start/finish
      // But verify 'extractPdfText' won't be called until 'end' of file stream

      // Finish parsing
      setTimeout(() => {
        bb.triggerFinish();
      }, 10);

      return req;
    });

    await handler(req, res);

    expect(extractPdfText).toHaveBeenCalled();
    expect(mockProvider.summarize).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          text: expect.stringMatching(/\[Document Context: test\.pdf\]\s*Extracted PDF Content/),
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ summary: 'Mock Summary' });
  });

  it('should process text context files and pass content to provider', async () => {
    req.pipe.mockImplementation((bb: BusboyMock) => {
      // Simulate field parsing
      bb.triggerField('transcript', 'Test transcript');
      bb.triggerField('contentType', 'meeting');
      bb.triggerField('provider', 'openai');
      bb.triggerField('apiKey', 'sk-test-key-123456');

      // Simulate file parsing (Text file)
      const mockFileStream = {
        on: (event: string, cb: (...args: unknown[]) => void) => {
          if (event === 'data') cb(Buffer.from('Text file content'));
          if (event === 'end') cb();
        },
      };

      bb.triggerFile('contextFiles', mockFileStream, {
        filename: 'notes.txt',
        mimeType: 'text/plain',
      });

      setTimeout(() => {
        bb.triggerFinish();
      }, 10);

      return req;
    });

    await handler(req, res);

    expect(mockProvider.summarize).toHaveBeenCalledWith(
      expect.objectContaining({
        context: expect.objectContaining({
          text: expect.stringMatching(/\[Document Context: notes\.txt\]\s*Text file content/),
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should gracefully handle PDF extraction errors', async () => {
    vi.mocked(extractPdfText).mockRejectedValue(new Error('PDF Parse Failed'));

    req.pipe.mockImplementation((bb: BusboyMock) => {
      bb.triggerField('transcript', 'Test transcript');
      bb.triggerField('contentType', 'meeting');
      bb.triggerField('provider', 'openai');
      bb.triggerField('apiKey', 'sk-test-key-123456');

      const mockFileStream = {
        on: (event: string, cb: (...args: unknown[]) => void) => {
          if (event === 'data') cb(Buffer.from('Bad PDF'));
          if (event === 'end') cb();
        },
      };

      bb.triggerFile('contextFiles', mockFileStream, {
        filename: 'bad.pdf',
        mimeType: 'application/pdf',
      });

      setTimeout(() => {
        bb.triggerFinish();
      }, 10);
      return req;
    });

    await handler(req, res);

    // Should still succeed with summarization, just missing that context or having error log
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockProvider.summarize).toHaveBeenCalled();
  });
});
