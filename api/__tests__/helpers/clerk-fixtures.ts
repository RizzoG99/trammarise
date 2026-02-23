/**
 * Clerk Test Fixtures
 *
 * Reusable mock data for Clerk objects used across test files.
 * These fixtures provide consistent, type-safe mock data for testing
 * Clerk webhooks, user objects, and authentication flows.
 */

/**
 * Clerk User Object (from webhook payload)
 */
export interface ClerkUser {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
    verification?: {
      status: string;
      strategy: string;
    };
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  profile_image_url?: string;
  username?: string | null;
  primary_email_address_id?: string;
  created_at?: number;
  updated_at?: number;
}

/**
 * Clerk Webhook Event
 */
export interface ClerkWebhookEvent {
  type: string;
  data: ClerkUser | unknown;
  object?: string;
  timestamp?: number;
}

/**
 * Mock Clerk User
 *
 * @param overrides - Partial user data to override defaults
 * @returns A complete mock Clerk user object
 */
export function mockClerkUser(overrides: Partial<ClerkUser> = {}): ClerkUser {
  const now = Date.now();
  const emailId = overrides.email_addresses?.[0]?.id || 'idn_test_email_123';

  return {
    id: overrides.id || 'user_test_123',
    email_addresses: overrides.email_addresses || [
      {
        id: emailId,
        email_address: 'test@example.com',
        verification: {
          status: 'verified',
          strategy: 'email_link',
        },
      },
    ],
    first_name: overrides.first_name !== undefined ? overrides.first_name : 'John',
    last_name: overrides.last_name !== undefined ? overrides.last_name : 'Doe',
    image_url:
      overrides.image_url !== undefined
        ? overrides.image_url
        : 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCJ9',
    profile_image_url:
      overrides.profile_image_url || 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCJ9',
    username: overrides.username !== undefined ? overrides.username : null,
    primary_email_address_id: overrides.primary_email_address_id || emailId,
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
    ...overrides,
  };
}

/**
 * Mock Clerk Webhook Event
 *
 * @param type - Event type (e.g., 'user.created', 'user.updated', 'user.deleted')
 * @param userData - User data to include in the event
 * @returns A complete mock Clerk webhook event
 */
export function mockClerkWebhookEvent(
  type: 'user.created' | 'user.updated' | 'user.deleted' | string,
  userData: Partial<ClerkUser> = {}
): ClerkWebhookEvent {
  return {
    type,
    data: mockClerkUser(userData),
    object: 'event',
    timestamp: Date.now(),
  };
}

/**
 * Mock Clerk User Created Event
 *
 * Convenience function for the most common Clerk webhook event
 *
 * @param userData - Partial user data to override defaults
 * @returns A mock user.created webhook event
 */
export function mockClerkUserCreatedEvent(userData: Partial<ClerkUser> = {}): ClerkWebhookEvent {
  return mockClerkWebhookEvent('user.created', userData);
}

/**
 * Mock Clerk User Updated Event
 *
 * @param userData - Partial user data to override defaults
 * @returns A mock user.updated webhook event
 */
export function mockClerkUserUpdatedEvent(userData: Partial<ClerkUser> = {}): ClerkWebhookEvent {
  return mockClerkWebhookEvent('user.updated', userData);
}

/**
 * Mock Clerk User Deleted Event
 *
 * @param userId - User ID to delete
 * @returns A mock user.deleted webhook event
 */
export function mockClerkUserDeletedEvent(userId: string = 'user_test_123'): ClerkWebhookEvent {
  return {
    type: 'user.deleted',
    data: {
      id: userId,
      deleted: true,
    },
    object: 'event',
    timestamp: Date.now(),
  };
}

/**
 * Mock Svix Headers
 *
 * Creates mock Svix webhook headers for testing webhook verification
 *
 * @returns Mock Svix headers object
 */
export function mockSvixHeaders(): Record<string, string> {
  return {
    'svix-id': `msg_test_${Date.now()}`,
    'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
    'svix-signature': 'v1,mock_signature_for_testing',
  };
}

/**
 * Mock Auth User (from requireAuth middleware)
 *
 * @param overrides - Partial auth user data to override defaults
 * @returns Mock authenticated user object
 */
export function mockAuthUser(overrides: { userId?: string; clerkId?: string } = {}): {
  userId: string;
  clerkId: string;
} {
  return {
    userId: overrides.userId || 'user-uuid-123',
    clerkId: overrides.clerkId || 'user_test_123',
  };
}
