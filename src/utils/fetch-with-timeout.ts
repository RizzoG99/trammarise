/**
 * Fetch with timeout support using AbortController.
 *
 * Wraps native fetch with automatic timeout handling.
 * Throws descriptive error when request times out.
 *
 * @param url - URL to fetch
 * @param options - Fetch request options
 * @param timeout - Timeout in milliseconds
 * @returns Response from fetch
 * @throws Error with "Request timeout" message on timeout
 * @throws Original error on other fetch failures
 *
 * @example
 * ```ts
 * const response = await fetchWithTimeout(
 *   'https://api.example.com/data',
 *   { method: 'POST', body: formData },
 *   30000 // 30 second timeout
 * );
 * ```
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  }
}
