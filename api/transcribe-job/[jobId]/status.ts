/**
 * GET /api/transcribe-job/[jobId]/status
 *
 * Returns the current status of a transcription job.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JobManager } from '../../utils/job-manager';
import { requireAuth, AuthError } from '../../middleware/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract jobId from query parameters (Vercel dynamic route)
    const { jobId } = req.query;

    if (!jobId || typeof jobId !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid job ID' });
    }

    // Require authentication
    const { userId } = await requireAuth(req);

    // Validate job ownership
    if (!JobManager.validateOwnership(jobId, userId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to access this job',
      });
    }

    // Get job status
    const jobStatus = JobManager.getJobStatusResponse(jobId);

    if (!jobStatus) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Return job status
    return res.status(200).json(jobStatus);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    const err = error as { message?: string };
    console.error('[Job Status API] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message || 'Unknown error',
    });
  }
}
