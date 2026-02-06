import type { VercelRequest, VercelResponse } from '@vercel/node';
import busboy from 'busboy';
import { API_VALIDATION } from '../src/utils/constants';
import { WHISPER_STYLE_PROMPT } from '../src/utils/transcription-prompts';
import {
  getTranscriptionModelForLevel,
  type PerformanceLevel,
} from '../src/types/performance-levels';
import { JobManager } from './utils/job-manager';
import { chunkAudio, cleanupChunks } from './utils/audio-chunker';
import { RateLimitGovernor } from './utils/rate-limit-governor';
import { processChunk } from './utils/chunk-processor';
import { OpenAIProvider } from './providers/openai';
import { TranscriptionProviderFactory } from './providers/factory';
import { assembleTranscript } from './utils/transcript-assembler';
import type { ProcessingMode } from './types/chunking';
import type { JobConfiguration } from './types/job';

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
    let model: string | undefined = undefined;

    let performanceLevel: string | undefined = undefined;
    let enableSpeakerDiarization = false;
    let speakersExpected: number | undefined = undefined;
    let uploadedFilename: string = 'audio.webm';
    let fileSizeExceeded = false;

    const parsePromise = new Promise<void>((resolve, reject) => {
      bb.on('file', (_fieldname, file, info) => {
        const { filename, mimeType } = info;
        uploadedFilename = filename || 'audio.webm';

        // Validate file type
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
        } else if (fieldname === 'model') {
          model = value || undefined;
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

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Narrow audioData type to Buffer (TypeScript needs explicit assertion in async callbacks)
    const audioBuffer: Buffer = audioData;

    // Determine processing mode from performance level
    const mode: ProcessingMode = performanceLevel === 'best_quality' ? 'best_quality' : 'balanced';

    // Determine transcription model
    const transcriptionModel = model
      ? getTranscriptionModelForLevel(model as PerformanceLevel)
      : 'gpt-4o-mini-transcribe';

    // Create job configuration with Whisper style prompt
    const jobConfig: JobConfiguration = {
      apiKey,
      mode,
      model: transcriptionModel,
      language,
      prompt: WHISPER_STYLE_PROMPT, // Use style prompt for clean transcription
      enableSpeakerDiarization,
      speakersExpected,
    };

    // Create job
    const job = JobManager.createJob(jobConfig, {
      filename: uploadedFilename,
      fileSize: audioBuffer.length,
      duration: 0, // Will be updated after chunking
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
    const err = error as { message?: string };
    console.error('[Transcribe API] Error:', error);

    const status = err.message?.includes('File size')
      ? 413
      : err.message?.includes('Invalid file type')
        ? 415
        : err.message?.includes('API key')
          ? 401
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
