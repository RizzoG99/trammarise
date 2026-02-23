/**
 * Test Helpers Index
 *
 * Centralized exports for all test fixtures and utilities.
 * Import from this file for cleaner, more maintainable test code.
 *
 * @example
 * ```typescript
 * import {
 *   mockStripeSubscription,
 *   mockClerkUser,
 *   mockSupabaseSession
 * } from '../helpers';
 * ```
 */

// Stripe fixtures
export {
  mockStripeSubscription,
  mockStripePaymentIntent,
  mockStripeCheckoutSession,
  mockStripeCustomer,
  mockStripeWebhookEvent,
} from './stripe-fixtures';

// Clerk fixtures
export {
  mockClerkUser,
  mockClerkWebhookEvent,
  mockClerkUserCreatedEvent,
  mockClerkUserUpdatedEvent,
  mockClerkUserDeletedEvent,
  mockSvixHeaders,
  mockAuthUser,
} from './clerk-fixtures';

export type { ClerkUser, ClerkWebhookEvent } from './clerk-fixtures';

// Supabase fixtures
export {
  mockSupabaseUser,
  mockSupabaseSubscription,
  mockSupabaseSession,
  mockSupabaseUsageEvent,
  mockSupabaseSuccess,
  mockSupabaseError,
  mockSupabaseQueryResponse,
  mockSupabaseUsageEvents,
  mockSupabaseSessions,
} from './supabase-fixtures';

export type {
  SupabaseUser,
  SupabaseSubscription,
  SupabaseSession,
  SupabaseUsageEvent,
} from './supabase-fixtures';
