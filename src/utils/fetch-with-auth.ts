/**
 * Fetch with Clerk authentication token automatically included
 */

/**
 * Fetch with Clerk authentication token automatically included
 *
 * @param getToken - Clerk's getToken function from useAuth()
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param timeout - Optional timeout in ms
 */
export async function fetchWithAuth(
  getToken: (() => Promise<string | null>) | null,
  url: string,
  options: RequestInit = {},
  timeout?: number
): Promise<Response> {
  const headers = new Headers(options.headers);

  // Add Clerk session token if available
  if (getToken) {
    try {
      const token = await getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (error) {
      console.warn('Failed to get Clerk session token:', error);
      // Continue without token - let the API reject if auth is required
    }
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Also send cookies as fallback
  };

  // Use fetch with timeout if specified
  if (timeout) {
    return fetchWithTimeout(url, fetchOptions, timeout);
  }

  return fetch(url, fetchOptions);
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}
