"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/transcribe-job/[jobId]/status.ts
var status_exports = {};
__export(status_exports, {
  default: () => handler
});
module.exports = __toCommonJS(status_exports);

// api/_utils/job-manager.ts
var import_uuid = require("uuid");

// api/_types/job.ts
var JOB_SAFEGUARDS = {
  /** Maximum total retries across all chunks */
  MAX_TOTAL_RETRIES: 20,
  /** Maximum number of auto-splits allowed */
  MAX_SPLITS: 2,
  /** Maximum job age in milliseconds (2 hours) */
  MAX_JOB_AGE: 2 * 60 * 60 * 1e3,
  /** Job cleanup interval in milliseconds (5 minutes) */
  CLEANUP_INTERVAL: 5 * 60 * 1e3
};

// api/_utils/job-manager.ts
var JobManagerClass = class {
  jobs = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor() {
    this.startCleanup();
  }
  /**
   * Create a new transcription job
   */
  createJob(config, metadata) {
    const jobId = (0, import_uuid.v4)();
    const job = {
      jobId,
      status: "pending",
      config,
      metadata: {
        ...metadata,
        createdAt: /* @__PURE__ */ new Date()
      },
      chunks: [],
      chunkStatuses: [],
      progress: 0,
      completedChunks: 0,
      totalRetries: 0,
      chunkingSplits: 0,
      lastUpdated: /* @__PURE__ */ new Date(),
      userId: config.userId
      // Store userId for ownership validation
    };
    this.jobs.set(jobId, job);
    console.log(
      `[Job Manager] Created job ${jobId} (mode: ${config.mode}, duration: ${metadata.duration.toFixed(2)}s, userId: ${config.userId || "none"})`
    );
    return job;
  }
  /**
   * Initialize chunks for a job
   */
  initializeChunks(jobId, chunks) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.chunks = chunks;
    job.metadata.totalChunks = chunks.length;
    job.chunkStatuses = chunks.map(() => ({
      status: "pending",
      retryCount: 0,
      wasSplit: false,
      lastUpdated: /* @__PURE__ */ new Date()
    }));
    job.lastUpdated = /* @__PURE__ */ new Date();
    console.log(`[Job Manager] Initialized ${chunks.length} chunks for job ${jobId}`);
  }
  /**
   * Get a job by ID
   */
  getJob(jobId) {
    return this.jobs.get(jobId);
  }
  /**
   * Update job status
   */
  updateJobStatus(jobId, status, error) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.status = status;
    job.lastUpdated = /* @__PURE__ */ new Date();
    if (error) {
      job.error = error;
    }
    if (status === "completed" || status === "failed") {
      job.metadata.completedAt = /* @__PURE__ */ new Date();
      job.metadata.processingTime = job.metadata.completedAt.getTime() - job.metadata.createdAt.getTime();
      console.log(
        `[Job Manager] Job ${jobId} ${status} (processing time: ${(job.metadata.processingTime / 1e3).toFixed(2)}s)`
      );
    }
  }
  /**
   * Update chunk status
   */
  updateChunkStatus(jobId, chunkIndex, updates) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    if (chunkIndex < 0 || chunkIndex >= job.chunkStatuses.length) {
      throw new Error(`Invalid chunk index ${chunkIndex} for job ${jobId}`);
    }
    const chunkStatus = job.chunkStatuses[chunkIndex];
    Object.assign(chunkStatus, updates);
    chunkStatus.lastUpdated = /* @__PURE__ */ new Date();
    job.completedChunks = job.chunkStatuses.filter((cs) => cs.status === "completed").length;
    job.progress = Math.floor(job.completedChunks / job.metadata.totalChunks * 100);
    job.lastUpdated = /* @__PURE__ */ new Date();
  }
  /**
   * Set job transcript
   */
  setJobTranscript(jobId, transcript) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.transcript = transcript;
    job.lastUpdated = /* @__PURE__ */ new Date();
  }
  /**
   * Set job utterances (for speaker diarization)
   */
  setJobUtterances(jobId, utterances) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.utterances = utterances;
    job.lastUpdated = /* @__PURE__ */ new Date();
  }
  /**
   * Set job segments (Whisper API segments for accurate syncing)
   */
  setJobSegments(jobId, segments) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    job.segments = segments;
    job.lastUpdated = /* @__PURE__ */ new Date();
  }
  /**
   * Delete a job
   */
  deleteJob(jobId) {
    this.jobs.delete(jobId);
    console.log(`[Job Manager] Deleted job ${jobId}`);
  }
  /**
   * Get all jobs (for debugging)
   */
  getAllJobs() {
    return Array.from(this.jobs.values());
  }
  /**
   * Get job status response for API
   */
  getJobStatusResponse(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return null;
    }
    const response = {
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      completedChunks: job.completedChunks,
      totalChunks: job.metadata.totalChunks,
      metadata: {
        filename: job.metadata.filename,
        duration: job.metadata.duration,
        mode: job.config.mode,
        createdAt: job.metadata.createdAt,
        completedAt: job.metadata.completedAt
      }
    };
    if (job.transcript) {
      response.transcript = job.transcript;
    }
    if (job.utterances) {
      response.utterances = job.utterances;
    }
    if (job.segments) {
      response.segments = job.segments;
    }
    if (job.error) {
      response.error = job.error;
    }
    if (job.status === "transcribing" && job.completedChunks > 0) {
      const elapsed = Date.now() - job.metadata.createdAt.getTime();
      const avgTimePerChunk = elapsed / job.completedChunks;
      const remainingChunks = job.metadata.totalChunks - job.completedChunks;
      response.estimatedTimeRemaining = Math.ceil(avgTimePerChunk * remainingChunks / 1e3);
    }
    return response;
  }
  /**
   * Start cleanup interval to remove old jobs
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, JOB_SAFEGUARDS.CLEANUP_INTERVAL);
  }
  /**
   * Clean up old jobs
   */
  cleanup() {
    const now = Date.now();
    const jobsToDelete = [];
    for (const [jobId, job] of this.jobs.entries()) {
      const age = now - job.metadata.createdAt.getTime();
      if (age > JOB_SAFEGUARDS.MAX_JOB_AGE) {
        jobsToDelete.push(jobId);
      }
    }
    if (jobsToDelete.length > 0) {
      console.log(`[Job Manager] Cleaning up ${jobsToDelete.length} old jobs`);
      for (const jobId of jobsToDelete) {
        this.deleteJob(jobId);
      }
    }
  }
  /**
   * Stop cleanup interval (for testing)
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  /**
   * Restart cleanup interval (for testing - needed when switching timer modes)
   */
  restartCleanup() {
    this.stopCleanup();
    this.startCleanup();
  }
  /**
   * Clear all jobs (for testing)
   */
  clearAllJobs() {
    this.jobs.clear();
  }
  /**
   * Get job count
   */
  getJobCount() {
    return this.jobs.size;
  }
  /**
   * Validate that a user owns a job
   *
   * @param jobId - Job ID to check
   * @param userId - User ID to validate
   * @returns true if user owns the job, false otherwise
   */
  validateOwnership(jobId, userId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      return false;
    }
    if (!job.userId) {
      return true;
    }
    return job.userId === userId;
  }
};
var JobManager = new JobManagerClass();

// api/_lib/supabase-admin.ts
var import_supabase_js = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Supabase admin credentials not found. Server-side operations will fail.");
}
var supabaseAdmin = (0, import_supabase_js.createClient)(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// api/_middleware/auth.ts
var AuthError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
};
async function requireAuth(req) {
  const authHeader = req.headers["authorization"];
  const raw = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const token = raw?.startsWith("Bearer ") ? raw.slice(7) : null;
  if (!token) {
    throw new AuthError("Missing authorization token", 401);
  }
  const {
    data: { user },
    error
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new AuthError("Invalid or expired token", 401);
  }
  return { userId: user.id };
}

// api/transcribe-job/[jobId]/status.ts
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { jobId } = req.query;
    if (!jobId || typeof jobId !== "string") {
      return res.status(400).json({ error: "Missing or invalid job ID" });
    }
    const { userId } = await requireAuth(req);
    if (!JobManager.validateOwnership(jobId, userId)) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to access this job"
      });
    }
    const jobStatus = JobManager.getJobStatusResponse(jobId);
    if (!jobStatus) {
      return res.status(404).json({ error: "Job not found" });
    }
    return res.status(200).json(jobStatus);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    const err = error;
    console.error("[Job Status API] Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message || "Unknown error"
    });
  }
}
