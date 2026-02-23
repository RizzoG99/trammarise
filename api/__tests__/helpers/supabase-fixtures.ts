/**
 * Supabase Test Fixtures
 *
 * Reusable mock data for Supabase objects used across test files.
 * These fixtures provide consistent, type-safe mock data for testing
 * database operations, including users, subscriptions, sessions, and usage events.
 */

/**
 * Supabase User Record
 */
export interface SupabaseUser {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase Subscription Record
 */
export interface SupabaseSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  tier: 'free' | 'pro' | 'team';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase Session Record
 */
export interface SupabaseSession {
  id: string;
  session_id: string;
  user_id: string;
  audio_name: string;
  content_type: string;
  language: string;
  transcript: string | null;
  summary: string | null;
  file_size_bytes: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase Usage Event Record
 */
export interface SupabaseUsageEvent {
  id: string;
  user_id: string;
  event_type: 'transcription' | 'summary' | 'chat';
  minutes_consumed: number;
  billing_period: string;
  session_id: string | null;
  created_at: string;
}

/**
 * Mock Supabase User
 *
 * @param overrides - Partial user data to override defaults
 * @returns A complete mock Supabase user record
 */
export function mockSupabaseUser(overrides: Partial<SupabaseUser> = {}): SupabaseUser {
  const now = new Date().toISOString();

  return {
    id: overrides.id || 'user-uuid-123',
    clerk_user_id: overrides.clerk_user_id || 'user_test_123',
    email: overrides.email || 'test@example.com',
    full_name: overrides.full_name !== undefined ? overrides.full_name : 'John Doe',
    avatar_url:
      overrides.avatar_url !== undefined
        ? overrides.avatar_url
        : 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCJ9',
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
  };
}

/**
 * Mock Supabase Subscription
 *
 * @param overrides - Partial subscription data to override defaults
 * @returns A complete mock Supabase subscription record
 */
export function mockSupabaseSubscription(
  overrides: Partial<SupabaseSubscription> = {}
): SupabaseSubscription {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

  return {
    id: overrides.id || 'subscription-uuid-123',
    user_id: overrides.user_id || 'user-uuid-123',
    stripe_subscription_id: overrides.stripe_subscription_id || 'sub_test_123',
    stripe_customer_id: overrides.stripe_customer_id || 'cus_test_123',
    tier: overrides.tier || 'pro',
    status: overrides.status || 'active',
    current_period_start: overrides.current_period_start || now.toISOString(),
    current_period_end: overrides.current_period_end || periodEnd.toISOString(),
    cancel_at_period_end: overrides.cancel_at_period_end ?? false,
    created_at: overrides.created_at || now.toISOString(),
    updated_at: overrides.updated_at || now.toISOString(),
  };
}

/**
 * Mock Supabase Session
 *
 * @param overrides - Partial session data to override defaults
 * @returns A complete mock Supabase session record
 */
export function mockSupabaseSession(overrides: Partial<SupabaseSession> = {}): SupabaseSession {
  const now = new Date().toISOString();

  return {
    id: overrides.id || 'db-session-uuid-123',
    session_id: overrides.session_id || 'session-123',
    user_id: overrides.user_id || 'user-uuid-123',
    audio_name: overrides.audio_name || 'test-recording.mp3',
    content_type: overrides.content_type || 'meeting',
    language: overrides.language || 'en',
    transcript:
      overrides.transcript !== undefined ? overrides.transcript : 'This is a test transcript.',
    summary: overrides.summary !== undefined ? overrides.summary : 'This is a test summary.',
    file_size_bytes: overrides.file_size_bytes !== undefined ? overrides.file_size_bytes : 1024000,
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
  };
}

/**
 * Mock Supabase Usage Event
 *
 * @param overrides - Partial usage event data to override defaults
 * @returns A complete mock Supabase usage event record
 */
export function mockSupabaseUsageEvent(
  overrides: Partial<SupabaseUsageEvent> = {}
): SupabaseUsageEvent {
  const now = new Date();
  const billingPeriod = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  return {
    id: overrides.id || 'usage-uuid-123',
    user_id: overrides.user_id || 'user-uuid-123',
    event_type: overrides.event_type || 'transcription',
    minutes_consumed: overrides.minutes_consumed !== undefined ? overrides.minutes_consumed : 5,
    billing_period: overrides.billing_period || billingPeriod,
    session_id: overrides.session_id !== undefined ? overrides.session_id : 'session-123',
    created_at: overrides.created_at || now.toISOString(),
  };
}

/**
 * Mock Supabase Response (Success)
 *
 * @param data - Data to return in the response
 * @returns A mock successful Supabase response
 */
export function mockSupabaseSuccess<T>(data: T): { data: T; error: null } {
  return { data, error: null };
}

/**
 * Mock Supabase Response (Error)
 *
 * @param message - Error message
 * @param code - Optional error code
 * @returns A mock error Supabase response
 */
export function mockSupabaseError(
  message: string = 'Database error',
  code?: string
): { data: null; error: { message: string; code?: string } } {
  return {
    data: null,
    error: {
      message,
      ...(code && { code }),
    },
  };
}

/**
 * Mock Supabase Query Response
 *
 * Creates a mock response for Supabase queries with pagination support
 *
 * @param data - Array of data items
 * @param count - Optional total count for pagination
 * @returns A mock Supabase query response
 */
export function mockSupabaseQueryResponse<T>(
  data: T[],
  count?: number
): { data: T[]; error: null; count?: number } {
  return {
    data,
    error: null,
    ...(count !== undefined && { count }),
  };
}

/**
 * Create multiple mock usage events
 *
 * Convenience function to generate multiple usage events for testing
 *
 * @param count - Number of events to create
 * @param baseOverrides - Base overrides to apply to all events
 * @returns Array of mock usage events
 */
export function mockSupabaseUsageEvents(
  count: number,
  baseOverrides: Partial<SupabaseUsageEvent> = {}
): SupabaseUsageEvent[] {
  return Array.from({ length: count }, (_, i) =>
    mockSupabaseUsageEvent({
      ...baseOverrides,
      id: `usage-uuid-${i + 1}`,
      minutes_consumed: baseOverrides.minutes_consumed || 5 + i,
    })
  );
}

/**
 * Create multiple mock sessions
 *
 * Convenience function to generate multiple session records for testing
 *
 * @param count - Number of sessions to create
 * @param baseOverrides - Base overrides to apply to all sessions
 * @returns Array of mock session records
 */
export function mockSupabaseSessions(
  count: number,
  baseOverrides: Partial<SupabaseSession> = {}
): SupabaseSession[] {
  return Array.from({ length: count }, (_, i) =>
    mockSupabaseSession({
      ...baseOverrides,
      id: `db-session-uuid-${i + 1}`,
      session_id: `session-${i + 1}`,
      audio_name: `recording-${i + 1}.mp3`,
    })
  );
}
