---
name: api-integration-architect
description: Robust patterns for AI service interactions and API calls.
---

# API Integration Architect

## Overview

This skill defines patterns for reliable API interactions, specifically tailored for LLM/AI services which may have long latencies, streaming responses, or occasional failures.

## Core Patterns

### 1. Streaming Responses

- **Pattern:** Use `fetch` with `ReadableStream` readers for LLM outputs.
- **Implementation:**
  - Loop through `reader.read()`.
  - Decode chunks `TextDecoder`.
  - Update UI incrementally (append text to state).
- **Why:** Reduces perceived latency for the user significantly compared to waiting for the full response.

### 2. Error Handling & Retries

- **Transient Failures:** Implement exponential backoff retries for 5xx errors or network timeouts.
- **Error Boundaries:** Wrap API-dependent components in Error Boundaries to prevent full app crashes.
- **User Feedback:** Always clearly communicate error states (e.g., "Retrying...", "Connection failed").

### 3. Data Fetching (React Query / SWR)

- **Recommendation:** Use libraries like TanStack Query (React Query) for standard REST fetching.
- **Benefits:** Caching, auto-refetching on window focus, optimistic updates.
- **Query Keys:** unique and descriptive (e.g., `['summary', fileId, language]`).

### 4. AbortControllers

- **Cancellation:** Always forward the `AbortSignal` to fetch requests.
- **Scenario:** If a user navigates away or cancels navigation, the pending large LLM request should be aborted to save resources.
  ```typescript
  useEffect(() => {
    const abortController = new AbortController();
    fetchData({ signal: abortController.signal });
    return () => abortController.abort();
  }, []);
  ```
