import { useState, useRef, useCallback } from 'react';
import {
  createTranscriptionJob,
  pollJobStatus,
  summarizeTranscript,
  cancelJob,
} from '../utils/api';
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
 * 1. Upload audio and create transcription job (0-10%)
 * 2. Server-side chunking and transcription (10-70%)
 * 3. Analyze context files (70-80%)
 * 4. Generate AI summary (80-100%)
 *
 * Features:
 * - Server-side audio chunking (no client-side FFmpeg)
 * - Real-time progress tracking via polling
 * - Cancellation support via AbortController
 * - Error handling with user-friendly messages
 *
 * @param options - Callbacks for progress, completion, and errors
 * @returns Processing control functions
 */
import { useSubscription, TIER_MINUTES } from '../context/SubscriptionContext';

// ... existing imports ...

export function useAudioProcessing({ onProgress, onComplete, onError }: UseAudioProcessingOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentJobIdRef = useRef<string | null>(null);
  const { subscription } = useSubscription();

  /**
   * Start the audio processing workflow (server-side chunking)
   */
  const startProcessing = useCallback(
    async (session: SessionData, config: AIConfiguration) => {
      if (isProcessing) {
        console.warn('Processing already in progress');
        return;
      }

      // Check usage limits before starting
      // We check if they have ANY minutes left. Strict duration check happens on backend.
      if (subscription) {
        const minutesRemaining =
          (TIER_MINUTES[subscription.tier] || 0) - (subscription.minutesUsed || 0);

        if (minutesRemaining <= 0 && subscription.tier !== 'pro' && subscription.tier !== 'team') {
          // Technically Pro/Team should have high limits, but if they hit it, they hit it.
          // However, strictly blocking Free users.
          const error = new Error('Usage limit exceeded. Please upgrade to continue.');
          onError(error);
          return;
        }
      }

      // ... unfortunately TIER_MINUTES is not exported from context.
      // I should expose `isOverLimit` or `minutesRemaining` from Context.
      // Let's check SubscriptionContext again.

      setIsProcessing(true);
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Check if aborted before starting
        if (abortController.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        // Step 1: Upload audio and create transcription job - 0-10%
        onProgress('uploading', 0);

        const { jobId } = await createTranscriptionJob(
          session.audioFile.file,
          config.openaiKey,
          config.language,
          config.model,
          config.contentType,
          config.model, // performance level
          session.audioFile.file.name
        );

        // Store jobId for cancellation
        currentJobIdRef.current = jobId;

        onProgress('uploading', 10);

        // Check if aborted after job creation
        if (abortController.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        // Step 2: Poll job status for transcription progress - 10-70%
        const fullTranscript = await pollJobStatus(jobId, (progress, status) => {
          // Check if aborted during polling
          if (abortController.signal.aborted) {
            throw new Error('Processing cancelled');
          }

          // Map job progress (0-100%) to our range (10-70%)
          const mappedProgress = 10 + Math.round((progress / 100) * 60);

          // Update step based on status
          if (status === 'chunking') {
            onProgress('uploading', mappedProgress);
          } else if (status === 'transcribing' || status === 'assembling') {
            onProgress('transcribing', mappedProgress);
          }
        });

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
          config.language,
          config.noiseProfile
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
        currentJobIdRef.current = null;
      }
    },
    [isProcessing, onProgress, onComplete, onError, subscription]
  );

  /**
   * Cancel the current processing operation
   */
  const cancel = useCallback(async () => {
    // Abort the client-side polling
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cancel the server-side job if it exists
    if (currentJobIdRef.current) {
      try {
        await cancelJob(currentJobIdRef.current);
        console.log(`[useAudioProcessing] Cancelled job ${currentJobIdRef.current}`);
      } catch (error) {
        console.error('[useAudioProcessing] Failed to cancel job:', error);
      } finally {
        currentJobIdRef.current = null;
      }
    }
  }, []);

  return { startProcessing, cancel, isProcessing };
}

/**
 * Enhanced error handler with user-friendly messages based on error type
 */
function handleError(errorMsg: string, _session: SessionData, onError: (error: Error) => void) {
  const message = errorMsg.toLowerCase();

  // Job-specific errors
  if (message.includes('job not found') || message.includes('job timed out')) {
    onError(
      new Error(
        'Transcription job failed or timed out. This may happen with very long audio files. ' +
          'Please try again or split your audio into shorter segments.'
      )
    );
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
      new Error('Network error occurred. Please check your internet connection and try again.')
    );
    return;
  }

  // Generic error (pass through original message)
  onError(
    new Error(`Processing failed: ${errorMsg}\n\nPlease try again or check your configuration.`)
  );
}
