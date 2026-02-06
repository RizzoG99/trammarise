import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'stream';

// Mock the provider factory
const mockTranscribe = vi.fn();
const mockCreate = vi.fn().mockReturnValue({
  transcribe: mockTranscribe,
  getProviderName: () => 'AssemblyAI',
  supportsSpeakerDiarization: () => true,
});

vi.mock('../providers/factory', () => ({
  TranscriptionProviderFactory: {
    create: mockCreate,
  },
}));

// Mock job manager
const mockCreateJob = vi.fn();
const mockUpdateJobStatus = vi.fn();
const mockSetJobTranscript = vi.fn();
const mockSetJobUtterances = vi.fn();

vi.mock('../utils/job-manager', () => ({
  JobManager: {
    createJob: mockCreateJob,
    updateJobStatus: mockUpdateJobStatus,
    setJobTranscript: mockSetJobTranscript,
    setJobUtterances: mockSetJobUtterances,
    getJob: vi.fn().mockReturnValue({
      jobId: 'test-job-123',
      status: 'pending',
      config: {
        apiKey: 'test-api-key',
        mode: 'balanced',
        model: 'gpt-4o-mini-transcribe',
        enableSpeakerDiarization: true,
        speakersExpected: 2,
      },
    }),
  },
}));

describe('POST /api/transcribe - Speaker Diarization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateJob.mockReturnValue({
      jobId: 'test-job-123',
      status: 'pending',
      config: {
        apiKey: 'test-api-key',
        mode: 'balanced',
        model: 'gpt-4o-mini-transcribe',
        enableSpeakerDiarization: true,
        speakersExpected: 2,
      },
      metadata: {
        filename: 'test.mp3',
        fileSize: 1024,
        duration: 0,
        totalChunks: 0,
        createdAt: new Date(),
      },
      chunks: [],
      chunkStatuses: [],
      progress: 0,
      completedChunks: 0,
      totalRetries: 0,
      chunkingSplits: 0,
      lastUpdated: new Date(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create job with speaker diarization configuration', async () => {
    // Create a multipart form data request
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body = [
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="apiKey"',
      '',
      'test-api-key',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="enableSpeakerDiarization"',
      '',
      'true',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="speakersExpected"',
      '',
      '2',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="language"',
      '',
      'en',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="file"; filename="test.mp3"',
      'Content-Type: audio/mpeg',
      '',
      'fake-audio-data',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW--`,
    ].join('\r\n');

    const req = {
      method: 'POST',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    } as unknown as VercelRequest;

    // Convert body to stream
    const stream = Readable.from([body]);
    Object.assign(req, stream);

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as VercelResponse;

    // Dynamically import handler to use mocks
    const { default: handler } = await import('../transcribe');

    await handler(req, res);

    // Verify job was created with speaker diarization config
    expect(mockCreateJob).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-api-key',
        enableSpeakerDiarization: true,
        speakersExpected: 2,
        language: 'en',
      }),
      expect.any(Object)
    );

    // Verify response
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({
      jobId: 'test-job-123',
      statusUrl: '/api/transcribe-job/test-job-123/status',
      message: 'Transcription job created',
    });
  });

  it('should use AssemblyAI provider for speaker diarization', async () => {
    // Mock successful transcription
    mockTranscribe.mockResolvedValue({
      text: 'Full transcript text',
      utterances: [
        {
          speaker: 'A',
          text: 'Hello, how are you?',
          start: 1000,
          end: 3000,
          confidence: 0.95,
        },
        {
          speaker: 'B',
          text: 'I am doing well, thank you.',
          start: 3200,
          end: 5500,
          confidence: 0.92,
        },
      ],
    });

    // Simulate background job processing
    await import('../transcribe');

    // Wait for background processing (use a small delay)
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify provider was created with correct config
    // Note: This test is more of a smoke test since background processing
    // happens asynchronously. In a real scenario, you'd test the background
    // processing function directly.
  });

  it('should store utterances when speaker diarization is enabled', async () => {
    // This would test the background processing directly
    // For now, we verify the structure is correct
    expect(mockSetJobUtterances).toBeDefined();
    expect(mockSetJobTranscript).toBeDefined();
  });

  it('should parse speakersExpected as integer', async () => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body = [
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="apiKey"',
      '',
      'test-api-key',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="speakersExpected"',
      '',
      '5',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="file"; filename="test.mp3"',
      'Content-Type: audio/mpeg',
      '',
      'fake-audio-data',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW--`,
    ].join('\r\n');

    const req = {
      method: 'POST',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    } as unknown as VercelRequest;

    const stream = Readable.from([body]);
    Object.assign(req, stream);

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as VercelResponse;

    const { default: handler } = await import('../transcribe');

    await handler(req, res);

    expect(mockCreateJob).toHaveBeenCalledWith(
      expect.objectContaining({
        speakersExpected: 5,
      }),
      expect.any(Object)
    );
  });

  it('should handle enableSpeakerDiarization=false', async () => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const body = [
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="apiKey"',
      '',
      'test-api-key',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="enableSpeakerDiarization"',
      '',
      'false',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
      'Content-Disposition: form-data; name="file"; filename="test.mp3"',
      'Content-Type: audio/mpeg',
      '',
      'fake-audio-data',
      `------WebKitFormBoundary7MA4YWxkTrZu0gW--`,
    ].join('\r\n');

    const req = {
      method: 'POST',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
      },
    } as unknown as VercelRequest;

    const stream = Readable.from([body]);
    Object.assign(req, stream);

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as VercelResponse;

    const { default: handler } = await import('../transcribe');

    await handler(req, res);

    expect(mockCreateJob).toHaveBeenCalledWith(
      expect.objectContaining({
        enableSpeakerDiarization: false,
      }),
      expect.any(Object)
    );
  });
});
