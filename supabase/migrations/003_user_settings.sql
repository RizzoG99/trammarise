-- Create user_settings table for storing encrypted API keys
-- This migration is required for the "Remember my API key" feature
--
-- Note: Security is enforced at the API layer via Clerk authentication
-- and the requireAuth() middleware. Row-Level Security (RLS) is not used
-- because we use Clerk (not Supabase Auth) and access via service role.

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  openai_api_key_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Add comments for documentation
COMMENT ON TABLE user_settings IS 'Stores user preferences and encrypted API keys for BYOK (Bring Your Own Key) mode. Security enforced via Clerk auth at API layer.';
COMMENT ON COLUMN user_settings.openai_api_key_encrypted IS 'AES-256-GCM encrypted OpenAI API key (format: iv:tag:ciphertext). Encrypted with ENCRYPTION_KEY env var.';
