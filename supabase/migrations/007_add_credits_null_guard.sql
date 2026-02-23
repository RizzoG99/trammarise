-- Migration 007: Add NULL guard to add_credits function
-- If sub_id does not match any subscription, the UPDATE returns no rows and
-- user_uuid stays NULL. Without this guard, the subsequent INSERT would
-- create a credit_transactions row with user_id = NULL (silent data corruption).
-- The function now raises an exception so Stripe retries the webhook.

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

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Subscription % not found — cannot add credits', sub_id;
  END IF;

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
