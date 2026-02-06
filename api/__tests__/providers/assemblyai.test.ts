import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TranscriptionRequest } from '../../types/provider';

// Mock axios for HTTP requests
const mockAxiosPost = vi.fn();
const mockAxiosGet = vi.fn();

vi.mock('axios', () => ({
  default: {
    post: mockAxiosPost,
    get: mockAxiosGet,
  },
}));

describe('AssemblyAIProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosPost.mockReset();
    mockAxiosGet.mockReset();
    process.env.ASSEMBLYAI_API_KEY = 'test-api-key';
  });

  describe('transcribe', () => {
    it('should upload audio and start transcription with speaker labels', async () => {
      // Arrange
      const { AssemblyAIProvider } = await import('../../providers/assemblyai');
      const provider = new AssemblyAIProvider({ pollingInterval: 10 });

      const mockAudioBuffer = Buffer.from('mock-audio-data');
      const request: TranscriptionRequest = {
        audioFile: mockAudioBuffer,
        language: 'en',
        enableSpeakerDiarization: true,
      };

      // Mock upload response
      mockAxiosPost.mockResolvedValueOnce({
        data: {
          upload_url: 'https://cdn.assemblyai.com/upload/test-123',
        },
      });

      // Mock transcription submission response
      mockAxiosPost.mockResolvedValueOnce({
        data: {
          id: 'transcript-abc-123',
          status: 'queued',
        },
      });

      // Mock polling responses
      mockAxiosGet
        .mockResolvedValueOnce({
          data: {
            id: 'transcript-abc-123',
            status: 'processing',
          },
        })
        .mockResolvedValueOnce({
          data: {
            id: 'transcript-abc-123',
            status: 'completed',
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
            audio_duration: 6.5,
          },
        });

      // Act
      const result = await provider.transcribe(request);

      // Assert - Upload called
      expect(mockAxiosPost).toHaveBeenNthCalledWith(
        1,
        'https://api.assemblyai.com/v2/upload',
        mockAudioBuffer,
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: 'test-api-key',
          }),
        })
      );

      // Assert - Transcription started with speaker_labels
      expect(mockAxiosPost).toHaveBeenNthCalledWith(
        2,
        'https://api.assemblyai.com/v2/transcript',
        expect.objectContaining({
          audio_url: 'https://cdn.assemblyai.com/upload/test-123',
          speaker_labels: true,
        }),
        expect.any(Object)
      );

      // Assert - Result
      expect(result.text).toBe('Full transcript text');
      expect(result.utterances).toHaveLength(2);
      expect(result.utterances?.[0]).toEqual({
        speaker: 'A',
        text: 'Hello, how are you?',
        start: 1000,
        end: 3000,
        confidence: 0.95,
      });
    });

    it('should transcribe without speaker labels when disabled', async () => {
      // Arrange
      const { AssemblyAIProvider } = await import('../../providers/assemblyai');
      const provider = new AssemblyAIProvider({ pollingInterval: 10 });

      const request: TranscriptionRequest = {
        audioFile: Buffer.from('mock-audio-data'),
        language: 'en',
        enableSpeakerDiarization: false,
      };

      mockAxiosPost.mockResolvedValueOnce({
        data: { upload_url: 'https://cdn.assemblyai.com/upload/test-456' },
      });

      mockAxiosPost.mockResolvedValueOnce({
        data: { id: 'transcript-def-456', status: 'queued' },
      });

      mockAxiosGet.mockResolvedValueOnce({
        data: {
          id: 'transcript-def-456',
          status: 'completed',
          text: 'Plain transcript without speakers',
          audio_duration: 3.5,
        },
      });

      // Act
      const result = await provider.transcribe(request);

      // Assert - speaker_labels should be false
      expect(mockAxiosPost).toHaveBeenNthCalledWith(
        2,
        'https://api.assemblyai.com/v2/transcript',
        expect.objectContaining({
          speaker_labels: false,
        }),
        expect.any(Object)
      );

      expect(result.text).toBe('Plain transcript without speakers');
      expect(result.utterances).toBeUndefined();
    });

    it('should specify number of speakers when provided', async () => {
      // Arrange
      const { AssemblyAIProvider } = await import('../../providers/assemblyai');
      const provider = new AssemblyAIProvider({ pollingInterval: 10 });

      const request: TranscriptionRequest = {
        audioFile: Buffer.from('mock-audio-data'),
        language: 'en',
        enableSpeakerDiarization: true,
        speakersExpected: 3,
      };

      mockAxiosPost.mockResolvedValueOnce({
        data: { upload_url: 'https://cdn.assemblyai.com/upload/test-789' },
      });

      mockAxiosPost.mockResolvedValueOnce({
        data: { id: 'transcript-ghi-789', status: 'queued' },
      });

      mockAxiosGet.mockResolvedValueOnce({
        data: {
          id: 'transcript-ghi-789',
          status: 'completed',
          text: 'Three speaker transcript',
          audio_duration: 10.0,
        },
      });

      // Act
      await provider.transcribe(request);

      // Assert
      expect(mockAxiosPost).toHaveBeenNthCalledWith(
        2,
        'https://api.assemblyai.com/v2/transcript',
        expect.objectContaining({
          speaker_labels: true,
          speakers_expected: 3,
        }),
        expect.any(Object)
      );
    });

    it('should handle transcription errors', async () => {
      // Arrange
      const { AssemblyAIProvider } = await import('../../providers/assemblyai');
      const provider = new AssemblyAIProvider({ pollingInterval: 10 });

      const request: TranscriptionRequest = {
        audioFile: Buffer.from('mock-audio-data'),
        language: 'en',
      };

      mockAxiosPost.mockResolvedValueOnce({
        data: { upload_url: 'https://cdn.assemblyai.com/upload/test-error' },
      });

      mockAxiosPost.mockResolvedValueOnce({
        data: { id: 'transcript-error-123', status: 'queued' },
      });

      mockAxiosGet.mockResolvedValueOnce({
        data: {
          id: 'transcript-error-123',
          status: 'error',
          error: 'Audio file is corrupted',
        },
      });

      // Act & Assert
      await expect(provider.transcribe(request)).rejects.toThrow('Audio file is corrupted');
    });

    it('should timeout after max polling attempts', async () => {
      // Arrange
      const { AssemblyAIProvider } = await import('../../providers/assemblyai');
      // Use shorter timeout for testing
      const provider = new AssemblyAIProvider({
        maxPollingAttempts: 3,
        pollingInterval: 10,
      });

      const request: TranscriptionRequest = {
        audioFile: Buffer.from('mock-audio-data'),
        language: 'en',
      };

      mockAxiosPost.mockResolvedValueOnce({
        data: { upload_url: 'https://cdn.assemblyai.com/upload/test-timeout' },
      });

      mockAxiosPost.mockResolvedValueOnce({
        data: { id: 'transcript-timeout-123', status: 'queued' },
      });

      // Mock polling to return processing 3 times (will exceed maxPollingAttempts of 3)
      mockAxiosGet
        .mockResolvedValueOnce({
          data: { id: 'transcript-timeout-123', status: 'processing' },
        })
        .mockResolvedValueOnce({
          data: { id: 'transcript-timeout-123', status: 'processing' },
        })
        .mockResolvedValueOnce({
          data: { id: 'transcript-timeout-123', status: 'processing' },
        });

      // Act & Assert
      await expect(provider.transcribe(request)).rejects.toThrow('Transcription timeout');
    });

    it('should handle network errors', async () => {
      // Arrange
      const { AssemblyAIProvider } = await import('../../providers/assemblyai');
      const provider = new AssemblyAIProvider();

      const request: TranscriptionRequest = {
        audioFile: Buffer.from('mock-audio-data'),
        language: 'en',
      };

      mockAxiosPost.mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(provider.transcribe(request)).rejects.toThrow('Network error');
    });
  });

  describe('getProviderName', () => {
    it('should return AssemblyAI as provider name', async () => {
      // Arrange
      const { AssemblyAIProvider } = await import('../../providers/assemblyai');
      const provider = new AssemblyAIProvider();

      // Act & Assert
      expect(provider.getProviderName()).toBe('AssemblyAI');
    });
  });
});
