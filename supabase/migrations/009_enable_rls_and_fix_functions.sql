-- Migration 009: Enable RLS on public tables and fix function search paths
-- All DB access goes through supabaseAdmin (service role), which bypasses RLS.
-- Enabling RLS with no policies denies direct PostgREST access for anon/authenticated roles.

-- ============================================================================
-- 1. ENABLE RLS ON PUBLIC TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. FIX FUNCTION SEARCH PATHS
-- ============================================================================
-- Set search_path to prevent search_path injection attacks.

CREATE OR REPLACE FUNCTION public.add_credits(sub_id UUID, credits NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  new_balance NUMERIC;
  user_uuid UUID;
BEGIN
  UPDATE subscriptions
  SET
    credits_balance = credits_balance + credits,
    updated_at = NOW()
  WHERE id = sub_id
  RETURNING credits_balance, user_id INTO new_balance, user_uuid;

  INSERT INTO credit_transactions (user_id, transaction_type, credits_amount, balance_after)
  VALUES (user_uuid, 'purchase', credits, new_balance);

  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_credits(sub_id UUID, credits NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  new_balance NUMERIC;
  user_uuid UUID;
BEGIN
  UPDATE subscriptions
  SET
    credits_balance = credits_balance - credits,
    updated_at = NOW()
  WHERE id = sub_id
  RETURNING credits_balance, user_id INTO new_balance, user_uuid;

  INSERT INTO credit_transactions (user_id, transaction_type, credits_amount, balance_after)
  VALUES (user_uuid, 'deduction', -credits, new_balance);

  RETURN new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_minutes_used(sub_id UUID, minutes NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  new_minutes NUMERIC;
BEGIN
  UPDATE subscriptions
  SET
    minutes_used = minutes_used + minutes,
    updated_at = NOW()
  WHERE id = sub_id
  RETURNING minutes_used INTO new_minutes;

  RETURN new_minutes;
END;
$$;
