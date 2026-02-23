# Test Helpers & Fixtures

This directory contains reusable mock data generators for consistent testing across all API test files.

## Purpose

These fixtures provide:

- **Consistency**: Same mock data structure across all tests
- **Type Safety**: Full TypeScript support with proper types
- **Maintainability**: Single source of truth for mock data
- **Flexibility**: Easy to override specific fields while keeping sensible defaults

## Available Fixtures

### Stripe Fixtures (`stripe-fixtures.ts`)

Mock Stripe objects for testing payments, subscriptions, and webhooks.

```typescript
import {
  mockStripeSubscription,
  mockStripePaymentIntent,
  mockStripeCheckoutSession,
  mockStripeCustomer,
  mockStripeWebhookEvent,
} from './helpers';

// Basic usage with defaults
const subscription = mockStripeSubscription();

// Override specific fields
const customSubscription = mockStripeSubscription({
  id: 'sub_custom_123',
  status: 'trialing',
  metadata: { userId: 'my-user-id', tier: 'team' },
});

// Create webhook event
const event = mockStripeWebhookEvent('customer.subscription.created', mockStripeSubscription());
```

### Clerk Fixtures (`clerk-fixtures.ts`)

Mock Clerk user objects and webhook events for authentication testing.

```typescript
import {
  mockClerkUser,
  mockClerkWebhookEvent,
  mockClerkUserCreatedEvent,
  mockSvixHeaders,
  mockAuthUser,
} from './helpers';

// Basic user
const user = mockClerkUser();

// Custom user
const customUser = mockClerkUser({
  id: 'user_custom_123',
  email_addresses: [{ id: 'idn_test', email_address: 'custom@example.com' }],
  first_name: 'Jane',
  last_name: 'Smith',
});

// Webhook events
const createdEvent = mockClerkUserCreatedEvent(customUser);
const deletedEvent = mockClerkUserDeletedEvent('user_123');

// Auth middleware mock
const authUser = mockAuthUser({ userId: 'uuid-123', clerkId: 'user_123' });
```

### Supabase Fixtures (`supabase-fixtures.ts`)

Mock Supabase database records for testing database operations.

```typescript
import {
  mockSupabaseUser,
  mockSupabaseSubscription,
  mockSupabaseSession,
  mockSupabaseUsageEvent,
  mockSupabaseSuccess,
  mockSupabaseError,
  mockSupabaseUsageEvents,
} from './helpers';

// Basic records
const user = mockSupabaseUser();
const subscription = mockSupabaseSubscription({ tier: 'pro', status: 'active' });
const session = mockSupabaseSession();

// Usage events
const usageEvent = mockSupabaseUsageEvent({
  event_type: 'transcription',
  minutes_consumed: 10,
});

// Multiple events
const events = mockSupabaseUsageEvents(5); // Creates 5 usage events

// Mock responses
const successResponse = mockSupabaseSuccess(user);
const errorResponse = mockSupabaseError('Database connection error');
```

## Usage in Tests

### Example: Testing Stripe Webhook Handler

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockStripeSubscription, mockStripeWebhookEvent } from '../helpers';

describe('POST /api/webhooks/stripe', () => {
  it('should create subscription record', async () => {
    const subscription = mockStripeSubscription({
      metadata: { userId: 'user-123', tier: 'pro' },
    });

    const event = mockStripeWebhookEvent('customer.subscription.created', subscription);

    mockConstructEvent.mockReturnValue(event);

    // ... rest of test
  });
});
```

### Example: Testing Auth-Protected Endpoint

```typescript
import { mockAuthUser, mockSupabaseUser, mockSupabaseSuccess } from '../helpers';

it('should return user data for authenticated user', async () => {
  const authUser = mockAuthUser();
  const dbUser = mockSupabaseUser({ id: authUser.userId });

  mockRequireAuth.mockResolvedValue(authUser);
  mockSupabaseQuery.mockResolvedValue(mockSupabaseSuccess(dbUser));

  // ... rest of test
});
```

## Benefits

1. **DRY Principle**: No more copy-pasting mock data across tests
2. **Easier Updates**: Change mock structure in one place
3. **Better Readability**: Tests focus on logic, not mock data setup
4. **Type Safety**: Catch type errors at compile time
5. **Realistic Data**: Fixtures include all required Stripe/Clerk/Supabase fields

## Adding New Fixtures

When adding new fixtures:

1. Follow existing patterns (use overrides parameter)
2. Include all required fields with sensible defaults
3. Add JSDoc comments explaining the fixture
4. Export from `index.ts`
5. Update this README with usage examples
