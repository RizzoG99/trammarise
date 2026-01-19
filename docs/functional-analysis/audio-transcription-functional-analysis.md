# Audio Transcription System

## Functional Analysis, Chunking Strategy & Test Cases

---

## 1. Scope

This document defines the functional behavior of the **audio upload and recording pipeline** for a web-based transcription and summarization system.

The system supports two user-selectable modes:

- **Standard (Balanced)** using `gpt-4o-mini-transcribe`
- **Best Quality** using `gpt-4o-transcribe`

The user is abstracted from:

- Audio size limits
- Chunking logic
- Retry mechanisms
- Model constraints

---

## 2. Core Principle

> The user uploads or records audio of any duration.  
> The system guarantees full transcription and summarization via internal chunking, retries, and reconstruction.

---

## 3. Audio Input Functional Analysis

### 3.1 Supported Inputs

**Upload**

- MP3, WAV, M4A, OGG, WebM

**Recording**

- Browser microphone (MediaRecorder)
- Mobile and desktop supported

---

### 3.2 Audio Normalization (Pre-Processing)

All audio inputs are normalized before chunking:

| Parameter   | Value  |
| ----------- | ------ |
| Format      | WAV    |
| Channels    | Mono   |
| Sample Rate | 16 kHz |
| Bit Depth   | 16-bit |

Purpose:

- Reduce variance
- Ensure model compatibility
- Stable chunk boundaries

---

## 4. Chunking Strategy

### 4.1 General Chunking Rules (All Modes)

- Chunking is **time-based**, not size-based
- Chunks are sequential and non-overlapping
- Each chunk includes:
  - Chunk index
  - Start timestamp
  - End timestamp
- No silence trimming between chunks (handled later)

---

## 5. Balanced Mode (Standard)

### Model

`gpt-4o-mini-transcribe`

### Objective

- Fast processing
- Cost efficiency
- Acceptable accuracy

---

### 5.1 Chunk Configuration (Balanced)

| Parameter           | Value                |
| ------------------- | -------------------- |
| Chunk Duration      | **3 minutes (180s)** |
| Overlap             | **0 seconds**        |
| Max Parallel Chunks | **4**                |
| Max Audio Length    | Unlimited (chunked)  |

Rationale:

- Small chunks reduce failure impact
- Parallel processing improves latency
- Lower context dependency tolerated

---

### 5.2 Processing Flow (Balanced)

1. Normalize audio
2. Split into 180s chunks
3. Dispatch chunks in parallel (max 4)
4. Transcribe each chunk independently
5. Merge transcripts in chronological order
6. Run light AI cleanup pass
7. Generate summary

---

### 5.3 Retry Strategy (Balanced)

#### Per-Chunk Retry Policy

| Parameter   | Value                     |
| ----------- | ------------------------- |
| Max Retries | 3                         |
| Retry Delay | Exponential (2s, 5s, 10s) |
| Retry Scope | Single chunk only         |

#### Failure Handling

- If a chunk fails after retries:
  - Mark as `FAILED`
  - Attempt **one final retry** with chunk split into **2 × 90s**
- If still failing:
  - Abort job
  - Return error with chunk index

---

## 6. Best Quality Mode

### Model

`gpt-4o-transcribe`

### Objective

- Maximum accuracy
- Context preservation
- Professional-grade transcription

---

### 6.1 Chunk Configuration (Best Quality)

| Parameter           | Value                 |
| ------------------- | --------------------- |
| Chunk Duration      | **10 minutes (600s)** |
| Overlap             | **15 seconds**        |
| Max Parallel Chunks | **1 (sequential)**    |
| Max Audio Length    | Unlimited (chunked)   |

Rationale:

- Larger chunks preserve linguistic context
- Overlap avoids sentence loss at boundaries
- Sequential processing avoids semantic drift

---

### 6.2 Processing Flow (Best Quality)

1. Normalize audio
2. Split into 600s chunks with 15s overlap
3. Process chunks sequentially
4. Transcribe each chunk
5. Remove duplicated overlap segments
6. Run deep AI reconciliation pass:
   - Sentence continuity
   - Terminology normalization
   - Speaker coherence
7. Generate detailed summary

---

### 6.3 Retry Strategy (Best Quality)

#### Per-Chunk Retry Policy

| Parameter   | Value            |
| ----------- | ---------------- |
| Max Retries | 2                |
| Retry Delay | Linear (5s, 10s) |
| Retry Scope | Single chunk     |

#### Failure Handling

- On repeated failure:
  - Split failed chunk into **2 × 300s**
  - Retry sequentially
- If any sub-chunk fails:
  - Abort job
  - Return deterministic error

---

## 7. Global Retry & Resilience Rules

### 7.1 Network Failures

- Chunk requests are idempotent
- Network timeout triggers retry
- Partial progress is persisted

---

### 7.2 System Crash Recovery

- Completed chunk transcriptions are cached
- On restart:
  - Resume from first missing chunk
  - No reprocessing of completed chunks

---

### 7.3 User Cancellation

- All in-flight requests aborted
- Temporary files deleted
- No partial transcript returned

---

## 8. Transcription Reassembly Rules

### 8.1 Balanced Mode Merge

- Concatenate transcripts
- Normalize punctuation
- Fix broken sentences
- No semantic rewriting

---

### 8.2 Best Quality Merge

- Remove overlap duplication
- Resolve sentence continuity
- Normalize vocabulary
- Preserve speaker flow
- Ensure narrative coherence

---

## 9. Test Cases

---

### TC-01: Large File Upload (Balanced)

**Input**: 90-minute MP3  
**Expected**:

- 30 chunks created
- Parallel processing
- Successful transcription
- No user-visible size limit

---

### TC-02: Large File Upload (Best Quality)

**Input**: 2h WAV  
**Expected**:

- 12 chunks created
- Sequential processing
- Context preserved across chunks

---

### TC-03: Chunk Failure Recovery (Balanced)

**Input**: Chunk #5 fails  
**Expected**:

- Retry up to 3 times
- Auto-split into 2 sub-chunks
- Job continues

---

### TC-04: Chunk Failure Recovery (Best Quality)

**Input**: Chunk #3 fails  
**Expected**:

- Retry twice
- Split into 2 × 300s
- Abort if sub-chunk fails

---

### TC-05: Boundary Sentence Split

**Input**: Sentence crosses chunk boundary  
**Expected**:

- Balanced: sentence reconstructed
- Best Quality: seamless continuity

---

### TC-06: Network Interruption

**Input**: Network loss mid-processing  
**Expected**:

- Resume from last completed chunk
- No duplicate transcription

---

### TC-07: User Cancellation

**Input**: Cancel during chunk #4  
**Expected**:

- Processing stops immediately
- No transcript generated
- Temporary data deleted

---

## 10. Non-Goals (Explicit)

- No real-time transcription
- No user-visible chunk configuration
- No manual retry controls
- No partial transcript delivery

---

## 11. UX Guarantee

> The system must feel unlimited, predictable, and reliable,  
> regardless of audio duration or quality mode.

The complexity lives **inside the engine**, not in the user’s mind.

# OpenAI Rate-Limit Alignment

## Chunking, Concurrency & Backoff Strategy

---

## 12. Design Goal

Ensure the transcription system:

- Never exceeds OpenAI rate limits
- Degrades gracefully under load
- Avoids cascading failures
- Preserves user trust with predictable behavior

All rate-limit handling is **internal and invisible** to the user.

---

## 13. OpenAI Rate-Limit Reality (Abstracted)

The system must assume the following **non-deterministic constraints**:

- Requests per minute (RPM) limits
- Concurrent request caps
- Temporary throttling (HTTP 429)
- Burst penalties for parallel requests
- Different limits per model

**Important**: Limits may change without notice.  
The system must adapt dynamically.

---

## 14. Rate-Limit Control Strategy

### 14.1 Centralized Request Governor

All OpenAI calls pass through a **Rate Limit Governor**.

Responsibilities:

- Enforce per-model concurrency caps
- Queue excess chunk requests
- Apply adaptive backoff
- Prevent retry storms

---

## 15. Model-Specific Concurrency Rules

### 15.1 Balanced Mode

(`gpt-4o-mini-transcribe`)

| Parameter               | Value   |
| ----------------------- | ------- |
| Max Concurrent Requests | **4**   |
| Max Burst Requests      | **6**   |
| Retry Jitter            | Enabled |
| Queue Type              | FIFO    |

Rationale:

- Lightweight model tolerates concurrency
- Cost-efficient parallelism
- Lower penalty on retries

---

### 15.2 Best Quality Mode

(`gpt-4o-transcribe`)

| Parameter               | Value             |
| ----------------------- | ----------------- |
| Max Concurrent Requests | **1**             |
| Max Burst Requests      | **1**             |
| Retry Jitter            | Enabled           |
| Queue Type              | Strict Sequential |

Rationale:

- Higher cost per request
- More sensitive to throttling
- Context preservation requires ordering

---

## 16. Rate-Limit Aware Chunk Dispatch

### 16.1 Dispatch Algorithm (Simplified)

for chunk in audio_chunks:
wait until governor allows request
send request
await response

Balanced mode may dispatch multiple chunks concurrently  
Best Quality mode dispatches **exactly one at a time**

---

## 17. HTTP 429 Handling Strategy

### 17.1 Detection

A request is considered rate-limited if:

- HTTP status = 429
- OR OpenAI returns a rate-limit error message

---

### 17.2 Backoff Policy

#### Balanced Mode

| Attempt | Delay        |
| ------- | ------------ |
| 1st     | 2s + jitter  |
| 2nd     | 5s + jitter  |
| 3rd     | 10s + jitter |

After 3 failures:

- Chunk is split into smaller sub-chunks
- Retries reset

---

#### Best Quality Mode

| Attempt | Delay |
| ------- | ----- |
| 1st     | 5s    |
| 2nd     | 10s   |

After 2 failures:

- Chunk split into 2 × smaller chunks
- Sequential retry only

---

## 18. Adaptive Load Shedding

### 18.1 Trigger Conditions

The system enters **degraded mode** if:

- > 30% of requests receive 429s
- Average retry delay exceeds 10s
- Queue length exceeds safe threshold

---

### 18.2 Degraded Mode Behavior

| Mode         | Adjustment                                     |
| ------------ | ---------------------------------------------- |
| Balanced     | Reduce concurrency from 4 → 2                  |
| Best Quality | No change (already sequential)                 |
| UI           | Show “High demand, processing may take longer” |

No failures are surfaced unless unavoidable.

---

## 19. Retry Storm Prevention

To avoid self-inflicted denial of service:

- Retries are **serialized**
- No simultaneous retry bursts
- Jitter is mandatory for parallel retries
- Global retry cap enforced per job

---

## 20. Job-Level Safeguards

### 20.1 Global Job Limits

| Parameter               | Value             |
| ----------------------- | ----------------- |
| Max Total Retries (Job) | 20                |
| Max Processing Time     | 3× audio duration |
| Max Chunk Re-splits     | 2                 |

If exceeded:

- Job fails deterministically
- User receives a clear error message

---

## 21. Idempotency Guarantees

Each chunk request includes:

- Job ID
- Chunk index
- Chunk hash

This ensures:

- Safe retries
- No duplicate processing
- Deterministic reassembly

---

## 22. Test Cases (Rate-Limit Focused)

---

### TC-RL-01: Burst Upload (Balanced)

**Scenario**: 4 chunks dispatched simultaneously  
**Expected**:

- All requests accepted
- No 429s
- Parallel processing succeeds

---

### TC-RL-02: Rate Limit Trigger (Balanced)

**Scenario**: 429 on chunk #3  
**Expected**:

- Exponential backoff applied
- Other chunks continue
- No retry storm

---

### TC-RL-03: Sequential Enforcement (Best Quality)

**Scenario**: Attempt parallel dispatch  
**Expected**:

- Governor blocks parallel request
- Only one in-flight request allowed

---

### TC-RL-04: Sustained Throttling

**Scenario**: Multiple 429s over time  
**Expected**:

- System enters degraded mode
- Concurrency reduced
- UI warning displayed

---

### TC-RL-05: Retry Cap Exceeded

**Scenario**: Repeated failures across chunks  
**Expected**:

- Job terminates cleanly
- No partial transcript returned
- Clear error state

---

## 23. UX Contract

> Rate limits slow the system, never break it.

The user may wait longer,  
but they never lose data,  
never see cryptic errors,  
and never need to understand why.

---

## 24. Engineering Summary

- Chunking absorbs size limits
- Governor absorbs rate limits
- Retries absorb instability
- UX absorbs none of it

The system bends.  
It does not snap.
