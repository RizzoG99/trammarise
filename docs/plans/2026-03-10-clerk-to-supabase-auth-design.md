# Clerk → Supabase Auth Migration Design

**Goal:** Replace Clerk with Supabase Auth, enable RLS for direct browser→DB queries, remove Team tier, keep only Free and Pro plans.

**Date:** 2026-03-10

---

## Context

- Auth: Clerk (frontend + backend), replaced by Supabase Auth
- DB: Supabase (Postgres), all access currently via server-side `supabaseAdmin`
- No real users — fresh start, no migration needed
- Billing: Free + Pro only (Team removed)

---

## Section 1: Database & Auth Model

### `public.users` table

- Drop `clerk_user_id TEXT UNIQUE NOT NULL` column
- Change `id` to reference `auth.users(id) ON DELETE CASCADE`
- `auth.uid()` maps 1:1 to `public.users.id`

Auto-create profile on sign-up via Postgres trigger:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  INSERT INTO public.users (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### RLS Policies

All tables get policies using `auth.uid()`:

```sql
-- users (self-referential)
CREATE POLICY "own" ON public.users FOR ALL USING (id = auth.uid());

-- all other tables
CREATE POLICY "own" ON public.subscriptions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own" ON public.sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own" ON public.user_settings FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own" ON public.usage_events FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own" ON public.credit_transactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "own" ON public.team_memberships FOR ALL USING (false); -- effectively locked
```

### Team Tier Removal

- Migration: remove `'team'` from `subscriptions.tier` CHECK constraint
- `SubscriptionTier` type: `'free' | 'pro'` (remove `'team'`)
- `TIER_MINUTES`: `{ free: 60, pro: 500 }`
- Remove `team-collaboration`, `shared-workspaces`, `admin-controls` features from `subscription-tiers.ts`
- Remove `STRIPE_PRICE_TEAM_*` env vars
- `credit_transactions` table and `add_credits`/`deduct_credits` functions stay (Pro credits remain)

### Clerk Webhook

`api/webhooks/clerk.ts` — **deleted**. Supabase Auth + trigger handles user lifecycle.

---

## Section 2: API Layer Simplification

### Deleted Endpoints (replaced by direct Supabase client queries)

| Endpoint                                 | Browser replacement                              |
| ---------------------------------------- | ------------------------------------------------ |
| `api/subscriptions/current.ts`           | `supabase.from('subscriptions').select()`        |
| `api/usage/current.ts`                   | `supabase.from('usage_events').select()`         |
| `api/sessions/create.ts`                 | `supabase.from('sessions').insert()`             |
| `api/sessions/list.ts`                   | `supabase.from('sessions').select()`             |
| `api/sessions/[id].ts`                   | `supabase.from('sessions').select/update()`      |
| `api/sessions/import.ts`                 | `supabase.from('sessions').select()`             |
| `api/sessions/upsert.ts`                 | `supabase.from('sessions').upsert()`             |
| `api/credits/balance.ts`                 | `supabase.from('credit_transactions').select()`  |
| `api/user-settings/preferences.ts`       | `supabase.from('user_settings').select/update()` |
| `api/webhooks/clerk.ts`                  | Supabase trigger                                 |
| `api/middleware/auth.ts` (Clerk version) | New slim Supabase version                        |

### Remaining Server-Side Endpoints

| Endpoint                                | Reason                          |
| --------------------------------------- | ------------------------------- |
| `api/transcribe.ts` + job routes        | OpenAI Whisper (compute)        |
| `api/summarize.ts`                      | AI (compute)                    |
| `api/chat.ts`                           | AI (compute)                    |
| `api/user-settings/api-key.ts`          | `ENCRYPTION_KEY` server secret  |
| `api/stripe/create-checkout-session.ts` | Stripe secret key               |
| `api/webhooks/stripe.ts`                | Stripe secret + DB admin writes |
| `api/credits/purchase.ts`               | Stripe secret key               |
| `api/validate-key.ts`                   | Public, stays as-is             |

### New Auth Middleware

```typescript
// api/middleware/auth.ts (replaces Clerk version)
export async function requireAuth(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) throw new Response('Unauthorized', { status: 401 });
  return user; // user.id === auth.uid()
}
```

Frontend server calls pass Supabase session token in `Authorization` header (same pattern as today, different token source).

---

## Section 3: Frontend Auth UI

### Sign-in Flow

- `SignInModal` component on `WelcomePage`
- Magic link: user enters email → `supabase.auth.signInWithOtp({ email })` → Supabase emails link → user clicks → redirected to `/auth/callback` → session established
- OAuth (Google, Apple, GitHub): `supabase.auth.signInWithOAuth({ provider })` → redirect → `/auth/callback` → session established

### New Routes

- `/auth/callback` — handles `supabase.auth.exchangeCodeForSession()`, redirects to `/`

### Deleted Clerk UI

- `ClerkProvider` (from `main.tsx` / `App.tsx`)
- `useUser`, `useAuth` from `@clerk/react`
- `SignInButton`, `SignOutButton` from `@clerk/react`
- `CustomUserMenu` Clerk internals
- `fetchWithAuth` helper (for data ops — kept only for compute endpoints)
- `api/middleware/auth.ts` (Clerk version)

### New Auth State

```typescript
// App.tsx
const [session, setSession] = useState<Session | null>(null);
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setSession(data.session));
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });
  return () => subscription.unsubscribe();
}, []);
```

Custom `useUser()` hook wraps `supabase.auth.getSession()`.

---

## Section 4: Contexts

### SubscriptionContext

Replace `fetchWithAuth('/api/subscriptions/current')` with:

```typescript
supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
```

### OnboardingContext

- Replace `useUser()` from Clerk with Supabase session
- Replace `getSavedApiKey()` API call with `supabase.from('user_settings').select('openai_api_key_encrypted')`
- Note: decrypting API key still goes through server (needs `ENCRYPTION_KEY`)

### SubscriptionTier type

```typescript
// Before
type SubscriptionTier = 'free' | 'pro' | 'team';
// After
type SubscriptionTier = 'free' | 'pro';
```

---

## Environment Variables

### Removed

- `VITE_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `STRIPE_PRICE_TEAM_MONTHLY`
- `STRIPE_PRICE_TEAM_ANNUAL`

### Kept

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`
- `ENCRYPTION_KEY`

### Added

- `SUPABASE_JWT_SECRET` (for server-side JWT verification if needed)

---

## Auth Provider Config (Supabase Dashboard)

Enable in Supabase Auth settings:

- Email (magic link, disable email+password)
- Google OAuth
- Apple OAuth
- GitHub OAuth

Callback URL: `https://trammarise.app/auth/callback` (+ localhost for dev)
