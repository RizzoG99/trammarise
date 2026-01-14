import { useState, useRef, useCallback } from 'react';
import { transcribeAudio, summarizeTranscript } from '../utils/api';
import type { AIConfiguration, ProcessingResult } from '../types/audio';
import type { SessionData } from '../types/routing';

/**
 * Processing step types matching the UI step IDs
 */
export type ProcessingStep = 'uploading' | 'transcribing' | 'analyzing' | 'summarizing';

/**
 * Hook options for audio processing callbacks
 */
interface UseAudioProcessingOptions {
  onProgress: (step: ProcessingStep, progress: number) => void;
  onComplete: (result: ProcessingResult) => void;
  onError: (error: Error) => void;
}

/**
 * Custom hook for orchestrating audio processing workflow.
 *
 * Handles the complete processing pipeline:
 * 1. Compress & chunk large audio files (0-30%)
 * 2. Transcribe audio chunks sequentially (30-70%)
 * 3. Analyze context files (70-80%)
 * 4. Generate AI summary (80-100%)
 *
 * Features:
 * - Real-time progress tracking
 * - Cancellation support via AbortController
 * - Error handling with user-friendly messages
 * - Extracted from old App.tsx handleConfigure logic
 *
 * @param options - Callbacks for progress, completion, and errors
 * @returns Processing control functions
 */
export function useAudioProcessing({
  onProgress,
  onComplete,
  onError,
}: UseAudioProcessingOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Start the audio processing workflow
   */
  const startProcessing = useCallback(
    async (session: SessionData, config: AIConfiguration) => {
      if (isProcessing) {
        console.warn('Processing already in progress');
        return;
      }

      setIsProcessing(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Check if aborted before starting
        if (abortController.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        // Step 0: Process large audio (Compress & Chunk) - 0-30%
        onProgress('uploading', 0);

        // Dynamic import to avoid loading FFmpeg unless needed
        const { processLargeAudio } = await import('../utils/audio-processor');

        const chunks = await processLargeAudio(session.audioFile.file, (step, progress) => {
          // Check if aborted during processing
          if (abortController.signal.aborted) {
            throw new Error('Processing cancelled');
          }

          if (step === 'compressing') {
            // Compression: 0-20%
            onProgress('uploading', Math.round(progress * 0.2));
          } else if (step === 'chunking') {
            // Chunking: 20-30%
            onProgress('uploading', 20 + Math.round(progress * 0.1));
          }
        });

        // Check if aborted after chunking
        if (abortController.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        // Step 1: Transcribe chunks sequentially - 30-70%
        let fullTranscript = '';

        for (let i = 0; i < chunks.length; i++) {
          // Check if aborted before each chunk
          if (abortController.signal.aborted) {
            throw new Error('Processing cancelled');
          }

          const chunk = chunks[i];
          const progressBase = 30 + Math.round((i / chunks.length) * 40); // 30-70%
          onProgress('transcribing', progressBase);

          // Determine filename: use original name if it's a File, otherwise generate chunk name
          const chunkName = chunk instanceof File ? chunk.name : `chunk-${i}.mp3`;

          const { transcript } = await transcribeAudio(
            chunk,
            config.openaiKey,
            config.language,
            config.model,
            config.contentType,
            chunkName
          );

          // Concatenate transcripts with double newline separator
          fullTranscript += (fullTranscript ? '\n\n' : '') + transcript;
        }

        onProgress('transcribing', 70);

        // Check if aborted after transcription
        if (abortController.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        // Step 2: Analyze context (if context files exist) - 70-80%
        if (config.contextFiles && config.contextFiles.length > 0) {
          onProgress('analyzing', 75);
          // Context files are passed to summarization API below
        } else {
          onProgress('analyzing', 80);
        }

        // Check if aborted before summarization
        if (abortController.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        // Step 3: Summarize with context files - 80-100%
        onProgress('summarizing', 80);

        const apiKey = config.provider === 'openai' ? config.openaiKey : config.openrouterKey!;

        const { summary } = await summarizeTranscript(
          fullTranscript,
          config.contentType,
          config.provider,
          apiKey,
          config.model,
          config.contextFiles,
          config.language
        );

        onProgress('summarizing', 100);

        // Build final result
        const result: ProcessingResult = {
          transcript: fullTranscript,
          summary,
          chatHistory: [],
          configuration: config,
        };

        // Processing complete
        onComplete(result);
      } catch (error) {
        const err = error as { message?: string };
        console.error('Processing error:', error);
        const errorMsg = err.message || 'Unknown error';

        // Enhanced error handling with user-friendly messages
        handleError(errorMsg, session, onError);
      } finally {
        setIsProcessing(false);
        abortControllerRef.current = null;
      }
    },
    [isProcessing, onProgress, onComplete, onError]
  );

  /**
   * Cancel the current processing operation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return { startProcessing, cancel, isProcessing };
}

/**
 * Enhanced error handler with user-friendly messages based on error type
 */
function handleError(errorMsg: string, session: SessionData, onError: (error: Error) => void) {
  const message = errorMsg.toLowerCase();

  // FFmpeg-specific errors
  if (message.includes('ffmpeg') || message.includes('cdn')) {
    const isMP3 = session.audioFile.file.type === 'audio/mpeg';
    const isSmall = session.audioFile.file.size < 24 * 1024 * 1024; // 24MB

    if (isMP3 && isSmall) {
      onError(
        new Error(
          'Audio processor failed to load (network issue). Your file is small enough to ' +
            'process without it. Refresh the page and try again. If the issue persists, ' +
            'contact support.'
        )
      );
    } else {
      onError(
        new Error(
          'Audio processor failed to load from the network. This is needed for large files (>24MB). ' +
            'Please check your internet connection and try again. If the problem persists, try ' +
            'uploading a smaller MP3 file (<24MB).'
        )
      );
    }
    return;
  }

  // Timeout errors
  if (message.includes('timeout')) {
    onError(
      new Error(
        'Processing timed out. Your audio may be too long or complex. Try:\n' +
          '1. Trimming the audio to a shorter segment\n' +
          '2. Using a faster model\n' +
          '3. Splitting into smaller files'
      )
    );
    return;
  }

  // API key errors
  if (message.includes('api key') || message.includes('unauthorized') || message.includes('401')) {
    onError(
      new Error(
        'Invalid API credentials. Please check your API keys in .env.local:\n' +
          'VITE_OPENAI_API_KEY=sk-...\n\n' +
          'Get your key at: https://platform.openai.com/api-keys'
      )
    );
    return;
  }

  // Cancellation (user-initiated)
  if (message.includes('cancelled') || message.includes('aborted')) {
    onError(new Error('Processing cancelled by user'));
    return;
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    onError(
      new Error(
        'Network error occurred. Please check your internet connection and try again.'
      )
    );
    return;
  }

  // Generic error (pass through original message)
  onError(
    new Error(
      `Processing failed: ${errorMsg}\n\nPlease try again or check your configuration.`
    )
  );
}
