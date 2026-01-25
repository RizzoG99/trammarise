# Test Suite Quick Start Guide

## 🚀 Running Tests

### Run All Tests

```bash
npx vitest run --config vitest.api.config.ts
```

### Run Specific Test Category

**Unit Tests:**

```bash
npx vitest run --config vitest.api.config.ts api/utils/__tests__/
```

**Integration Tests:**

```bash
npx vitest run --config vitest.api.config.ts api/__tests__/integration/
```

**Edge Cases:**

```bash
npx vitest run --config vitest.api.config.ts api/__tests__/edge-cases.test.ts
```

**API Endpoints:**

```bash
npx vitest run --config vitest.api.config.ts api/__tests__/endpoints/
```

### Run Single Test File

```bash
npx vitest run --config vitest.api.config.ts api/utils/__tests__/job-manager.test.ts
```

### Watch Mode (Auto-rerun on changes)

```bash
npx vitest --config vitest.api.config.ts
```

### Coverage Report

```bash
npx vitest run --config vitest.api.config.ts --coverage
```

---

## 📁 Test File Structure

```
api/
├── __tests__/
│   ├── integration/
│   │   ├── transcribe-balanced.test.ts      # TC-01, TC-03, TC-05, TC-06, TC-07
│   │   ├── transcribe-best-quality.test.ts  # TC-02, TC-04, TC-05
│   │   └── rate-limiting.test.ts            # TC-RL-01 through TC-RL-05
│   ├── endpoints/
│   │   ├── transcribe.test.ts               # POST /api/transcribe
│   │   ├── transcribe-job-status.test.ts    # GET /api/transcribe-job/[jobId]/status
│   │   └── transcribe-job-cancel.test.ts    # POST /api/transcribe-job/[jobId]/cancel
│   ├── edge-cases.test.ts                   # Edge cases and error scenarios
│   └── README.md                            # Full documentation
├── utils/
│   ├── __tests__/
│   │   ├── audio-chunker.test.ts            # Chunking logic
│   │   ├── job-manager.test.ts              # Job lifecycle
│   │   ├── rate-limit-governor.test.ts      # Rate limiting
│   │   ├── chunk-processor.test.ts          # Chunk processing
│   │   └── transcript-assembler.test.ts     # Transcript assembly
│   └── __test-helpers__/
│       ├── mock-audio-generator.ts          # Audio buffer mocks
│       ├── mock-openai-api.ts               # OpenAI API mocks
│       ├── mock-ffmpeg.ts                   # FFmpeg mocks
│       └── test-fixtures.ts                 # Test data & utilities
├── vitest.setup.ts                          # Global test setup
└── vitest.api.config.ts                     # Vitest configuration
```

---

## 🧪 Test Categories

### Unit Tests (5 files, ~99 tests)

- Test individual functions in isolation
- Heavy mocking of external dependencies
- Fast execution (<1 second)

### Integration Tests (3 files, ~20 tests)

- Test complete workflows end-to-end
- Mock only external services (OpenAI, FFmpeg)
- Verify component interactions

### Edge Cases (1 file, ~25 tests)

- Test unusual scenarios and boundaries
- Error conditions and recovery
- Memory leaks and cleanup

### API Endpoints (3 files, ~12 tests)

- Test HTTP request/response handling
- Validate status codes and errors
- Multipart form parsing

---

## 📊 Current Test Status

**Total**: 146 tests

- ✅ **Passing**: 84 (57.5%)
- ❌ **Failing**: 62 (42.5%)

Most failures are due to:

1. Missing utility methods (easy fixes)
2. Timer/async issues (configuration)
3. Implementation differences from spec

---

## 🔍 Finding Specific Tests

### By Test Case ID (from functional analysis)

**TC-01**: Large File Upload (Balanced)

```bash
npx vitest run --config vitest.api.config.ts api/__tests__/integration/transcribe-balanced.test.ts -t "TC-01"
```

**TC-RL-02**: Rate Limit Trigger

```bash
npx vitest run --config vitest.api.config.ts api/__tests__/integration/rate-limiting.test.ts -t "TC-RL-02"
```

### By Component

**Audio Chunker:**

```bash
npx vitest run --config vitest.api.config.ts api/utils/__tests__/audio-chunker.test.ts
```

**Rate Limiting:**

```bash
npx vitest run --config vitest.api.config.ts api/utils/__tests__/rate-limit-governor.test.ts
npx vitest run --config vitest.api.config.ts api/__tests__/integration/rate-limiting.test.ts
```

---

## 🛠️ Mock Utilities

### Generate Mock Audio

```typescript
import { generateMockAudio, LONG_AUDIO_90MIN } from '../__test-helpers__/mock-audio-generator';

// Generate custom duration
const audio = generateMockAudio({ durationSeconds: 600, format: 'mp3' });

// Use pre-defined fixture
const longAudio = LONG_AUDIO_90MIN; // 90 minutes
```

### Mock OpenAI API

```typescript
import { MockOpenAIAPI } from '../__test-helpers__/mock-openai-api';

const mockAPI = new MockOpenAIAPI({
  transcriptGenerator: (index) => `Chunk ${index} transcript`,
});

// Configure specific failures
mockAPI.failChunk(5);
mockAPI.return429OnChunk(3);

global.fetch = mockAPI.createMockFetch();
```

### Track Concurrency

```typescript
import { ConcurrencyTracker } from '../__test-helpers__/test-fixtures';

const tracker = new ConcurrencyTracker();

// In async operation:
tracker.start();
await doWork();
tracker.end();

// Verify
expect(tracker.getMaxConcurrency()).toBe(4);
```

---

## 📝 Writing New Tests

### Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { JobManager } from '../../utils/job-manager';

describe('My New Feature', () => {
  beforeEach(() => {
    // Reset state before each test
    JobManager.clearAllJobs();
  });

  it('should do something', async () => {
    // Arrange
    const job = JobManager.createJob(/* ... */);

    // Act
    const result = await myFunction(job);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Best Practices

1. **Use descriptive test names** that explain what is being tested
2. **One assertion per test** when possible (or related assertions)
3. **Mock external dependencies** (FFmpeg, OpenAI, filesystem)
4. **Clean up after tests** (use `beforeEach` and `afterEach`)
5. **Use fake timers** for time-based operations (`vi.useFakeTimers()`)
6. **Test edge cases**: empty inputs, null values, boundary conditions

---

## 🐛 Debugging Tests

### Run Single Test

```bash
npx vitest run --config vitest.api.config.ts -t "test name pattern"
```

### View Full Output

```bash
npx vitest run --config vitest.api.config.ts --reporter=verbose
```

### Debug with Chrome DevTools

```bash
npx vitest --config vitest.api.config.ts --inspect-brk
```

Then open `chrome://inspect` in Chrome.

---

## 📚 Additional Resources

- **Full Documentation**: `api/__tests__/README.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Final Report**: `TEST_IMPLEMENTATION_COMPLETE.md`
- **Functional Analysis**: `docs/functional-analysis/audio-transcription-functional-analysis.md`

---

## ✅ Common Commands

```bash
# Run all tests
npx vitest run --config vitest.api.config.ts

# Watch mode
npx vitest --config vitest.api.config.ts

# Coverage
npx vitest run --config vitest.api.config.ts --coverage

# Specific file
npx vitest run --config vitest.api.config.ts api/utils/__tests__/job-manager.test.ts

# Pattern matching
npx vitest run --config vitest.api.config.ts -t "should create job"

# Update snapshots
npx vitest run --config vitest.api.config.ts -u
```

---

_Quick Start Guide - Updated: 2026-01-19_
