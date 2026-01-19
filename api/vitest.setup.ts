/**
 * Vitest Setup for API Tests
 *
 * Global setup, teardown, and mocks for API testing.
 */

import { beforeEach, afterEach, vi } from 'vitest';
import { MockOpenAIAPI } from './utils/__test-helpers__/mock-openai-api';

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-key-12345';
process.env.NODE_ENV = 'test';

// Global mock instances
let mockOpenAI: MockOpenAIAPI;

// Setup before each test
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Create fresh OpenAI mock
  mockOpenAI = new MockOpenAIAPI();
  global.fetch = mockOpenAI.createMockFetch();

  // Use fake timers for precise time control
  vi.useFakeTimers();
});

// Cleanup after each test
afterEach(() => {
  // Clear all timers
  vi.clearAllTimers();

  // Restore real timers
  vi.useRealTimers();

  // Reset OpenAI mock
  if (mockOpenAI) {
    mockOpenAI.reset();
  }
});

// Export utilities for tests to use
export { mockOpenAI };

// Make mock instances available globally for convenience
declare global {
  var mockOpenAI: MockOpenAIAPI;
}

globalThis.mockOpenAI = mockOpenAI;
