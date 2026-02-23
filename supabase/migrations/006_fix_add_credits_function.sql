-- Migration 006: Fix add_credits function to include payment audit fields
-- Updates add_credits() signature to accept payment metadata and include it
-- in the credit_transactions record, eliminating the need for a separate insert
-- from application code (which caused duplicate rows and stale balance_after values).

CREATE OR REPLACE FUNCTION add_credits(
  sub_id UUID,
  credits NUMERIC,
  stripe_payment_intent_id TEXT DEFAULT NULL,
  amount_paid_cents BIGINT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
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

  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    credits_amount,
    balance_after,
    stripe_payment_intent_id,
    amount_paid_cents,
    description
  )
  VALUES (
    user_uuid,
    'purchase',
    credits,
    new_balance,
    stripe_payment_intent_id,
    amount_paid_cents,
    p_description
  );

  RETURN new_balance;
END;
$$;
