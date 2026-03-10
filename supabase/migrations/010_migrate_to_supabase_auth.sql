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

-- Drop Clerk-based RLS policies that depend on clerk_user_id
DROP POLICY IF EXISTS "sessions_user_access" ON public.sessions;
DROP POLICY IF EXISTS "team_sessions_access" ON public.sessions;
DROP POLICY IF EXISTS "subscriptions_user_access" ON public.subscriptions;
DROP POLICY IF EXISTS "usage_user_access" ON public.usage_events;

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
