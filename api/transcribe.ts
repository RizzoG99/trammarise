import type { VercelRequest, VercelResponse } from '@vercel/node';
import busboy from 'busboy';
import { API_VALIDATION } from '../src/utils/constants';
import { WHISPER_STYLE_PROMPT } from '../src/utils/transcription-prompts';
import { JobManager } from './utils/job-manager';
import { chunkAudio, cleanupChunks } from './utils/audio-chunker';
import { RateLimitGovernor } from './utils/rate-limit-governor';
import { processChunk } from './utils/chunk-processor';
import { OpenAIProvider } from './providers/openai';
import { TranscriptionProviderFactory } from './providers/factory';
import { assembleTranscript } from './utils/transcript-assembler';
import type { ProcessingMode } from './types/chunking';
import type { JobConfiguration } from './types/job';
import { optionalAuth, AuthError } from './middleware/auth';
import { rateLimit, RateLimitError, RATE_LIMITS } from './middleware/rate-limit';
import { checkQuota, trackUsage } from './middleware/usage-tracking';
import { validateAudioFile } from './utils/file-validator';
import { supabaseAdmin } from './lib/supabase-admin';

export const config = {
  api: {
    bodyParser: false,
  },
};

const { MAX_FILE_SIZE, MAX_FILES, MAX_FIELDS } = API_VALIDATION;

/**
 * Main transcription endpoint - creates a job and processes in background
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. AUTHENTICATION - Optional (support both authenticated and BYOK users)
    const authResult = await optionalAuth();
    const userId = authResult?.userId;

    // 2. RATE LIMITING - Prevent abuse
    await rateLimit(req, {
      ...RATE_LIMITS.TRANSCRIBE,
      keyGenerator: () =>
        userId ? `user:${userId}` : `ip:${req.headers['x-forwarded-for'] || 'unknown'}`,
    });

    // Parse multipart form data with busboy
    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES,
        fields: MAX_FIELDS,
      },
    });

    let audioData: Buffer | null = null;
    const audioChunks: Buffer[] = [];
    let apiKey: string | null = null;
    let language: string | undefined = undefined;
    let performanceLevel: string | undefined = undefined;
    let enableSpeakerDiarization = false;
    let speakersExpected: number | undefined = undefined;
    let uploadedFilename: string = 'audio.webm';
    let fileSizeExceeded = false;

    const parsePromise = new Promise<void>((resolve, reject) => {
      bb.on('file', (_fieldname, file, info) => {
        const { filename, mimeType } = info;
        uploadedFilename = filename || 'audio.webm';

        // Basic MIME type check
        if (!mimeType.startsWith('audio/')) {
          file.resume();
          reject(new Error('Invalid file type. Audio files only.'));
          return;
        }

        file.on('data', (chunk) => {
          audioChunks.push(chunk);
        });

        file.on('limit', () => {
          fileSizeExceeded = true;
          file.resume();
        });

        file.on('end', () => {
          if (fileSizeExceeded) {
            reject(new Error('File size exceeds limit'));
          } else {
            audioData = Buffer.concat(audioChunks);
          }
        });
      });

      bb.on('field', (fieldname, value) => {
        if (fieldname === 'apiKey') {
          apiKey = value;
        } else if (fieldname === 'language') {
          language = value || undefined;
        } else if (fieldname === 'performanceLevel') {
          performanceLevel = value || undefined;
        } else if (fieldname === 'enableSpeakerDiarization') {
          enableSpeakerDiarization = value === 'true';
        } else if (fieldname === 'speakersExpected') {
          const parsed = parseInt(value, 10);
          speakersExpected = !isNaN(parsed) ? parsed : undefined;
        }
      });

      bb.on('finish', () => {
        resolve();
      });

      bb.on('error', (error) => {
        reject(error);
      });
    });

    req.pipe(bb);
    await parsePromise;

    if (!audioData) {
      return res.status(400).json({ error: 'No audio file found in request' });
    }

    // Narrow audioData type to Buffer (TypeScript needs explicit assertion in async callbacks)
    const audioBuffer: Buffer = audioData;

    // 3. FILE VALIDATION - Magic bytes and duration check
    // Note: We'll do a quick validation here, full validation happens during chunking
    const mimeType = req.headers['content-type']?.split(';')[0] || 'audio/webm';
    const validation = await validateAudioFile(audioBuffer, mimeType, 7200);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'File validation failed',
        message: validation.error,
      });
    }

    // 4. API KEY LOGIC - Support both authenticated (with quota) and BYOK users
    const userProvidedKey = apiKey; // From form data
    let finalApiKey: string;
    let shouldTrackQuota = false;

    if (userProvidedKey) {
      // BYOK Mode: User provided their own API key - use it (works for both authenticated and non-authenticated)
      finalApiKey = userProvidedKey;
      shouldTrackQuota = false; // Analytics only, no quota deduction
      console.log(
        `[Transcribe] ${userId ? `User ${userId}` : 'Anonymous user'} using own API key (BYOK mode)`
      );
    } else if (userId) {
      // Authenticated user without own key - check subscription and use platform key
      const { data: subscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('tier')
        .eq('user_id', userId)
        .single();

      if (subError || !subscription) {
        return res.status(403).json({
          error: 'Subscription required',
          message: 'Please check your subscription status or provide your own API key.',
          upgradeUrl: '/pricing',
        });
      }

      // Pro/Team user without own key - use platform key with quota check
      const estimatedMinutes = Math.ceil((validation.duration || 0) / 60);
      const quotaCheck = await checkQuota(userId, estimatedMinutes);

      if (!quotaCheck.allowed) {
        return res.status(429).json({
          error: 'Quota exceeded',
          minutesRemaining: quotaCheck.minutesRemaining,
          minutesRequired: quotaCheck.minutesRequired,
          message: 'Insufficient quota. Please upgrade your plan or purchase additional credits.',
        });
      }

      finalApiKey = process.env.OPENAI_API_KEY!;
      shouldTrackQuota = true; // Track + deduct from quota
      console.log(
        `[Transcribe] User ${userId} (${subscription.tier}) using platform key with quota`
      );
    } else {
      // Not authenticated and no API key - reject
      return res.status(401).json({
        error: 'Authentication or API key required',
        message: 'Please sign in or provide your own OpenAI API key.',
      });
    }

    // Determine processing mode from performance level
    const mode: ProcessingMode =
      performanceLevel === 'best_quality' || performanceLevel === 'advanced'
        ? 'best_quality'
        : 'balanced';

    // Use Whisper API for all transcription (stable, reliable)
    const transcriptionModel = 'whisper-1';

    // Handle auto-detection: Convert 'auto' to undefined for Whisper API
    const transcriptionLanguage = language === 'auto' ? undefined : language;

    console.log(
      `[Transcribe API] Job configuration: model=${transcriptionModel}, mode=${mode}, language=${transcriptionLanguage || 'auto'}`
    );

    // Create job configuration with Whisper style prompt
    const jobConfig: JobConfiguration = {
      apiKey: finalApiKey,
      mode,
      model: transcriptionModel,
      language: transcriptionLanguage,
      prompt: WHISPER_STYLE_PROMPT, // Use style prompt for clean transcription
      enableSpeakerDiarization,
      speakersExpected,
      userId, // Store userId for ownership validation
      shouldTrackQuota, // Track mode (with/without quota deduction)
    };

    // Create job
    const job = JobManager.createJob(jobConfig, {
      filename: uploadedFilename,
      fileSize: audioBuffer.length,
      duration: validation.duration || 0, // Use validated duration
      totalChunks: 0,
    });

    console.log(
      `[Transcribe API] Created job ${job.jobId} (mode: ${mode}, size: ${audioBuffer.length}B)`
    );

    // Return job ID immediately (202 Accepted)
    const statusUrl = `/api/transcribe-job/${job.jobId}/status`;
    res.status(202).json({
      jobId: job.jobId,
      statusUrl,
      message: 'Transcription job created',
    });

    // Process job in background (don't await)
    processJobInBackground(job.jobId, audioBuffer, uploadedFilename).catch((error) => {
      console.error(`[Transcribe API] Background processing failed for job ${job.jobId}:`, error);
      JobManager.updateJobStatus(job.jobId, 'failed', error.message);
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    if (error instanceof RateLimitError) {
      res.setHeader('Retry-After', error.retryAfter.toString());
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: error.retryAfter,
      });
    }

    const err = error as { message?: string };
    console.error('[Transcribe API] Error:', error);

    const status = err.message?.includes('File size')
      ? 413
      : err.message?.includes('Invalid file type')
        ? 415
        : err.message?.includes('validation')
          ? 400
          : 500;

    return res.status(status).json({
      error: 'Failed to create transcription job',
      message: err.message || 'Unknown error',
    });
  }
}

/**
 * Process transcription job in background
 */
async function processJobInBackground(
  jobId: string,
  audioBuffer: Buffer,
  filename: string
): Promise<void> {
  const job = JobManager.getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  try {
    // Check if speaker diarization is enabled
    if (job.config.enableSpeakerDiarization) {
      // Speaker diarization path: Use AssemblyAI with full audio file (no chunking)
      console.log(`[Job ${jobId}] Starting speaker diarization transcription...`);
      JobManager.updateJobStatus(jobId, 'transcribing');

      // Create AssemblyAI provider
      const provider = TranscriptionProviderFactory.create({
        provider: 'assemblyai',
        apiKey: job.config.apiKey,
        enableSpeakerDiarization: true,
      });

      // Transcribe with speaker diarization
      const result = await provider.transcribe({
        audioFile: audioBuffer,
        language: job.config.language,
        enableSpeakerDiarization: true,
        speakersExpected: job.config.speakersExpected,
      });

      // Set transcript and utterances
      JobManager.setJobTranscript(jobId, result.text);
      if (result.utterances) {
        JobManager.setJobUtterances(jobId, result.utterances);
      }

      // Mark job as completed
      JobManager.updateJobStatus(jobId, 'completed');

      console.log(
        `[Job ${jobId}] ✅ Completed with speaker diarization (${result.text.length} chars, ${result.utterances?.length || 0} utterances)`
      );

      // Track usage (after successful completion)
      if (job.config.userId) {
        const durationSeconds = job.metadata.duration || 0;
        const mode = job.config.shouldTrackQuota ? 'with_quota_deduction' : 'analytics_only';
        await trackUsage(job.config.userId, 'transcription', durationSeconds, mode);
      }

      return;
    }

    // Standard transcription path: Chunk and process with OpenAI
    // Update status to chunking
    JobManager.updateJobStatus(jobId, 'chunking');

    // Step 1: Chunk audio
    console.log(`[Job ${jobId}] Starting audio chunking...`);
    const chunkingResult = await chunkAudio(audioBuffer, filename, job.config.mode);

    // Update job with chunks
    JobManager.initializeChunks(jobId, chunkingResult.chunks);

    // Update metadata with duration
    const updatedJob = JobManager.getJob(jobId)!;
    updatedJob.metadata.duration = chunkingResult.totalDuration;

    console.log(
      `[Job ${jobId}] Created ${chunkingResult.totalChunks} chunks (${chunkingResult.totalDuration.toFixed(2)}s total)`
    );

    // Update status to transcribing
    JobManager.updateJobStatus(jobId, 'transcribing');

    // Step 2: Create rate limit governor
    const governor = new RateLimitGovernor(job.config.mode);

    // Step 3: Create provider
    const provider = new OpenAIProvider();

    // Step 4: Process all chunks
    console.log(`[Job ${jobId}] Processing chunks with rate governor...`);
    const transcripts: string[] = [];

    for (const chunk of chunkingResult.chunks) {
      // Check if job has been cancelled
      const currentJob = JobManager.getJob(jobId);
      if (currentJob?.status === 'cancelled') {
        console.log(`[Job ${jobId}] Job cancelled, stopping chunk processing`);
        throw new Error('Job was cancelled by user');
      }

      try {
        const transcript = await processChunk(
          chunk,
          updatedJob,
          governor,
          provider,
          job.config.apiKey
        );

        transcripts.push(transcript);

        // Update chunk status
        JobManager.updateChunkStatus(jobId, chunk.index, {
          status: 'completed',
          transcript,
        });

        console.log(
          `[Job ${jobId}] Completed chunk ${chunk.index + 1}/${chunkingResult.totalChunks} (${updatedJob.progress}%)`
        );
      } catch (error) {
        const err = error as { message?: string };
        console.error(`[Job ${jobId}] Failed to process chunk ${chunk.index}:`, error);

        // Update chunk status to failed
        JobManager.updateChunkStatus(jobId, chunk.index, {
          status: 'failed',
          error: err.message || 'Unknown error',
        });

        // If a chunk fails after all retries, fail the entire job
        throw new Error(`Chunk ${chunk.index} failed: ${err.message || 'Unknown error'}`);
      }
    }

    // Step 5: Assemble final transcript
    console.log(`[Job ${jobId}] Assembling final transcript...`);
    JobManager.updateJobStatus(jobId, 'assembling');

    const finalTranscript = await assembleTranscript(
      chunkingResult.chunks,
      transcripts,
      job.config.mode
    );

    JobManager.setJobTranscript(jobId, finalTranscript);

    // Step 6: Clean up chunk files
    await cleanupChunks(chunkingResult.chunks);

    // Step 7: Mark job as completed
    JobManager.updateJobStatus(jobId, 'completed');

    console.log(
      `[Job ${jobId}] ✅ Completed successfully (${finalTranscript.length} chars, ${governor.getStats().totalRequests} API calls)`
    );

    // Log statistics
    const stats = governor.getStats();
    console.log(`[Job ${jobId}] Stats:`, {
      totalRequests: stats.totalRequests,
      successRate: `${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`,
      rateLimited: stats.rateLimitedRequests,
      degradedModeActivations: stats.degradedModeActivations,
      peakConcurrency: stats.peakConcurrency,
    });

    // Step 8: Track usage (after successful completion)
    if (job.config.userId) {
      const durationSeconds = updatedJob.metadata.duration || 0;
      const mode = job.config.shouldTrackQuota ? 'with_quota_deduction' : 'analytics_only';
      await trackUsage(job.config.userId, 'transcription', durationSeconds, mode);
    }
  } catch (error) {
    const err = error as { message?: string };
    console.error(`[Job ${jobId}] ❌ Failed:`, error);
    JobManager.updateJobStatus(jobId, 'failed', err.message || 'Unknown error');

    // Clean up on failure
    const failedJob = JobManager.getJob(jobId);
    if (failedJob && failedJob.chunks.length > 0) {
      try {
        await cleanupChunks(failedJob.chunks);
      } catch (cleanupError) {
        console.warn(`[Job ${jobId}] Failed to clean up chunks:`, cleanupError);
      }
    }
  }
}
