/**
 * POST /api/transcribe-job/[jobId]/cancel
 *
 * Cancels a transcription job and cleans up resources.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JobManager } from '../../utils/job-manager';
import { cleanupChunks } from '../../utils/audio-chunker';
import { requireAuth, AuthError } from '../../middleware/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract jobId from query parameters (Vercel dynamic route)
    const { jobId } = req.query;

    if (!jobId || typeof jobId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid job ID' });
    }

    // Require authentication
    const { userId } = await requireAuth();

    // Validate job ownership
    if (!JobManager.validateOwnership(jobId, userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to cancel this job',
      });
    }

    // Get job
    const job = JobManager.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job is already completed or failed
    if (job.status === 'completed' || job.status === 'failed') {
      return res.status(400).json({
        error: `Cannot cancel job with status: ${job.status}`,
      });
    }

    // Update job status to cancelled
    JobManager.updateJobStatus(jobId, 'cancelled');

    // Clean up chunk files
    if (job.chunks.length > 0) {
      try {
        await cleanupChunks(job.chunks);
        console.log(`[Job Cancel] Cleaned up ${job.chunks.length} chunk files for job ${jobId}`);
      } catch (error) {
        console.warn('[Job Cancel] Failed to clean up chunk files:', error);
      }
    }

    // Return success
    return res.status(200).json({
      success: true,
      jobId,
      message: 'Job cancelled successfully',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const err = error as { message?: string };
    console.error('[Job Cancel API] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message || 'Unknown error',
    });
  }
}
