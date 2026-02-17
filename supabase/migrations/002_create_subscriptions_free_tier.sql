-- Auto-create free-tier subscription for new users
-- This ensures every user always has a subscription record

-- Function to create default free subscription
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on user creation
DROP TRIGGER IF EXISTS trigger_create_default_subscription ON users;
CREATE TRIGGER trigger_create_default_subscription
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();
