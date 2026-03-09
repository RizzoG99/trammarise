-- Add onboarding_use_case to user_settings
-- Non-sensitive preference — stored as plain text, no encryption needed.

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS onboarding_use_case TEXT;

COMMENT ON COLUMN user_settings.onboarding_use_case
  IS 'User-selected use case from onboarding step 1 (meeting|lecture|interview|podcast|voice-memo|other). Null means not yet set.';
