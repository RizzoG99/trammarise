# Clerk → Supabase Auth Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Clerk with Supabase Auth, enable RLS for direct browser→DB queries, remove Team tier.

**Architecture:** Supabase Auth manages authentication (magic link + Google/Apple/GitHub OAuth). RLS policies on all tables use `auth.uid()` so the browser queries data directly. Server-side endpoints (transcription, AI, Stripe, API key encryption) use a new slim `requireAuth` that validates Supabase JWTs via `supabaseAdmin.auth.getUser(token)`. No real users exist — fresh start, no data migration needed.

**Tech Stack:** React 19, TypeScript, @supabase/supabase-js v2 (already installed), Vitest, Testing Library. Removes: @clerk/react, @clerk/backend, svix.

---

## Task 1: DB Migration — Supabase Auth schema

**Files:**

- Create: `supabase/migrations/010_migrate_to_supabase_auth.sql`

**Step 1: Write the migration**

```sql
-- Migration 010: Migrate from Clerk to Supabase Auth
-- No real users exist — safe to drop Clerk columns and reset users table.

-- ============================================================================
-- 1. RESET USERS TABLE TO REFERENCE auth.users
-- ============================================================================

-- Truncate dependent tables first (no real data)
TRUNCATE public.credit_transactions CASCADE;
TRUNCATE public.usage_events CASCADE;
TRUNCATE public.sessions CASCADE;
TRUNCATE public.user_settings CASCADE;
TRUNCATE public.subscriptions CASCADE;
TRUNCATE public.users CASCADE;

-- Drop the old Clerk-based primary key approach
ALTER TABLE public.users DROP COLUMN IF EXISTS clerk_user_id;

-- The users.id UUID must now equal auth.uid()
-- Add FK to auth.users
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID; -- skip validation since table is empty

ALTER TABLE public.users
  VALIDATE CONSTRAINT users_id_fkey;

-- ============================================================================
-- 2. AUTO-CREATE public.users ROW ON SIGN-UP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. REMOVE TEAM TIER FROM subscriptions CHECK CONSTRAINT
-- ============================================================================

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_tier_check
  CHECK (tier IN ('free', 'pro'));

-- ============================================================================
-- 4. RLS POLICIES — allow users to read/write their own rows
-- ============================================================================

-- Enable RLS (already done in migration 009 for some tables)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- users table
DROP POLICY IF EXISTS "deny_direct_access" ON public.users;
CREATE POLICY "own" ON public.users
  FOR ALL USING (id = auth.uid());

-- subscriptions table
DROP POLICY IF EXISTS "deny_direct_access" ON public.subscriptions;
CREATE POLICY "own" ON public.subscriptions
  FOR ALL USING (user_id = auth.uid());

-- sessions table
CREATE POLICY "own" ON public.sessions
  FOR ALL USING (user_id = auth.uid());

-- user_settings table
DROP POLICY IF EXISTS "deny_direct_access" ON public.user_settings;
CREATE POLICY "own" ON public.user_settings
  FOR ALL USING (user_id = auth.uid());

-- usage_events table
CREATE POLICY "own" ON public.usage_events
  FOR ALL USING (user_id = auth.uid());

-- credit_transactions table
DROP POLICY IF EXISTS "deny_direct_access" ON public.credit_transactions;
CREATE POLICY "own" ON public.credit_transactions
  FOR ALL USING (user_id = auth.uid());

-- team_memberships — lock completely (no team tier)
DROP POLICY IF EXISTS "deny_direct_access" ON public.team_memberships;
CREATE POLICY "deny_all" ON public.team_memberships
  FOR ALL USING (false);
```

**Step 2: Apply via Supabase MCP**

In Claude Code, use the `mcp__plugin_supabase_supabase__apply_migration` tool with `project_id: befhofwkapfazebtezhv`, name `migrate_to_supabase_auth`, and the SQL above.

**Step 3: Verify in Supabase dashboard**

Check Table Editor → `users` table has no `clerk_user_id` column. Check Auth → Triggers shows `on_auth_user_created`.

**Step 4: Commit**

```bash
git add supabase/migrations/010_migrate_to_supabase_auth.sql
git commit -m "feat(db): migrate users table to Supabase Auth, add RLS policies, remove team tier"
```

---

## Task 2: TypeScript types — Remove Team tier

**Files:**

- Modify: `src/context/subscription-types.ts`
- Modify: `src/context/subscription-tiers.ts`
- Modify: `src/context/SubscriptionContext.tsx:25-29`

**Step 1: Update subscription-types.ts**

```typescript
// src/context/subscription-types.ts
export type SubscriptionTier = 'free' | 'pro';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

export interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  minutesIncluded: number;
  minutesUsed: number;
  creditsBalance: number;
}
```

**Step 2: Update subscription-tiers.ts — remove team**

Remove the `team` key from `TIER_FEATURES`:

```typescript
// src/context/subscription-tiers.ts
import type { SubscriptionTier } from './subscription-types';

export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ['byok', 'basic-editing', 'export-pdf', 'local-storage'],
  pro: [
    'basic-editing',
    'export-pdf',
    'local-storage',
    'hosted-api',
    'cloud-sync',
    'priority-processing',
    'advanced-audio',
    'chat',
    'custom-models',
    'email-support',
    'speaker-diarization',
  ],
};

export const FREE_SUBSCRIPTION = {
  id: 'free',
  tier: 'free' as SubscriptionTier,
  status: 'active' as const,
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
  minutesIncluded: 0,
  minutesUsed: 0,
  creditsBalance: 0,
};
```

**Step 3: Update TIER_MINUTES in SubscriptionContext.tsx**

Change lines 25-29:

```typescript
export const TIER_MINUTES: Record<SubscriptionTier, number> = {
  free: 60,
  pro: 500,
};
```

**Step 4: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only about Clerk imports (not yet removed). No `'team'` type errors.

**Step 5: Commit**

```bash
git add src/context/subscription-types.ts src/context/subscription-tiers.ts src/context/SubscriptionContext.tsx
git commit -m "feat: remove team tier, keep free and pro only"
```

---

## Task 3: New API auth middleware — Replace Clerk with Supabase JWT

**Files:**

- Modify: `api/middleware/auth.ts` (full rewrite)

**Step 1: Rewrite auth.ts**

```typescript
// api/middleware/auth.ts
import type { VercelRequest } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase-admin';

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthResult {
  userId: string; // = auth.uid() = public.users.id
}

/**
 * Middleware to require authentication for API routes.
 * Validates Supabase JWT from Authorization header.
 *
 * @example
 * const { userId } = await requireAuth(req);
 */
export async function requireAuth(req: VercelRequest): Promise<AuthResult> {
  const authHeader = req.headers['authorization'];
  const token = Array.isArray(authHeader)
    ? authHeader[0]?.replace('Bearer ', '')
    : authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new AuthError('Missing authorization token', 401);
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new AuthError('Invalid or expired token', 401);
  }

  return { userId: user.id };
}

/**
 * Optional authentication — returns user if authenticated, null otherwise.
 */
export async function optionalAuth(req: VercelRequest): Promise<AuthResult | null> {
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}
```

**Step 2: Check all server endpoints that use requireAuth**

The following endpoints call `const { userId } = await requireAuth(req)`. The new `AuthResult` still has `userId`, so they all continue to work. The only breaking change is removal of `clerkId` — search for any endpoint that uses it:

```bash
grep -r "clerkId" api/ --include="*.ts"
```

If any endpoint uses `clerkId`, update it to use `userId` only (since `userId === auth.uid()` now).

**Step 3: Run TypeScript check on api/**

```bash
npx tsc --noEmit 2>&1 | grep "api/" | head -20
```

**Step 4: Commit**

```bash
git add api/middleware/auth.ts
git commit -m "feat(api): replace Clerk auth middleware with Supabase JWT validation"
```

---

## Task 4: Rewrite fetchWithAuth — Supabase session token

**Files:**

- Modify: `src/utils/fetch-with-auth.ts` (full rewrite)

The old version took `getToken` from Clerk's `useAuth()` as a parameter. The new version gets the Supabase access token internally from the browser client. All callers that pass `getToken` must be updated to remove that argument.

**Step 1: Rewrite fetch-with-auth.ts**

```typescript
// src/utils/fetch-with-auth.ts
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
```

**Step 2: Update all callers of fetchWithAuth to remove the getToken argument**

Find all calls:

```bash
grep -r "fetchWithAuth" src/ --include="*.ts" --include="*.tsx" -l
```

For each file, change `fetchWithAuth(getToken, url, ...)` → `fetchWithAuth(url, ...)`.

Key files to update:

- `src/utils/api.ts` — `saveApiKey`, `getSavedApiKey`, `deleteSavedApiKey`, `saveOnboardingUseCaseToDb`, `getOnboardingUseCaseFromDb` — remove `getToken` parameter from all these functions
- Any component that passes `getToken` to these helpers

**Step 3: Update src/utils/api.ts — remove getToken parameters**

Change `saveApiKey`, `getSavedApiKey`, `deleteSavedApiKey`, `saveOnboardingUseCaseToDb`, `getOnboardingUseCaseFromDb` signatures to remove `getToken` parameter. The functions now call `fetchWithAuth(url, options)` without `getToken`.

Example (do same for all five):

```typescript
// Before
export async function saveApiKey(
  apiKey: string,
  provider: string = 'openai',
  getToken?: (() => Promise<string | null>) | null
): Promise<{ success: boolean; message: string }> {
  const response = await fetchWithAuth(getToken || null, '/api/user-settings/api-key', ...);

// After
export async function saveApiKey(
  apiKey: string,
  provider: string = 'openai'
): Promise<{ success: boolean; message: string }> {
  const response = await fetchWithAuth('/api/user-settings/api-key', ...);
```

**Step 4: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "fetchWithAuth\|getToken" | head -20
```

Fix any remaining call-site errors.

**Step 5: Run tests**

```bash
npm test 2>&1 | tail -10
```

**Step 6: Commit**

```bash
git add src/utils/fetch-with-auth.ts src/utils/api.ts
git commit -m "feat: rewrite fetchWithAuth to use Supabase session token, remove getToken params"
```

---

## Task 5: Custom useUser hook — Supabase session

**Files:**

- Create: `src/hooks/useUser.ts`
- Create: `src/hooks/useUser.test.ts`

This hook replaces `useUser()` from `@clerk/react` in components. Returns `{ user, isSignedIn, isLoaded }`.

**Step 1: Write the failing test**

```typescript
// src/hooks/useUser.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUser } from './useUser';

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

import { supabaseClient } from '@/lib/supabase/client';

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoaded=false initially', () => {
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    const { result } = renderHook(() => useUser());
    expect(result.current.isLoaded).toBe(false);
  });

  it('returns isSignedIn=false when no session', async () => {
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    const { result } = renderHook(() => useUser());
    await vi.waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('returns isSignedIn=true with user when session exists', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User', avatar_url: 'https://example.com/avatar.jpg' },
    };
    vi.mocked(supabaseClient.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser, access_token: 'token' } },
      error: null,
    } as never);
    const { result } = renderHook(() => useUser());
    await vi.waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.user?.id).toBe('user-123');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test src/hooks/useUser.test.ts 2>&1 | tail -10
```

Expected: FAIL with "Cannot find module './useUser'"

**Step 3: Implement useUser.ts**

```typescript
// src/hooks/useUser.ts
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/client';

interface UseUserReturn {
  user: User | null;
  isSignedIn: boolean;
  isLoaded: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isSignedIn: !!user,
    isLoaded,
  };
}
```

**Step 4: Run tests**

```bash
npm test src/hooks/useUser.test.ts 2>&1 | tail -10
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add src/hooks/useUser.ts src/hooks/useUser.test.ts
git commit -m "feat: add useUser hook wrapping Supabase auth session"
```

---

## Task 6: SubscriptionContext — Replace Clerk with direct Supabase query

**Files:**

- Modify: `src/context/SubscriptionContext.tsx`

**Step 1: Rewrite SubscriptionContext.tsx**

```typescript
// src/context/SubscriptionContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { TIER_FEATURES, FREE_SUBSCRIPTION } from './subscription-tiers';
import type { SubscriptionTier, SubscriptionStatus, Subscription } from './subscription-types';

interface SubscriptionContextValue {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  canUseHostedAPI: boolean;
  minutesRemaining: number;
  isSubscribed: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const TIER_MINUTES: Record<SubscriptionTier, number> = {
  free: 60,
  pro: 500,
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isSignedIn || !user) {
      setSubscription(FREE_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setSubscription(FREE_SUBSCRIPTION);
        return;
      }

      setSubscription({
        id: data.id,
        tier: data.tier as SubscriptionTier,
        status: data.status as SubscriptionStatus,
        currentPeriodStart: data.current_period_start ?? new Date().toISOString(),
        currentPeriodEnd: data.current_period_end ?? new Date().toISOString(),
        cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
        minutesIncluded: TIER_MINUTES[data.tier as SubscriptionTier] ?? 0,
        minutesUsed: data.minutes_used ?? 0,
        creditsBalance: data.credits_balance ?? 0,
      });
    } catch (err) {
      console.debug('Subscription fetch failed, falling back to free tier:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      setSubscription(FREE_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (isLoaded) {
      fetchSubscription();
    }
  }, [isLoaded, fetchSubscription]);

  useEffect(() => {
    if (subscription && subscription.tier !== 'free') {
      // Pro user — no further action needed
    }
  }, [subscription]);

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return TIER_FEATURES[subscription.tier]?.includes(feature) ?? false;
  };

  const canUseHostedAPI = subscription?.tier !== 'free';
  const minutesRemaining = subscription
    ? Math.max(0, subscription.minutesIncluded - subscription.minutesUsed)
    : 0;
  const isSubscribed = subscription?.tier !== 'free' && subscription?.status === 'active';

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        error,
        refetch: fetchSubscription,
        hasFeature,
        canUseHostedAPI,
        minutesRemaining,
        isSubscribed,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "SubscriptionContext" | head -10
```

**Step 3: Run tests**

```bash
npm test 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/context/SubscriptionContext.tsx
git commit -m "feat: SubscriptionContext — replace Clerk with direct Supabase query"
```

---

## Task 7: OnboardingContext — Replace Clerk useUser

**Files:**

- Modify: `src/context/OnboardingContext.tsx`

**Step 1: Rewrite OnboardingContext.tsx**

Replace `useUser` from `@clerk/react` with the new `useUser` hook. The `getSavedApiKey` and `getOnboardingUseCaseFromDb` functions still call server-side API (`/api/user-settings/api-key`) for decryption — they now use `fetchWithAuth` with Supabase token (already updated in Task 4).

```typescript
// src/context/OnboardingContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { useSubscription } from './SubscriptionContext';
import { getApiConfig, saveApiConfig } from '@/utils/session-storage';
import { getSavedApiKey, getOnboardingUseCaseFromDb } from '@/utils/api';

interface OnboardingContextValue {
  needsOnboarding: boolean;
  isCheckingOnboarding: boolean;
  completeOnboarding: () => void;
  isViewingPricing: boolean;
  setIsViewingPricing: (viewing: boolean) => void;
  onboardingUseCase: string | null;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isViewingPricing, setIsViewingPricing] = useState(false);
  const [onboardingUseCase, setOnboardingUseCase] = useState<string | null>(null);

  const checkOnboardingStatus = useCallback(async () => {
    if (!isSignedIn) {
      setNeedsOnboarding(false);
      setIsCheckingOnboarding(false);
      return;
    }

    if (subscription && subscription.tier !== 'free') {
      setNeedsOnboarding(false);
      setIsCheckingOnboarding(false);
      return;
    }

    const sessionConfig = getApiConfig();
    if (sessionConfig?.openaiKey) {
      setNeedsOnboarding(false);
      setIsCheckingOnboarding(false);
      return;
    }

    try {
      const [savedKey, savedUseCase] = await Promise.all([
        getSavedApiKey(),
        getOnboardingUseCaseFromDb(),
      ]);

      if (savedUseCase) setOnboardingUseCase(savedUseCase);

      if (savedKey.hasKey && savedKey.apiKey) {
        saveApiConfig('openai', savedKey.apiKey, savedKey.apiKey);
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
    } catch {
      setNeedsOnboarding(true);
    } finally {
      setIsCheckingOnboarding(false);
    }
  }, [isSignedIn, subscription]);

  useEffect(() => {
    if (userLoaded && !subscriptionLoading) {
      checkOnboardingStatus();
    }
  }, [userLoaded, subscriptionLoading, checkOnboardingStatus]);

  useEffect(() => {
    if (subscription && subscription.tier !== 'free') {
      setNeedsOnboarding(false);
      setIsViewingPricing(false);
    }
  }, [subscription]);

  const completeOnboarding = () => {
    setNeedsOnboarding(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        needsOnboarding,
        isCheckingOnboarding,
        completeOnboarding,
        isViewingPricing,
        setIsViewingPricing,
        onboardingUseCase,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "OnboardingContext" | head -10
```

**Step 3: Commit**

```bash
git add src/context/OnboardingContext.tsx
git commit -m "feat: OnboardingContext — replace Clerk useUser with Supabase hook"
```

---

## Task 8: AuthCallbackPage — Handle OAuth and magic link redirects

**Files:**

- Create: `src/pages/AuthCallbackPage.tsx`
- Create: `src/pages/AuthCallbackPage.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/pages/AuthCallbackPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AuthCallbackPage } from './AuthCallbackPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe('AuthCallbackPage', () => {
  it('shows loading state initially', () => {
    render(<AuthCallbackPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('navigates to / after successful exchange', async () => {
    render(<AuthCallbackPage />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test src/pages/AuthCallbackPage.test.tsx 2>&1 | tail -10
```

Expected: FAIL

**Step 3: Implement AuthCallbackPage.tsx**

```typescript
// src/pages/AuthCallbackPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabase/client';
import { PageLoader } from '@/lib/components/ui/PageLoader/PageLoader';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      supabaseClient.auth
        .exchangeCodeForSession(code)
        .then(() => navigate('/', { replace: true }))
        .catch(() => navigate('/', { replace: true }));
    } else {
      // Magic link or implicit flow — session is set automatically by onAuthStateChange
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return <PageLoader />;
}
```

**Step 4: Run tests**

```bash
npm test src/pages/AuthCallbackPage.test.tsx 2>&1 | tail -10
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/pages/AuthCallbackPage.tsx src/pages/AuthCallbackPage.test.tsx
git commit -m "feat: add AuthCallbackPage for Supabase OAuth and magic link redirects"
```

---

## Task 9: SignInModal component

**Files:**

- Create: `src/components/auth/SignInModal.tsx`
- Create: `src/components/auth/SignInModal.test.tsx`

**Step 1: Write the failing test**

```typescript
// src/components/auth/SignInModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { SignInModal } from './SignInModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const mockSignInWithOtp = vi.fn().mockResolvedValue({ error: null });
const mockSignInWithOAuth = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

describe('SignInModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email input and submit button', () => {
    render(<SignInModal onClose={() => {}} />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /magic link/i })).toBeInTheDocument();
  });

  it('renders OAuth provider buttons', () => {
    render(<SignInModal onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument();
  });

  it('calls signInWithOtp on email submit', async () => {
    render(<SignInModal onClose={() => {}} />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
    await waitFor(() =>
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: { emailRedirectTo: expect.stringContaining('/auth/callback') },
      })
    );
  });

  it('shows confirmation message after email submit', async () => {
    render(<SignInModal onClose={() => {}} />);
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /magic link/i }));
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
  });

  it('calls signInWithOAuth for Google', async () => {
    render(<SignInModal onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /google/i }));
    await waitFor(() =>
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.stringContaining('/auth/callback') },
      })
    );
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test src/components/auth/SignInModal.test.tsx 2>&1 | tail -10
```

Expected: FAIL

**Step 3: Implement SignInModal.tsx**

```typescript
// src/components/auth/SignInModal.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Provider } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabase/client';
import { GlassCard, Heading, Text, Button } from '@/lib';

interface SignInModalProps {
  onClose: () => void;
}

const CALLBACK_URL = `${window.location.origin}/auth/callback`;

export function SignInModal({ onClose }: SignInModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    const { error: err } = await supabaseClient.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: CALLBACK_URL },
    });
    setIsLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  };

  const handleOAuth = async (provider: Provider) => {
    await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: CALLBACK_URL },
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('auth.signIn.title', 'Sign in')}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <GlassCard variant="dark" className="w-full max-w-sm p-8">
        {sent ? (
          <div role="status" className="text-center space-y-3">
            <Heading level="h2">{t('auth.signIn.checkEmail', 'Check your email')}</Heading>
            <Text color="secondary">
              {t('auth.signIn.sentTo', 'We sent a magic link to')} <strong>{email}</strong>.
            </Text>
          </div>
        ) : (
          <div className="space-y-6">
            <Heading level="h2" className="text-center">
              {t('auth.signIn.title', 'Sign in to Trammarise')}
            </Heading>

            {/* Email magic link */}
            <div className="space-y-2">
              <label
                htmlFor="signin-email"
                className="text-sm font-medium text-text-secondary"
              >
                {t('auth.signIn.email', 'Email')}
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-bg-surface/40 border border-border text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {error && (
                <p role="alert" className="text-accent-error text-sm">
                  {error}
                </p>
              )}
              <Button
                variant="primary"
                onClick={handleMagicLink}
                disabled={isLoading || !email.trim()}
                className="w-full cursor-pointer"
              >
                {isLoading
                  ? t('auth.signIn.sending', 'Sending…')
                  : t('auth.signIn.magicLink', 'Send Magic Link')}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-tertiary">
                {t('auth.signIn.or', 'or continue with')}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* OAuth providers */}
            <div className="space-y-2">
              {(
                [
                  { provider: 'google' as Provider, label: 'Google' },
                  { provider: 'github' as Provider, label: 'GitHub' },
                  { provider: 'apple' as Provider, label: 'Apple' },
                ] as const
              ).map(({ provider, label }) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleOAuth(provider)}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-bg-surface/30 hover:bg-bg-surface/60 text-sm text-text-primary transition-colors duration-150 cursor-pointer"
                >
                  {t(`auth.signIn.${provider}`, label)}
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
```

**Step 4: Run tests**

```bash
npm test src/components/auth/SignInModal.test.tsx 2>&1 | tail -10
```

Expected: PASS (5 tests)

**Step 5: Commit**

```bash
git add src/components/auth/SignInModal.tsx src/components/auth/SignInModal.test.tsx
git commit -m "feat: add SignInModal with magic link and OAuth (Google, GitHub, Apple)"
```

---

## Task 10: WelcomePage — Replace Clerk with SignInModal

**Files:**

- Modify: `src/pages/WelcomePage.tsx`

**Step 1: Replace useClerk with SignInModal**

Remove `import { useClerk } from '@clerk/react'` and `const { openSignIn } = useClerk()`. Add `SignInModal` state.

Replace the top of `WelcomePage`:

```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text, Button, GlassCard } from '@/lib';
import { ArrowRight, Mic, Zap, Shield, Check } from 'lucide-react';
import { AppFooter } from '@/components/layout/AppFooter';
import { SignInModal } from '@/components/auth/SignInModal';

export function WelcomePage() {
  const { t } = useTranslation();
  const [showSignIn, setShowSignIn] = useState(false);

  const handleGetStarted = () => setShowSignIn(true);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-primary/30">
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
      {/* ... rest of JSX unchanged ... */}
    </div>
  );
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "WelcomePage" | head -10
```

**Step 3: Run tests**

```bash
npm test 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add src/pages/WelcomePage.tsx
git commit -m "feat: WelcomePage — replace Clerk openSignIn with SignInModal"
```

---

## Task 11: UserMenuTrigger + UserMenuDropdown — Remove Clerk

**Files:**

- Modify: `src/features/user-menu/components/UserMenuTrigger.tsx`
- Modify: `src/features/user-menu/components/UserMenuDropdown.tsx`

**Step 1: Update UserMenuTrigger.tsx**

Replace `useUser` from `@clerk/react` with `useUser` from `@/hooks/useUser`. The Supabase user object has different shape — `user.imageUrl` → `user.user_metadata.avatar_url`, `user.fullName` → `user.user_metadata.full_name`.

```typescript
// src/features/user-menu/components/UserMenuTrigger.tsx
import { ChevronDown } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { TierBadge } from './TierBadge';
import type { SubscriptionTier } from '@/context/subscription-types';

interface UserMenuTriggerProps {
  tier: SubscriptionTier;
  onClick: () => void;
  isOpen: boolean;
}

export function UserMenuTrigger({ tier, onClick, isOpen }: UserMenuTriggerProps) {
  const { user } = useUser();

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'User';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-1 rounded-full border border-transparent hover:border-border hover:bg-bg-surface/70 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label="User menu"
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <TierBadge tier={tier} />
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-border"
        />
      ) : (
        <span className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-border bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
          {fullName.charAt(0).toUpperCase()}
        </span>
      )}
      <ChevronDown
        className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
```

**Step 2: Update UserMenuDropdown.tsx**

Replace `useClerk` from `@clerk/react` with Supabase sign-out. The `session.getToken()` in `deleteSavedApiKey` call is no longer needed (removed in Task 4).

```typescript
// src/features/user-menu/components/UserMenuDropdown.tsx
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User, Key, CreditCard, LogOut, Sparkles, History } from 'lucide-react';
import { clearApiConfig } from '@/utils/session-storage';
import { deleteSavedApiKey } from '@/utils/api';
import { supabaseClient } from '@/lib/supabase/client';
import { ROUTES } from '@/types/routing';

interface UserMenuDropdownProps {
  isSubscribed: boolean;
  onClose: () => void;
}

export function UserMenuDropdown({ isSubscribed, onClose }: UserMenuDropdownProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      clearApiConfig();
      await deleteSavedApiKey();
    } catch (error) {
      console.error('Error clearing API keys on logout:', error);
    }
    await supabaseClient.auth.signOut();
    onClose();
  };

  const navigateTo = (section: string) => {
    navigate(`${ROUTES.ACCOUNT}?section=${section}`);
    onClose();
  };

  const menuItems = [
    {
      icon: User,
      label: t('userMenu.menuItems.profile', 'Profile Settings'),
      action: () => navigateTo('profile'),
    },
    {
      icon: Key,
      label: t('userMenu.menuItems.apiKeys', 'API Keys'),
      action: () => navigateTo('apiKeys'),
    },
    {
      icon: CreditCard,
      label: isSubscribed
        ? t('userMenu.menuItems.billing', 'Usage & Billing')
        : t('userMenu.menuItems.usage', 'Usage'),
      action: () => navigateTo('plan'),
    },
  ];

  if (!isSubscribed) {
    menuItems.push({
      icon: Sparkles,
      label: t('userMenu.menuItems.pricing', 'Pricing'),
      action: () => {
        navigate(ROUTES.PRICING);
        onClose();
      },
    });
  }

  return (
    <div
      role="menu"
      aria-label={t('userMenu.ariaLabel')}
      className="absolute right-0 mt-2 w-56 py-2 bg-bg-surface border border-border rounded-lg shadow-xl z-50 backdrop-blur-md animate-dropdown-enter"
    >
      <button
        type="button"
        role="menuitem"
        className="md:hidden w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-hover transition-colors"
        onClick={() => { navigate(ROUTES.HISTORY); onClose(); }}
      >
        <History className="w-4 h-4" />
        <span>{t('nav.history', 'History')}</span>
      </button>
      <div className="md:hidden my-1 border-t border-border" />
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-hover transition-colors"
            onClick={item.action}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
      <div className="my-1 border-t border-border" />
      <button
        type="button"
        role="menuitem"
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent-error hover:bg-bg-hover transition-colors"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4" />
        <span>{t('userMenu.menuItems.signOut', 'Sign Out')}</span>
      </button>
    </div>
  );
}
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "UserMenu" | head -10
```

**Step 4: Commit**

```bash
git add src/features/user-menu/components/UserMenuTrigger.tsx src/features/user-menu/components/UserMenuDropdown.tsx
git commit -m "feat: user menu — replace Clerk with Supabase signOut and useUser hook"
```

---

## Task 12: OnboardingPage — Remove useAuth Clerk

**Files:**

- Modify: `src/features/onboarding/OnboardingPage.tsx`
- Modify: `src/features/onboarding/OnboardingPage.test.tsx`

**Step 1: Update OnboardingPage.tsx**

Remove `import { useAuth } from '@clerk/react'` and `const { getToken } = useAuth()`. The `saveApiKey` function no longer takes `getToken` (removed in Task 4).

Change `handleFinish`:

```typescript
// Before
saveApiConfig('openai', apiKey, apiKey);
if (rememberKey) {
  await saveApiKey(apiKey, 'openai', getToken);
}

// After
saveApiConfig('openai', apiKey, apiKey);
if (rememberKey) {
  await saveApiKey(apiKey, 'openai');
}
```

Also remove `const { getToken } = useAuth();` line and the `useAuth` import.

**Step 2: Update OnboardingPage.test.tsx**

Remove the `vi.mock('@clerk/react', ...)` block (Clerk is no longer imported by OnboardingPage). The `mockSaveApiKeyFn` expectation for `saveApiKey` call should now not include the `getToken` argument:

```typescript
// Before
expect(mockSaveApiKeyFn).toHaveBeenCalledWith('sk-validkey123', 'openai', expect.any(Function));

// After
expect(mockSaveApiKeyFn).toHaveBeenCalledWith('sk-validkey123', 'openai');
```

**Step 3: Run tests**

```bash
npm test src/features/onboarding/OnboardingPage.test.tsx 2>&1 | tail -10
```

Expected: PASS (all 30 tests)

**Step 4: Commit**

```bash
git add src/features/onboarding/OnboardingPage.tsx src/features/onboarding/OnboardingPage.test.tsx
git commit -m "feat: OnboardingPage — remove Clerk useAuth, use updated saveApiKey"
```

---

## Task 13: App.tsx — Remove ClerkProvider, add auth routing

**Files:**

- Modify: `src/app/App.tsx`
- Modify: `src/main.tsx`

**Step 1: Rewrite App.tsx**

Replace `ClerkProvider` + `useUser` from Clerk with `useUser` from `@/hooks/useUser`. Add `/auth/callback` route.

```typescript
// src/app/App.tsx — key changes:

// REMOVE:
import { ClerkProvider, useUser } from '@clerk/react';
const CLERK_PUBLISHABLE_KEY = ...

// REPLACE WITH:
import { useUser } from '@/hooks/useUser';

// In AppRoutes() — replace Clerk state:
// REMOVE: const { isSignedIn, isLoaded, user } = useUser(); // from @clerk/react
// REMOVE: clerkTimedOut state and 10s timeout effect
// ADD:
const { isSignedIn, isLoaded, user } = useUser(); // from @/hooks/useUser

// Update analytics effect:
useEffect(() => {
  if (!isLoaded) return;
  if (isSignedIn && user) {
    identifyUser(user.id, { email: user.email ?? undefined });
  } else {
    resetAnalytics();
  }
}, [isLoaded, isSignedIn, user]);

// In App() — remove ClerkProvider wrapper:
function App() {
  return (
    <SubscriptionProvider>
      <OnboardingProvider>
        <AppRoutes />
      </OnboardingProvider>
    </SubscriptionProvider>
  );
}
```

Add the `/auth/callback` route in the unauthenticated section (it must be accessible before sign-in):

```typescript
// In the Routes block, BEFORE the isSignedIn check:
const AuthCallbackPage = lazy(() =>
  import('../pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage }))
);

// In the Routes:
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

Also remove the `clerkTimedOut` error UI block (lines 133-151 in original).

**Step 2: Update main.tsx — remove ClerkProvider (if it was there)**

Check `src/main.tsx` — it does NOT currently wrap with `ClerkProvider` (App.tsx does). No change needed.

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | grep "App.tsx\|clerk" | head -20
```

**Step 4: Run tests**

```bash
npm test 2>&1 | tail -10
```

**Step 5: Commit**

```bash
git add src/app/App.tsx
git commit -m "feat: App.tsx — remove ClerkProvider, use Supabase auth state, add /auth/callback route"
```

---

## Task 14: Delete dead API endpoints and Clerk webhook

**Files to delete:**

- `api/subscriptions/current.ts`
- `api/usage/current.ts`
- `api/sessions/create.ts`
- `api/sessions/list.ts`
- `api/sessions/[id].ts`
- `api/sessions/import.ts`
- `api/sessions/upsert.ts`
- `api/credits/balance.ts`
- `api/user-settings/preferences.ts`
- `api/webhooks/clerk.ts`

**Step 1: Check for any remaining imports of these files**

```bash
grep -r "api/subscriptions/current\|api/usage/current\|api/sessions/\|api/credits/balance\|api/user-settings/preferences\|api/webhooks/clerk" src/ --include="*.ts" --include="*.tsx"
```

If any imports exist, update them first (they should not — all callers were updated in previous tasks).

**Step 2: Delete the files**

```bash
rm api/subscriptions/current.ts
rm api/usage/current.ts
rm api/sessions/create.ts
rm api/sessions/list.ts
rm "api/sessions/[id].ts"
rm api/sessions/import.ts
rm api/sessions/upsert.ts
rm api/credits/balance.ts
rm api/user-settings/preferences.ts
rm api/webhooks/clerk.ts
```

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | tail -20
```

**Step 4: Run tests**

```bash
npm test 2>&1 | tail -10
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: delete Clerk webhook and API endpoints now served by direct Supabase client queries"
```

---

## Task 15: Update session-manager — direct Supabase queries for cloud sync

**Files:**

- Modify: `src/utils/session-manager.ts`

**Step 1: Check which session-manager functions call the deleted API endpoints**

```bash
grep -n "api/sessions\|fetchWithAuth\|getToken" src/utils/session-manager.ts | head -30
```

**Step 2: Replace API calls with direct Supabase queries**

For any function that called `fetch('/api/sessions/...')`, replace with `supabaseClient.from('sessions').insert/select/upsert/update(...)`.

The pattern for each operation:

```typescript
// Before (example for upsert)
await fetchWithAuth(getToken, '/api/sessions/upsert', {
  method: 'POST',
  body: JSON.stringify(data),
});

// After
const { error } = await supabaseClient.from('sessions').upsert(data);
if (error) throw error;
```

Read `src/utils/session-manager.ts` fully before making changes to understand exact function signatures and the data shape.

**Step 3: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1 | tail -20
```

**Step 4: Run tests**

```bash
npm test 2>&1 | tail -10
```

**Step 5: Commit**

```bash
git add src/utils/session-manager.ts
git commit -m "feat: session-manager — replace API calls with direct Supabase client queries"
```

---

## Task 16: Remove Clerk packages and env vars

**Files:**

- Modify: `package.json` (via npm uninstall)
- Modify: `.env.local.example`
- Modify: `vercel.json` (if it references Clerk env vars)

**Step 1: Check all remaining Clerk imports**

```bash
grep -r "@clerk" src/ api/ --include="*.ts" --include="*.tsx" -l
```

This should return empty (no files). If any remain, fix them before proceeding.

**Step 2: Uninstall Clerk packages**

```bash
npm uninstall @clerk/react @clerk/backend
```

**Step 3: Check for svix (used only by Clerk webhook)**

```bash
grep -r "svix" api/ --include="*.ts" -l
```

If only used in the deleted `api/webhooks/clerk.ts`, uninstall:

```bash
npm uninstall svix
```

**Step 4: Update .env.local.example**

Remove these lines:

```
VITE_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
STRIPE_PRICE_TEAM_MONTHLY=
STRIPE_PRICE_TEAM_ANNUAL=
```

Add if not present:

```
# Supabase Auth handles authentication (no Clerk needed)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Step 5: Run build to verify clean**

```bash
npm run build 2>&1 | tail -20
```

Expected: successful build, no Clerk references.

**Step 6: Run all tests**

```bash
npm run test:all 2>&1 | tail -15
```

**Step 7: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "chore: remove @clerk/react, @clerk/backend, svix packages; clean env vars"
```

---

## Task 17: Supabase Dashboard — Enable Auth Providers

This is a manual configuration step in the Supabase dashboard (not code).

**Step 1: Enable Email (magic link)**

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. **Disable** "Confirm email" (or keep enabled for production)
4. **Disable** "Email password sign-in" (magic link only)

**Step 2: Enable OAuth providers**

For each provider (Google, GitHub, Apple):

1. Enable the provider
2. Add Client ID and Client Secret from each OAuth app
3. Set callback URL: `https://trammarise.app/auth/callback`

**For Google:**

- Create OAuth credentials at console.cloud.google.com
- Add `https://<project-ref>.supabase.co/auth/v1/callback` as authorized redirect URI

**For GitHub:**

- Create OAuth App at github.com/settings/applications
- Callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`

**For Apple:**

- Create Sign In with Apple at developer.apple.com
- Requires paid Apple Developer account

**Step 3: Set Site URL**

Authentication → URL Configuration:

- Site URL: `https://trammarise.app`
- Add redirect URL: `https://trammarise.app/auth/callback`
- Add redirect URL: `http://localhost:5173/auth/callback` (for dev)

**Step 4: Test locally**

```bash
npm run dev
```

Visit `http://localhost:5173` → click "Get Started" → SignInModal appears → enter email → check for magic link email.

---

## Task 18: Final verification

**Step 1: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | tail -10
```

Expected: 0 errors.

**Step 2: Lint**

```bash
npm run lint 2>&1 | tail -10
```

Expected: 0 errors.

**Step 3: All tests**

```bash
npm run test:all 2>&1 | tail -15
```

Expected: all pass (2 pre-existing failures in UploadRecordTabs.test.tsx and ChatSidePanel.test.tsx are unrelated — acceptable).

**Step 4: Production build**

```bash
npm run build 2>&1 | tail -10
```

Expected: successful build.

**Step 5: Smoke test**

```bash
npm run dev
```

Verify:

- [ ] WelcomePage loads, "Get Started" opens SignInModal
- [ ] Magic link email sign-in works
- [ ] After sign-in, `public.users` row exists in Supabase
- [ ] `subscriptions` query returns FREE_SUBSCRIPTION (no row yet)
- [ ] Onboarding flow completes
- [ ] Sign-out works, clears session
- [ ] `/auth/callback` route redirects to `/`

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Clerk → Supabase Auth migration"
```

**Step 7: Create PR**

```bash
gh pr create --title "feat: migrate from Clerk to Supabase Auth" --body "$(cat <<'EOF'
## Summary
- Replace Clerk with Supabase Auth (magic link + Google/Apple/GitHub OAuth)
- Enable RLS on all tables — browser queries DB directly (no more wrapper API endpoints)
- Remove Team tier — Free and Pro only
- Delete 10 API endpoints replaced by direct Supabase client queries
- Remove @clerk/react, @clerk/backend, svix packages

## Test plan
- [ ] TypeScript: 0 errors (`npx tsc --noEmit`)
- [ ] Lint: 0 errors (`npm run lint`)
- [ ] All tests pass (`npm run test:all`)
- [ ] Build succeeds (`npm run build`)
- [ ] Magic link sign-in works end-to-end
- [ ] OAuth sign-in works (at least one provider)
- [ ] Sign-out clears session
- [ ] Onboarding flow completes for new user
- [ ] Subscription context falls back to free tier correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
