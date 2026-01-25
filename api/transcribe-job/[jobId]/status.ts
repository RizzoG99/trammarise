/**
 * GET /api/transcribe-job/[jobId]/status
 *
 * Returns the current status of a transcription job.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JobManager } from '../../utils/job-manager';

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

    // Get job status
    const jobStatus = JobManager.getJobStatusResponse(jobId);

    if (!jobStatus) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Return job status
    return res.status(200).json(jobStatus);
  } catch (error) {
    const err = error as { message?: string };
    console.error('[Job Status API] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: err.message || 'Unknown error',
    });
  }
}
