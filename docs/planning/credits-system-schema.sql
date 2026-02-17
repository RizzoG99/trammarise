-- Credits System Database Schema
-- Phase 2 Week 6: Credits Purchase and Tracking

-- =====================================================
-- CREDITS COLUMNS (if not already added)
-- =====================================================

-- Add to subscriptions table (if not exists)
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS credits_balance NUMERIC DEFAULT 0;

-- Add to usage_events table (if not exists)
ALTER TABLE usage_events 
ADD COLUMN IF NOT EXISTS credits_consumed NUMERIC DEFAULT 0;

-- =====================================================
-- CREDITS TRANSACTIONS TABLE
-- =====================================================
-- Track all credit purchases and deductions for audit trail

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction Type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'deduction', 'refund', 'bonus')),
  
  -- Amount
  credits_amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  
  -- Purchase Details (for 'purchase' type)
  stripe_payment_intent_id TEXT,
  amount_paid_cents INTEGER, -- USD cents
  
  -- Usage Reference (for 'deduction' type)
  usage_event_id UUID REFERENCES usage_events(id) ON DELETE SET NULL,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_credit_transactions_stripe ON credit_transactions(stripe_payment_intent_id);

-- =====================================================
-- CREDITS PRICING TIERS
-- =====================================================
-- Stored in code, not database
-- $5 = 50 minutes (10¢/minute)
-- $15 = 175 minutes (8.5¢/minute - 15% discount)
-- $30 = 400 minutes (7.5¢/minute - 25% discount)
-- $50 = 750 minutes (6.6¢/minute - 34% discount)

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY credit_transactions_user_access ON credit_transactions
  FOR SELECT
  USING (auth.uid()::text = (SELECT clerk_user_id FROM users WHERE id = user_id));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to deduct credits from subscription balance
CREATE OR REPLACE FUNCTION deduct_credits(
  sub_id UUID,
  credits NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  UPDATE subscriptions
  SET credits_balance = credits_balance - credits
  WHERE id = sub_id
  RETURNING credits_balance INTO new_balance;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to add credits to subscription balance
CREATE OR REPLACE FUNCTION add_credits(
  sub_id UUID,
  credits NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  new_balance NUMERIC;
BEGIN
  UPDATE subscriptions
  SET credits_balance = credits_balance + credits
  WHERE id = sub_id
  RETURNING credits_balance INTO new_balance;
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;
