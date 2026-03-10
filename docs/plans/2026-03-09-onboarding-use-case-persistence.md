# Onboarding Use Case Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist the user's onboarding use-case selection (step 1) to the database so it survives tab closes, device changes, and is strictly isolated per user account.

**Architecture:** Add an `onboarding_use_case` column to the existing `user_settings` table (one row per user, already used for the encrypted API key). A new Vercel serverless endpoint `api/user-settings/preferences.ts` handles GET / PATCH. The frontend reads the value via `OnboardingContext` (which already does a DB fetch on startup) and writes it fire-and-forget when the user picks a use case in step 1. `UploadRecordPage` reads the default content type from context instead of sessionStorage.

**Tech Stack:** Supabase (Postgres), Vercel serverless (TypeScript), React 19, Clerk auth (`useAuth` / `useUser`), Vitest + Testing Library.

---

## Task 1: Database migration — add `onboarding_use_case` column

**Files:**

- Create: `supabase/migrations/008_add_onboarding_use_case.sql`

**Step 1: Write the migration file**

```sql
-- Add onboarding_use_case to user_settings
-- Non-sensitive preference — stored as plain text, no encryption needed.

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS onboarding_use_case TEXT;

COMMENT ON COLUMN user_settings.onboarding_use_case
  IS 'User-selected use case from onboarding step 1 (meeting|lecture|interview|podcast|voice-memo|other). Null means not yet set.';
```

**Step 2: Apply it locally (if Supabase CLI is configured)**

```bash
supabase db push
```

> If not using Supabase CLI locally, this file is picked up on next deploy / manual run. No automated test needed for the SQL itself.

**Step 3: Commit**

```bash
git add supabase/migrations/008_add_onboarding_use_case.sql
git commit -m "feat(db): add onboarding_use_case column to user_settings"
```

---

## Task 2: API endpoint — `api/user-settings/preferences.ts`

**Files:**

- Create: `api/user-settings/preferences.ts`
- Create: `api/__tests__/user-settings/preferences.test.ts`

### Step 1: Write the failing tests first

```typescript
// api/__tests__/user-settings/preferences.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../user-settings/preferences';
import * as auth from '../../middleware/auth';
import { supabaseAdmin } from '../../lib/supabase-admin';

vi.mock('../../middleware/auth');
vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: { from: vi.fn() },
}));

describe('GET /api/user-settings/preferences', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    req = { method: 'GET', body: {} };
    res = { status: statusMock, json: jsonMock };
    vi.mocked(auth.requireAuth).mockResolvedValue({ userId: 'user-123', clerkId: 'clerk-123' });
  });

  it('returns onboarding_use_case when row exists', async () => {
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { onboarding_use_case: 'meeting' },
            error: null,
          }),
        }),
      }),
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ onboardingUseCase: 'meeting' });
  });

  it('returns null when no row exists', async () => {
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(jsonMock).toHaveBeenCalledWith({ onboardingUseCase: null });
  });

  it('returns 500 on DB error', async () => {
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('db fail') }),
        }),
      }),
    } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(500);
  });
});

describe('PATCH /api/user-settings/preferences', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    req = { method: 'PATCH', body: {} };
    res = { status: statusMock, json: jsonMock };
    vi.mocked(auth.requireAuth).mockResolvedValue({ userId: 'user-123', clerkId: 'clerk-123' });
  });

  it('saves valid use case', async () => {
    req.body = { onboardingUseCase: 'lecture' };
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabaseAdmin.from).mockReturnValue({ upsert: mockUpsert } as never);

    await handler(req as VercelRequest, res as VercelResponse);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123', onboarding_use_case: 'lecture' }),
      { onConflict: 'user_id' }
    );
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true });
  });

  it('rejects invalid use case value', async () => {
    req.body = { onboardingUseCase: 'invalid-value' };

    await handler(req as VercelRequest, res as VercelResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
  });

  it('returns 405 for unsupported methods', async () => {
    req.method = 'DELETE';
    await handler(req as VercelRequest, res as VercelResponse);
    expect(statusMock).toHaveBeenCalledWith(405);
  });
});
```

**Step 2: Run to confirm they fail**

```bash
npm run api-test -- preferences 2>&1 | tail -15
```

Expected: FAIL — "Cannot find module '../../user-settings/preferences'"

**Step 3: Write the implementation**

```typescript
// api/user-settings/preferences.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';

const VALID_USE_CASES = [
  'meeting',
  'lecture',
  'interview',
  'podcast',
  'voice-memo',
  'other',
] as const;
type UseCase = (typeof VALID_USE_CASES)[number];

function isValidUseCase(value: unknown): value is UseCase {
  return typeof value === 'string' && (VALID_USE_CASES as readonly string[]).includes(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = await requireAuth(req);

    switch (req.method) {
      case 'GET':
        return await handleGet(userId, res);
      case 'PATCH':
        return await handlePatch(userId, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AuthError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(userId: string, res: VercelResponse) {
  const { data, error } = await supabaseAdmin
    .from('user_settings')
    .select('onboarding_use_case')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch preferences:', error);
    return res.status(500).json({ error: 'Failed to retrieve preferences' });
  }

  return res.status(200).json({
    onboardingUseCase: data?.onboarding_use_case ?? null,
  });
}

async function handlePatch(userId: string, req: VercelRequest, res: VercelResponse) {
  const { onboardingUseCase } = req.body ?? {};

  if (!isValidUseCase(onboardingUseCase)) {
    return res
      .status(400)
      .json({ error: `Invalid use case. Must be one of: ${VALID_USE_CASES.join(', ')}` });
  }

  const { error } = await supabaseAdmin.from('user_settings').upsert(
    {
      user_id: userId,
      onboarding_use_case: onboardingUseCase,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Failed to save preference:', error);
    return res.status(500).json({ error: 'Failed to save preference' });
  }

  return res.status(200).json({ success: true });
}
```

**Step 4: Run tests — confirm they pass**

```bash
npm run api-test -- preferences 2>&1 | tail -10
```

Expected: all PASS

**Step 5: Commit**

```bash
git add api/user-settings/preferences.ts api/__tests__/user-settings/preferences.test.ts
git commit -m "feat(api): add preferences endpoint for onboarding_use_case"
```

---

## Task 3: Frontend utility functions in `src/utils/api.ts`

**Files:**

- Modify: `src/utils/api.ts` (append two functions at the end)

**Step 1: Add the two functions** — open `src/utils/api.ts` and append after `deleteSavedApiKey`:

```typescript
/**
 * Save onboarding use case to backend
 */
export async function saveOnboardingUseCaseToDb(
  useCase: string,
  getToken?: (() => Promise<string | null>) | null
): Promise<void> {
  try {
    await fetchWithAuth(
      getToken || null,
      '/api/user-settings/preferences',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingUseCase: useCase }),
      },
      API_DEFAULT_TIMEOUT
    );
  } catch (error) {
    // Non-critical: log and swallow — does not block the user flow
    console.error('Failed to save onboarding use case:', error);
  }
}

/**
 * Retrieve onboarding use case from backend
 */
export async function getOnboardingUseCaseFromDb(
  getToken?: (() => Promise<string | null>) | null
): Promise<string | null> {
  try {
    const response = await fetchWithAuth(
      getToken || null,
      '/api/user-settings/preferences',
      { method: 'GET' },
      API_DEFAULT_TIMEOUT
    );
    const data = await response.json();
    return data.onboardingUseCase ?? null;
  } catch {
    return null;
  }
}
```

> Note: both functions are intentionally forgiving (`void` / `null` fallback). Preference data must never block the user from using the app.

**Step 2: No new tests needed** — these are thin wrappers over `fetchWithAuth`, the same pattern as `saveApiKey`/`getSavedApiKey` which are already tested indirectly. If you want coverage, mirror the pattern in `src/utils/api.test.ts` (check if that file exists first).

**Step 3: Commit**

```bash
git add src/utils/api.ts
git commit -m "feat(utils): add saveOnboardingUseCaseToDb / getOnboardingUseCaseFromDb"
```

---

## Task 4: Extend `OnboardingContext` to expose `onboardingUseCase`

The context already fetches the API key from DB on startup. We extend it to **also fetch** the use case in the same call, keeping a single round-trip.

**Files:**

- Modify: `src/context/OnboardingContext.tsx`

**Step 1: Update the context interface and state**

Add to the interface:

```typescript
onboardingUseCase: string | null;
```

Add state inside `OnboardingProvider`:

```typescript
const [onboardingUseCase, setOnboardingUseCase] = useState<string | null>(null);
```

**Step 2: Extend `checkOnboardingStatus` to also fetch the use case**

In the `try` block where `getSavedApiKey()` is called, add a parallel fetch:

```typescript
const [savedKey, savedUseCase] = await Promise.all([
  getSavedApiKey(),
  getOnboardingUseCaseFromDb(), // new import from @/utils/api
]);

if (savedUseCase) setOnboardingUseCase(savedUseCase);

if (savedKey.hasKey && savedKey.apiKey) {
  saveApiConfig('openai', savedKey.apiKey, savedKey.apiKey);
  setNeedsOnboarding(false);
} else {
  setNeedsOnboarding(true);
}
```

> Using `Promise.all` means both calls happen in parallel — zero extra latency vs. today.

**Step 3: Expose `onboardingUseCase` in the provider value**

```typescript
value={{
  needsOnboarding,
  isCheckingOnboarding,
  completeOnboarding,
  isViewingPricing,
  setIsViewingPricing,
  onboardingUseCase,          // new
}}
```

**Step 4: Update the tests for `OnboardingContext`**

Find `src/context/OnboardingContext.test.tsx` (check it exists). Add a test:

```typescript
it('fetches and exposes onboardingUseCase from DB', async () => {
  vi.mocked(getOnboardingUseCaseFromDb).mockResolvedValue('podcast');
  // render provider + check context value returns 'podcast'
});
```

Also update any existing mock of `useOnboarding` in other test files to include `onboardingUseCase: null` (grep for `useOnboarding` mocks).

**Step 5: Run frontend tests**

```bash
npm test OnboardingContext 2>&1 | tail -10
```

**Step 6: Commit**

```bash
git add src/context/OnboardingContext.tsx
git commit -m "feat(context): expose onboardingUseCase from DB in OnboardingContext"
```

---

## Task 5: Update `OnboardingPage` — pre-populate + save on selection

**Files:**

- Modify: `src/features/onboarding/OnboardingPage.tsx`
- Modify: `src/features/onboarding/OnboardingPage.test.tsx`

**Step 1: Write failing tests**

Add to `OnboardingPage.test.tsx`:

```typescript
// Update the useOnboarding mock to include onboardingUseCase
vi.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => ({
    completeOnboarding: mockCompleteOnboarding,
    needsOnboarding: true,
    isCheckingOnboarding: false,
    isViewingPricing: false,
    setIsViewingPricing: vi.fn(),
    onboardingUseCase: null,   // default — override per-test
  }),
}));

// Add mock for saveOnboardingUseCaseToDb
const mockSaveOnboardingUseCaseToDb = vi.fn().mockResolvedValue(undefined);
// Update the @/utils/api mock to include it:
vi.mock('@/utils/api', () => ({
  validateApiKey: (...args: unknown[]) => mockValidateApiKey(...args),
  saveApiKey: (...args: unknown[]) => mockSaveApiKeyFn(...args),
  saveOnboardingUseCaseToDb: (...args: unknown[]) => mockSaveOnboardingUseCaseToDb(...args),
}));

it('pre-populates use case from context', () => {
  vi.mocked(useOnboarding).mockReturnValueOnce({
    ...defaultOnboardingMock,
    onboardingUseCase: 'podcast',
  });
  render(<OnboardingPage />);
  // The 'Podcast' option should have the selected visual state
  expect(screen.getByRole('button', { name: /podcast/i })).toHaveAttribute('aria-pressed', 'true');
});

it('calls saveOnboardingUseCaseToDb when user picks a use case', async () => {
  render(<OnboardingPage />);
  fireEvent.click(screen.getByRole('button', { name: /lecture/i }));
  await waitFor(() =>
    expect(mockSaveOnboardingUseCaseToDb).toHaveBeenCalledWith('lecture', expect.any(Function))
  );
});
```

**Step 2: Run to confirm they fail**

```bash
npm test OnboardingPage 2>&1 | tail -15
```

**Step 3: Update `OnboardingPage.tsx`**

1. Import `saveOnboardingUseCaseToDb` from `@/utils/api`
2. Import `useUser` from `@clerk/react` (already imported `useAuth`)
3. Read `onboardingUseCase` from `useOnboarding()` context
4. Initialize `selectedUseCase` state from context value:

```typescript
const { onboardingUseCase, completeOnboarding } = useOnboarding();
const [selectedUseCase, setSelectedUseCase] = useState<string>(onboardingUseCase ?? '');
```

5. Add a handler that saves on selection:

```typescript
const handleSelectUseCase = (id: string) => {
  setSelectedUseCase(id);
  // Fire and forget — non-blocking
  void saveOnboardingUseCaseToDb(id, getToken);
};
```

6. Pass `handleSelectUseCase` to `UseCaseStep` instead of `setSelectedUseCase`:

```tsx
<UseCaseStep selectedUseCase={selectedUseCase} onSelect={handleSelectUseCase} />
```

7. Remove the `saveOnboardingUseCase` call from `handleFinish` (it's now saved on selection)

8. Remove the import of `saveOnboardingUseCase` from `@/utils/session-storage`

**Step 4: Run tests — confirm they pass**

```bash
npm test OnboardingPage 2>&1 | tail -10
```

**Step 5: Commit**

```bash
git add src/features/onboarding/OnboardingPage.tsx src/features/onboarding/OnboardingPage.test.tsx
git commit -m "feat(onboarding): save use case to DB on selection, pre-populate from context"
```

---

## Task 6: Update `UploadRecordPage` — async default from context

The page currently reads the use case **synchronously** from sessionStorage in the `useState` initializer. Replace it with an async value from `OnboardingContext`.

**Files:**

- Modify: `src/app/routes/UploadRecordPage.tsx`

**Step 1: Replace the synchronous init**

Before:

```typescript
const [contentType, setContentType] = useState<ContentType>(() => {
  const saved = getOnboardingUseCase();
  return saved && isContentType(saved) ? saved : 'meeting';
});
```

After:

```typescript
const { onboardingUseCase } = useOnboarding();
const [contentType, setContentType] = useState<ContentType>('meeting');

// Sync default content type once the DB value arrives
useEffect(() => {
  if (onboardingUseCase && isContentType(onboardingUseCase)) {
    setContentType(onboardingUseCase);
  }
}, [onboardingUseCase]);
```

**Step 2: Remove the `getOnboardingUseCase` import** from `@/utils/session-storage`

**Step 3: Run frontend tests**

```bash
npm test UploadRecordPage 2>&1 | tail -10
```

Fix any test that mocks `useOnboarding` without `onboardingUseCase` — add `onboardingUseCase: null`.

**Step 4: Commit**

```bash
git add src/app/routes/UploadRecordPage.tsx
git commit -m "refactor(upload): read default content type from OnboardingContext (DB-backed)"
```

---

## Task 7: Remove dead sessionStorage helpers

**Files:**

- Modify: `src/utils/session-storage.ts`
- Check: any remaining imports of `getOnboardingUseCase` / `saveOnboardingUseCase`

**Step 1: Verify no remaining usages**

```bash
mgrep "getOnboardingUseCase OR saveOnboardingUseCase"
```

Expected: only `session-storage.ts` itself — no other imports.

**Step 2: Delete the two functions from `session-storage.ts`**

Remove the `ONBOARDING_USE_CASE_KEY` constant, `saveOnboardingUseCase`, and `getOnboardingUseCase`.

**Step 3: Run all tests + lint**

```bash
npm run test:all && npm run lint && npx tsc --noEmit 2>&1 | tail -15
```

Expected: all green, no type errors.

**Step 4: Commit**

```bash
git add src/utils/session-storage.ts
git commit -m "refactor(storage): remove sessionStorage onboarding use case helpers (replaced by DB)"
```

---

## Task 8: Final verification

**Step 1: Run full test suite**

```bash
npm run test:all 2>&1 | tail -20
```

Expected: all tests pass (only the 2 pre-existing unrelated failures allowed).

**Step 2: Build check**

```bash
npm run build 2>&1 | tail -10
```

Expected: no errors.

**Step 3: Manual smoke test (dev server)**

1. `npm run dev`
2. Sign in as User A → complete onboarding → pick "Podcast"
3. Close browser tab, reopen → go to upload page → confirm content type defaults to "Podcast"
4. Sign in as User B → onboarding step 1 starts blank (not pre-filled with User A's choice)

**Step 4: Final commit / PR**

```bash
git push origin feature/ux-ui-refactoring
gh pr create --title "feat: persist onboarding use case to DB per user" \
  --body "Saves the Step 1 use case selection to user_settings table on pick (fire-and-forget). Loaded via OnboardingContext on startup alongside the API key fetch (parallel, zero extra latency). Replaces sessionStorage-only storage, eliminating per-user isolation and cross-device issues."
```
