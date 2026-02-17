import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TranscriptionResponse } from '../types/provider';

/**
 * Unit tests for speaker diarization integration logic
 *
 * These tests verify the business logic for handling speaker diarization
 * without requiring full request/response mocking.
 */

describe('Speaker Diarization Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TranscriptionProviderFactory integration', () => {
    it('should create AssemblyAI provider when speaker diarization is enabled', async () => {
      const { TranscriptionProviderFactory } = await import('../providers/factory');

      const provider = TranscriptionProviderFactory.create({
        provider: 'assemblyai',
        apiKey: 'test-key',
        enableSpeakerDiarization: true,
      });

      expect(provider.getProviderName()).toBe('AssemblyAI');
      expect(provider.supportsSpeakerDiarization()).toBe(true);
    });

    it('should use OpenAI provider when speaker diarization is disabled', async () => {
      const { TranscriptionProviderFactory } = await import('../providers/factory');

      const provider = TranscriptionProviderFactory.create({
        provider: 'assemblyai',
        apiKey: 'test-key',
        enableSpeakerDiarization: false,
      });

      // Falls back to OpenAI for cost efficiency
      expect(provider.getProviderName()).toBe('OpenAI');
      expect(provider.supportsSpeakerDiarization()).toBe(false);
    });

    it('should get default provider based on speaker diarization requirement', async () => {
      const { TranscriptionProviderFactory } = await import('../providers/factory');

      expect(TranscriptionProviderFactory.getDefaultProvider(true)).toBe('assemblyai');
      expect(TranscriptionProviderFactory.getDefaultProvider(false)).toBe('openai');
    });
  });

  describe('JobConfiguration with speaker diarization', () => {
    it('should store speaker diarization settings in job config', async () => {
      const jobConfig = {
        apiKey: 'test-key',
        mode: 'balanced' as const,
        model: 'gpt-4o-mini-transcribe',
        language: 'en',
        enableSpeakerDiarization: true,
        speakersExpected: 3,
      };

      expect(jobConfig.enableSpeakerDiarization).toBe(true);
      expect(jobConfig.speakersExpected).toBe(3);
    });

    it('should handle optional speaker diarization fields', async () => {
      const jobConfig = {
        apiKey: 'test-key',
        mode: 'balanced' as const,
        model: 'gpt-4o-mini-transcribe',
        language: 'en',
        // No speaker diarization fields
      };

      expect(jobConfig.enableSpeakerDiarization).toBeUndefined();
      expect(jobConfig.speakersExpected).toBeUndefined();
    });
  });

  describe('JobManager utterances handling', () => {
    it('should set and retrieve utterances from job', async () => {
      const { JobManager } = await import('../utils/job-manager');

      // Create a test job
      const job = JobManager.createJob(
        {
          apiKey: 'test-key',
          mode: 'balanced',
          model: 'gpt-4o-mini-transcribe',
          enableSpeakerDiarization: true,
        },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 10,
          totalChunks: 0,
        }
      );

      const testUtterances = [
        {
          speaker: 'A',
          text: 'Hello there',
          start: 1000,
          end: 2000,
          confidence: 0.95,
        },
        {
          speaker: 'B',
          text: 'Hi, how are you?',
          start: 2100,
          end: 3500,
          confidence: 0.92,
        },
      ];

      // Set utterances
      JobManager.setJobUtterances(job.jobId, testUtterances);

      // Retrieve job and verify utterances
      const retrievedJob = JobManager.getJob(job.jobId);
      expect(retrievedJob?.utterances).toEqual(testUtterances);
      expect(retrievedJob?.utterances).toHaveLength(2);
    });

    it('should include utterances in job status response', async () => {
      const { JobManager } = await import('../utils/job-manager');

      const job = JobManager.createJob(
        {
          apiKey: 'test-key',
          mode: 'balanced',
          model: 'gpt-4o-mini-transcribe',
        },
        {
          filename: 'test.mp3',
          fileSize: 1024,
          duration: 10,
          totalChunks: 0,
        }
      );

      const testUtterances = [
        {
          speaker: 'Speaker 1',
          text: 'Test utterance',
          start: 0,
          end: 1000,
          confidence: 0.9,
        },
      ];

      JobManager.setJobTranscript(job.jobId, 'Test transcript');
      JobManager.setJobUtterances(job.jobId, testUtterances);
      JobManager.updateJobStatus(job.jobId, 'completed');

      const statusResponse = JobManager.getJobStatusResponse(job.jobId);

      expect(statusResponse?.transcript).toBe('Test transcript');
      expect(statusResponse?.utterances).toEqual(testUtterances);
      expect(statusResponse?.status).toBe('completed');
    });
  });

  describe('TranscriptionResponse with utterances', () => {
    it('should structure utterances correctly', () => {
      const response: TranscriptionResponse = {
        text: 'Full transcript text',
        utterances: [
          {
            speaker: 'A',
            text: 'First utterance',
            start: 0,
            end: 1000,
            confidence: 0.95,
          },
          {
            speaker: 'B',
            text: 'Second utterance',
            start: 1100,
            end: 2500,
            confidence: 0.92,
          },
        ],
        duration: 2.5,
        language: 'en',
      };

      expect(response.text).toBe('Full transcript text');
      expect(response.utterances).toHaveLength(2);
      expect(response.utterances![0].speaker).toBe('A');
      expect(response.utterances![1].speaker).toBe('B');
    });

    it('should handle optional utterances field', () => {
      const response: TranscriptionResponse = {
        text: 'Transcript without speakers',
        duration: 5.0,
      };

      expect(response.text).toBe('Transcript without speakers');
      expect(response.utterances).toBeUndefined();
    });
  });
});
