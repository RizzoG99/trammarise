import { describe, it, expect, beforeEach } from 'vitest';
import { TranscriptionProviderFactory, type ProviderType } from '../../providers/factory';

describe('TranscriptionProviderFactory', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ASSEMBLYAI_API_KEY = 'test-assemblyai-key';
  });

  describe('create', () => {
    it('should create OpenAI provider when specified', () => {
      const provider = TranscriptionProviderFactory.create({
        provider: 'openai',
        apiKey: 'test-key',
      });

      expect(provider.getProviderName()).toBe('OpenAI');
      expect(provider.supportsSpeakerDiarization()).toBe(false);
    });

    it('should create AssemblyAI provider when speaker diarization is enabled', () => {
      const provider = TranscriptionProviderFactory.create({
        provider: 'assemblyai',
        apiKey: 'test-key',
        enableSpeakerDiarization: true,
      });

      expect(provider.getProviderName()).toBe('AssemblyAI');
      expect(provider.supportsSpeakerDiarization()).toBe(true);
    });

    it('should create OpenAI provider for assemblyai without speaker diarization', () => {
      const provider = TranscriptionProviderFactory.create({
        provider: 'assemblyai',
        apiKey: 'test-key',
        enableSpeakerDiarization: false,
      });

      // Falls back to OpenAI for cost efficiency
      expect(provider.getProviderName()).toBe('OpenAI');
    });

    it('should throw error for unknown provider', () => {
      expect(() => {
        TranscriptionProviderFactory.create({
          provider: 'unknown' as ProviderType,
          apiKey: 'test-key',
        });
      }).toThrow('Unknown provider: unknown');
    });
  });

  describe('getDefaultProvider', () => {
    it('should return assemblyai when speaker diarization is enabled', () => {
      const provider = TranscriptionProviderFactory.getDefaultProvider(true);
      expect(provider).toBe('assemblyai');
    });

    it('should return openai when speaker diarization is disabled', () => {
      const provider = TranscriptionProviderFactory.getDefaultProvider(false);
      expect(provider).toBe('openai');
    });
  });

  describe('supportsSpeakerDiarization', () => {
    it('should return true for assemblyai', () => {
      expect(TranscriptionProviderFactory.supportsSpeakerDiarization('assemblyai')).toBe(true);
    });

    it('should return false for openai', () => {
      expect(TranscriptionProviderFactory.supportsSpeakerDiarization('openai')).toBe(false);
    });
  });

  describe('getAvailableProviders', () => {
    it('should return list of all providers with capabilities', () => {
      const providers = TranscriptionProviderFactory.getAvailableProviders();

      expect(providers).toHaveLength(2);
      expect(providers).toEqual([
        {
          type: 'openai',
          name: 'OpenAI Whisper',
          supportsSpeakerDiarization: false,
        },
        {
          type: 'assemblyai',
          name: 'AssemblyAI',
          supportsSpeakerDiarization: true,
        },
      ]);
    });
  });
});
