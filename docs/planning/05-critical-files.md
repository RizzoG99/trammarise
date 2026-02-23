# Critical Files Reference

Complete list of files to create and modify for authentication, database, and monetization implementation.

---

## Phase 1: Foundation (Authentication + Database)

### Week 1: Authentication Setup

#### Files to CREATE

**API Layer:**

- `/api/middleware/auth.ts` (30 lines)
  - Purpose: JWT validation and user lookup
  - Exports: `requireAuth(req) => { userId, clerkId }`
  - Dependencies: @clerk/nextjs/server, Supabase admin client

- `/api/webhooks/clerk.ts` (60 lines)
  - Purpose: Sync Clerk users to Supabase
  - Webhook events: user.created, user.updated, user.deleted
  - Dependencies: svix for signature validation

**Supabase Integration:**

- `/src/lib/supabase/client.ts` (20 lines)
  - Purpose: Browser-side Supabase client singleton
  - Exports: `supabaseClient`
  - Uses: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- `/src/lib/supabase/admin.ts` (25 lines)
  - Purpose: Server-side Supabase client with admin privileges
  - Exports: `supabaseAdmin`
  - Uses: `SUPABASE_SERVICE_ROLE_KEY` (server-only)

**TypeScript Types:**

- `/src/types/database.ts` (auto-generated, 200+ lines)
  - Purpose: Type-safe database schema
  - Generated from: `npx supabase gen types typescript`
  - Exports: `Database`, `Tables<'sessions'>`, etc.

**Tests:**

- `/api/__tests__/middleware/auth.test.ts` (50 lines)
  - Tests: requireAuth() success, 401 errors, user lookup

- `/api/__tests__/webhooks/clerk.test.ts` (80 lines)
  - Tests: user.created event, signature validation, error handling

#### Files to MODIFY

- `/src/App.tsx`
  - **Change:** Wrap app with `<ClerkProvider>`
  - **Location:** Line 10-20 (import and provider wrapper)
  - **Code:**

    ```typescript
    import { ClerkProvider } from '@clerk/clerk-react';

    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <ApiKeyProvider>
          <App />
        </ApiKeyProvider>
      </ThemeProvider>
    </ClerkProvider>
    ```

- `/src/lib/components/layout/Header.tsx`
  - **Change:** Add auth buttons (SignInButton, UserButton)
  - **Location:** Line 30-40 (right side of header)
  - **Code:**

    ```typescript
    import { SignInButton, UserButton, useAuth } from '@clerk/clerk-react';

    const { isSignedIn } = useAuth();

    {isSignedIn ? (
      <UserButton afterSignOutUrl="/" />
    ) : (
      <SignInButton mode="modal">
        <Button variant="outline">Sign In</Button>
      </SignInButton>
    )}
    ```

---

### Week 2: Database Integration

#### Files to CREATE

**Repository Layer:**

- `/src/repositories/SessionRepository.ts` (120 lines)
  - Purpose: Centralized session CRUD following Repository pattern
  - Methods:
    - `create(data): Promise<Session>`
    - `get(sessionId): Promise<Session | null>`
    - `update(sessionId, data): Promise<Session>`
    - `delete(sessionId): Promise<void>`
    - `list(limit, offset): Promise<Session[]>`
  - Exports: `sessionRepository` singleton

**API Routes:**

- `/api/sessions/create.ts` (80 lines)
  - Method: POST
  - Purpose: Create new session with file upload
  - Auth: Required
  - Body: `{ sessionId, audioName, fileSizeBytes, language, contentType, ... }`
  - Response: `{ id, session_id, ... }`

- `/api/sessions/[id].ts` (150 lines)
  - Methods: GET, PATCH, DELETE
  - Purpose: CRUD operations on single session
  - Auth: Required
  - GET: Fetch session
  - PATCH: Update session fields
  - DELETE: Soft delete (set deleted_at)

- `/api/sessions/list.ts` (60 lines)
  - Method: GET
  - Purpose: List user's sessions with pagination
  - Auth: Required
  - Query: `?limit=20&offset=0`
  - Response: `Session[]`

**Storage Manager:**

- `/src/utils/storage-manager.ts` (70 lines)
  - Purpose: Supabase Storage abstraction for audio files
  - Methods:
    - `uploadAudioFile(sessionId, blob, filename): Promise<string>`
    - `deleteAudioFile(sessionId): Promise<void>`
    - `getAudioUrl(sessionId): Promise<string>`

**Tests:**

- `/src/repositories/__tests__/SessionRepository.test.ts` (200 lines)
  - Tests: create(), get(), update(), delete(), list()
  - Mocks: fetch API

- `/api/__tests__/sessions/create.test.ts` (150 lines)
  - Tests: successful creation, auth, validation, errors

- `/api/__tests__/sessions/[id].test.ts` (200 lines)
  - Tests: GET, PATCH, DELETE, 404 handling

- `/api/__tests__/sessions/list.test.ts` (100 lines)
  - Tests: pagination, empty list, RLS enforcement

#### Files to MODIFY

- `/src/utils/session-manager.ts`
  - **Change:** Add dual-write logic (localStorage + API)
  - **Location:** `saveSession()` function (line 32-67)
  - **New lines:** ~30
  - **Code:**

    ```typescript
    import { useAuth } from '@clerk/clerk-react';
    import { sessionRepository } from '@/repositories/SessionRepository';
    import { uploadAudioFile } from './storage-manager';

    export async function saveSession(sessionId, data) {
      // ALWAYS save to localStorage (offline cache)
      await saveSessionLocal(sessionId, data);

      // If authenticated, also save to server
      const { isSignedIn } = useAuth();
      if (isSignedIn) {
        try {
          // Upload audio file to Supabase Storage if present
          if (data.audioFile) {
            const audioUrl = await uploadAudioFile(
              sessionId,
              data.audioFile.blob,
              data.audioFile.name
            );
            data.audioUrl = audioUrl;
          }

          // Save session to database
          await sessionRepository.upsert(sessionId, data);
        } catch (error) {
          console.warn('Server save failed, using local only:', error);
          // Don't throw - localStorage is fallback
        }
      }
    }
    ```

- `/src/app/routes/HistoryPage.tsx`
  - **Change:** Fetch from API when authenticated
  - **Location:** `useEffect` hook (line 40-60)
  - **New lines:** ~50
  - **Code:**

    ```typescript
    const { isSignedIn } = useAuth();
    const [sessions, setSessions] = useState<SessionData[]>([]);

    useEffect(() => {
      async function loadSessions() {
        if (isSignedIn) {
          // Fetch from API
          const apiSessions = await sessionRepository.list(50, 0);
          setSessions(apiSessions);
        } else {
          // Fetch from localStorage
          const localSessions = getAllSessionIds().map(loadSessionLocal);
          setSessions(localSessions.filter(Boolean));
        }
      }

      loadSessions();
    }, [isSignedIn]);
    ```

---

### Week 3: Migration & Sync

#### Files to CREATE

**API Route:**

- `/api/sessions/import.ts` (100 lines)
  - Method: POST
  - Purpose: Import localStorage sessions to database
  - Auth: Required
  - Body: `{ localSessions: SessionData[] }`
  - Response: `{ imported: number }`
  - Logic: Deduplicate, limit to 50 sessions, batch insert

**UI Components:**

- `/src/features/history/components/MigrationBanner.tsx` (80 lines)
  - Purpose: Prompt authenticated users to import local sessions
  - Shows: Session count, import button, progress
  - Dismissible after import

**Custom Hooks:**

- `/src/hooks/useSessionSync.ts` (60 lines)
  - Purpose: Auto-sync localStorage → API on mount
  - Hook returns: `{ syncing: boolean }`
  - Runs once per session

**Tests:**

- `/api/__tests__/sessions/import.test.ts` (120 lines)
  - Tests: import 50 sessions, deduplication, partial failures

#### Files to MODIFY

- `/src/app/routes/HistoryPage.tsx`
  - **Change:** Add MigrationBanner component
  - **Location:** Top of page content (line 20-25)
  - **New lines:** ~10
  - **Code:**

    ```typescript
    import { MigrationBanner } from '@/features/history/components/MigrationBanner';

    {isSignedIn && <MigrationBanner />}
    ```

---

## Phase 2: Monetization (Stripe + Usage Tracking)

### Week 4: Stripe Integration

#### Files to CREATE

**API Routes:**

- `/api/stripe/create-checkout-session.ts` (80 lines)
  - Method: POST
  - Purpose: Create Stripe Checkout session
  - Auth: Required
  - Body: `{ tier: 'pro' | 'team', interval: 'month' | 'year' }`
  - Response: `{ sessionId, url }`

- `/api/stripe/create-portal-session.ts` (50 lines)
  - Method: POST
  - Purpose: Create Stripe Customer Portal session
  - Auth: Required
  - Response: `{ url }`

- `/api/webhooks/stripe.ts` (150 lines)
  - Method: POST
  - Purpose: Handle Stripe webhook events
  - Events: customer.subscription.created/updated/deleted
  - Signature validation required

**Context:**

- `/src/context/SubscriptionContext.tsx` (80 lines)
  - Purpose: Global subscription state
  - State: `{ subscription: Subscription | null, refetch: () => void }`
  - Fetches: Current user's subscription on mount

**UI Pages:**

- `/src/app/routes/PricingPage.tsx` (200 lines)
  - Purpose: Display pricing tiers with feature comparison
  - Components: PricingCard (3 tiers)
  - Actions: Upgrade button → Stripe Checkout

**Utilities:**

- `/src/utils/stripe-client.ts` (40 lines)
  - Purpose: Browser-side Stripe helper
  - Exports: `loadStripe()` wrapper

**Tests:**

- `/api/__tests__/stripe/create-checkout-session.test.ts` (100 lines)
  - Tests: checkout creation, price ID mapping, customer creation

- `/api/__tests__/webhooks/stripe.test.ts` (200 lines)
  - Tests: subscription events, signature validation, status updates

- `/src/app/routes/__tests__/PricingPage.test.tsx` (150 lines)
  - Tests: rendering, upgrade flow, tier selection

#### Files to MODIFY

- `/src/App.tsx`
  - **Change:** Wrap with SubscriptionProvider
  - **Location:** Line 12-25
  - **Code:**

    ```typescript
    import { SubscriptionProvider } from '@/context/SubscriptionContext';

    <ClerkProvider>
      <ThemeProvider>
        <SubscriptionProvider>
          <ApiKeyProvider>
            <App />
          </ApiKeyProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </ClerkProvider>
    ```

- `/src/lib/components/layout/Header.tsx`
  - **Change:** Show tier badge next to user avatar
  - **Location:** Line 50-55
  - **Code:**

    ```typescript
    import { useSubscription } from '@/context/SubscriptionContext';

    const { subscription } = useSubscription();

    {subscription && (
      <Badge variant={subscription.tier === 'pro' ? 'blue' : 'purple'}>
        {subscription.tier === 'pro' ? 'Pro' : 'Team'}
      </Badge>
    )}
    ```

---

### Week 5: Usage Tracking

#### Files to CREATE

**Middleware:**

- `/api/middleware/track-usage.ts` (60 lines)
  - Purpose: Higher-order function for usage tracking
  - Usage: Wraps API route handlers
  - Flow: checkQuota → executeHandler → trackUsage
  - Exports: `withUsageTracking(handler, eventType)`

**Utilities:**

- `/api/utils/quota-checker.ts` (50 lines)
  - Purpose: Enforce tier limits before processing
  - Exports: `checkUsageLimit(userId)`
  - Throws: `UsageExceededError` if over quota

- `/src/utils/subscription-manager.ts` (100 lines)
  - Purpose: Client-side tier limits and feature flags
  - Exports: `TIER_LIMITS`, `getTierFeatures(tier)`
  - Constants: monthlyMinutes, features per tier

**API Route:**

- `/api/usage/current.ts` (80 lines)
  - Method: GET
  - Purpose: Get current month's usage for user
  - Auth: Required
  - Response: `{ totalMinutes, eventCount, billingPeriod }`

**UI Components:**

- `/src/features/dashboard/UsageDashboard.tsx` (120 lines)
  - Purpose: Display usage stats with progress bar
  - Shows: Minutes used, quota, chart
  - Warning: Shows alert at 80% usage

**Custom Hooks:**

- `/src/hooks/useFeatureGate.ts` (30 lines)
  - Purpose: Check if user has access to feature
  - Returns: `{ hasAccess: boolean, upgrade: () => void }`
  - Usage: `const { hasAccess, upgrade } = useFeatureGate('speakerDiarization')`

**Tests:**

- `/api/__tests__/middleware/track-usage.test.ts` (150 lines)
  - Tests: tracking after success, quota enforcement, event creation

- `/api/__tests__/utils/quota-checker.test.ts` (100 lines)
  - Tests: under quota, at quota, over quota, tier limits

- `/src/hooks/__tests__/useFeatureGate.test.ts` (80 lines)
  - Tests: free vs pro feature access, upgrade callback

#### Files to MODIFY

- `/api/transcribe.ts`
  - **Change:** Wrap with usage tracking middleware
  - **Location:** Line 29 (export default)
  - **Code:**

    ```typescript
    import { withUsageTracking } from './middleware/track-usage';

    export default withUsageTracking(async (req, res) => {
      // Existing transcription logic
    }, 'transcription');
    ```

- `/api/summarize.ts`
  - **Change:** Wrap with usage tracking middleware
  - **Location:** Line 80 (export default)
  - **Code:**

    ```typescript
    import { withUsageTracking } from './middleware/track-usage';

    export default withUsageTracking(async (req, res) => {
      // Existing summarization logic
    }, 'summarization');
    ```

- `/api/chat.ts`
  - **Change:** Wrap with usage tracking middleware
  - **Location:** Line 19 (export default)
  - **Code:**

    ```typescript
    import { withUsageTracking } from './middleware/track-usage';

    export default withUsageTracking(async (req, res) => {
      // Existing chat logic
    }, 'chat');
    ```

- `/src/app/routes/ResultsPage.tsx`
  - **Change:** Add "Upgrade" prompt when quota exceeded
  - **Location:** Line 50-60 (after error handling)
  - **Code:**
    ```typescript
    {error?.includes('quota') && (
      <Alert variant="warning">
        Monthly limit reached.
        <Button onClick={() => router.push('/pricing')}>
          Upgrade to Pro
        </Button>
      </Alert>
    )}
    ```

---

### Week 6: Credits System

#### Files to CREATE

**API Routes:**

- `/api/credits/purchase.ts` (80 lines)
  - Method: POST
  - Purpose: Purchase credits via Stripe one-time payment
  - Body: `{ amount: number }` (credits)
  - Response: `{ checkoutUrl }`

- `/api/credits/balance.ts` (40 lines)
  - Method: GET
  - Purpose: Get user's current credit balance
  - Response: `{ balance: number }`

**UI Components:**

- `/src/features/credits/CreditPurchaseModal.tsx` (100 lines)
  - Purpose: Modal for purchasing credits
  - Options: 100, 500, 1000 credits
  - Pricing: €0.01/credit

**Tests:**

- `/api/__tests__/credits/purchase.test.ts` (100 lines)
  - Tests: purchase flow, balance update, Stripe integration

#### Files to MODIFY

- Database schema (Supabase SQL)
  - **Change:** Add credits columns
  - **SQL:**
    ```sql
    ALTER TABLE subscriptions ADD COLUMN credits_balance NUMERIC DEFAULT 0;
    ALTER TABLE usage_events ADD COLUMN credits_consumed NUMERIC DEFAULT 0;
    ```

- `/src/context/SubscriptionContext.tsx`
  - **Change:** Include credits in subscription state
  - **Location:** Line 20-25
  - **Code:**
    ```typescript
    interface SubscriptionContextType {
      subscription: (Subscription & { creditsBalance: number }) | null;
      // ... rest
    }
    ```

---

## Phase 3: Value Features (Brief)

### Speaker Diarization

#### Files to CREATE

- `/api/integrations/assemblyai.ts` (100 lines) - AssemblyAI client
- `/src/features/audio/components/SpeakerToggle.tsx` (60 lines)

### Multi-Language

#### Files to MODIFY

- `/src/lib/components/form/LanguageSelector.tsx` - Expand to 50+ languages

### Integrations

#### Files to CREATE

- `/api/integrations/notion.ts` (120 lines)
- `/api/integrations/google-docs.ts` (150 lines)
- `/api/integrations/slack.ts` (80 lines)
- `/src/features/integrations/IntegrationsPage.tsx` (200 lines)

---

## Phase 4: Engagement Features (Brief)

### Analytics Dashboard

#### Files to CREATE

- `/api/analytics/stats.ts` (100 lines)
- `/src/features/analytics/AnalyticsDashboard.tsx` (200 lines)

### Search

#### Files to CREATE

- `/api/search/sessions.ts` (80 lines)
- `/src/features/search/SearchBar.tsx` (100 lines)

### Email Notifications

#### Files to CREATE

- `/api/utils/email-client.ts` (60 lines)
- `/api/notifications/send-completion.ts` (50 lines)

---

## Environment Variables

### Required for Phase 1-2

```bash
# .env.local

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...

# Hosted API Keys (server-side only)
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:5173
```

---

## Summary Statistics

### Phase 1: Foundation

- **Files to create:** 18
- **Files to modify:** 4
- **Total new lines:** ~1,500
- **Test files:** 8 (total: ~850 lines)

### Phase 2: Monetization

- **Files to create:** 15
- **Files to modify:** 6
- **Total new lines:** ~1,300
- **Test files:** 9 (total: ~1,000 lines)

### Total (Phases 1-2 MVP)

- **Files to create:** 33
- **Files to modify:** 10
- **Total new lines:** ~2,800
- **Test files:** 17 (total: ~1,850 lines)
- **Test/code ratio:** 66% (healthy TDD practice)

---

**This reference ensures no critical file is missed during implementation. Follow TDD: write tests first, then implement.**
