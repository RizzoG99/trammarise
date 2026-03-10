import { supabaseClient } from '@/lib/supabase/client';

/**
 * Fetch with Supabase session token automatically included.
 * Use for server-side API calls (transcription, AI, Stripe, API key endpoints).
 * Do NOT use for direct Supabase DB queries — use supabaseClient directly.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  timeout?: number
): Promise<Response> {
  const headers = new Headers(options.headers);

  try {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
  } catch (error) {
    console.warn('Failed to get Supabase session token:', error);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (timeout) {
    return fetchWithTimeout(url, fetchOptions, timeout);
  }

  return fetch(url, fetchOptions);
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
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
