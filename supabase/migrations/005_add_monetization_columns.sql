-- Migration 004: Add monetization and usage tracking columns to existing tables
-- This migration updates the existing schema to support billing and usage features

-- ============================================================================
-- 1. ALTER SUBSCRIPTIONS TABLE
-- ============================================================================
-- Add columns for billing tier, Stripe integration, and usage tracking

DO $$ 
BEGIN
  -- Add tier column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='tier') THEN
    ALTER TABLE subscriptions ADD COLUMN tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'team'));
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='status') THEN
    ALTER TABLE subscriptions ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused'));
  END IF;

  -- Add stripe_subscription_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='stripe_subscription_id') THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id TEXT UNIQUE;
  END IF;

  -- Add stripe_customer_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='stripe_customer_id') THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT;
  END IF;

  -- Add current_period_start if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='current_period_start') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_start TIMESTAMPTZ;
  END IF;

  -- Add current_period_end if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='current_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;

  -- Add cancel_at_period_end if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='cancel_at_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
  END IF;

  -- Add minutes_used if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='minutes_used') THEN
    ALTER TABLE subscriptions ADD COLUMN minutes_used NUMERIC DEFAULT 0 CHECK (minutes_used >= 0);
  END IF;

  -- Add credits_balance if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='credits_balance') THEN
    ALTER TABLE subscriptions ADD COLUMN credits_balance NUMERIC DEFAULT 0 CHECK (credits_balance >= 0);
  END IF;
END $$;

-- Create indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

COMMENT ON COLUMN subscriptions.tier IS 'Subscription tier: free (local-only), pro (metadata backup), team (full backup + unlimited processing)';
COMMENT ON COLUMN subscriptions.status IS 'Stripe subscription status. See: https://stripe.com/docs/api/subscriptions/object#subscription_object-status';
COMMENT ON COLUMN subscriptions.minutes_used IS 'Total audio minutes processed this billing cycle. Reset on renewal.';
COMMENT ON COLUMN subscriptions.credits_balance IS 'Available credits for pay-as-you-go usage (team tier only).';

-- ============================================================================
-- 2. CREATE SESSIONS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  audio_name TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0),
  audio_url TEXT,
  duration_seconds NUMERIC CHECK (duration_seconds >= 0),
  language TEXT NOT NULL DEFAULT 'en',
  content_type TEXT NOT NULL DEFAULT 'other' CHECK (content_type IN ('meeting', 'lecture', 'interview', 'podcast', 'voice_memo', 'other')),
  processing_mode TEXT CHECK (processing_mode IN ('full', 'fast', 'accurate')),
  noise_profile TEXT,
  selection_mode TEXT CHECK (selection_mode IN ('full', 'selection')),
  region_start NUMERIC CHECK (region_start >= 0),
  region_end NUMERIC CHECK (region_end >= 0),
  transcript TEXT,
  summary TEXT,
  chat_history JSONB,
  ai_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CHECK (region_end IS NULL OR region_start IS NULL OR region_end >= region_start)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_deleted_at ON sessions(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE sessions IS 'Audio processing sessions. Includes transcripts, summaries, and chat history.';

-- ============================================================================
-- 3. CREATE USAGE_EVENTS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('transcription', 'summarization', 'chat', 'other')),
  duration_seconds NUMERIC CHECK (duration_seconds >= 0),
  minutes_used NUMERIC DEFAULT 0 CHECK (minutes_used >= 0),
  minutes_consumed NUMERIC DEFAULT 0 CHECK (minutes_consumed >= 0),
  billing_period TEXT,
  credits_consumed NUMERIC DEFAULT 0 CHECK (credits_consumed >= 0),
  provider TEXT,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_session_id ON usage_events(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_billing_period ON usage_events(billing_period);

COMMENT ON TABLE usage_events IS 'Usage analytics for billing and quota enforcement.';

-- ============================================================================
-- 4. CREATE CREDIT_TRANSACTIONS TABLE (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'deduction', 'refund', 'bonus', 'adjustment')),
  credits_amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL CHECK (balance_after >= 0),
  stripe_payment_intent_id TEXT,
  amount_paid_cents INTEGER CHECK (amount_paid_cents >= 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_payment_intent_id ON credit_transactions(stripe_payment_intent_id);

COMMENT ON TABLE credit_transactions IS 'Immutable audit trail for all credit balance changes.';

-- ============================================================================
-- 5. RPC FUNCTIONS
-- ============================================================================

-- Add credits to subscription balance
CREATE OR REPLACE FUNCTION add_credits(sub_id UUID, credits NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
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

-- Deduct credits from subscription balance
CREATE OR REPLACE FUNCTION deduct_credits(sub_id UUID, credits NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
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

-- Increment minutes used
CREATE OR REPLACE FUNCTION increment_minutes_used(sub_id UUID, minutes NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
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
