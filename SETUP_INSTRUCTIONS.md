# Manual Setup Instructions for BYOK Implementation

## Overview

This document outlines the manual steps required to complete the BYOK (Bring Your Own Key) implementation for authenticated free users.

## 1. Environment Variables

Add the following environment variable to your `.env` file and Vercel environment settings:

```bash
# Encryption key for API key storage (64-character hex string)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=<your-64-character-hex-string>
```

**To generate the encryption key:**

```bash
openssl rand -hex 32
```

**Deployment:**

1. Add `ENCRYPTION_KEY` to Vercel environment variables (Production + Preview)
2. Redeploy after adding the variable

---

## 2. Supabase Database Schema

### Create `user_settings` Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create user_settings table for encrypted API key storage
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_api_key_encrypted TEXT, -- Encrypted API key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own settings
CREATE POLICY "Users can manage their own settings"
ON user_settings
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Index for fast lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Add comment
COMMENT ON TABLE user_settings IS 'User-specific settings including encrypted API keys';
```

### Create `audio-files` Storage Bucket (Private)

**IMPORTANT: The bucket is PRIVATE for security. Audio files are accessed through authenticated API endpoints, not direct URLs.**

Run the migration from `supabase/migrations/003_audio_storage_bucket.sql` in Supabase SQL Editor:

```sql
-- Migration 003: Create private audio-files storage bucket
-- Security: Private bucket with owner-based RLS policies
-- Access: Files must be retrieved through authenticated API endpoints
-- Organized by: {sessionId}/{filename}

-- Create PRIVATE bucket (public=false for security)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  false,  -- PRIVATE bucket (not publicly accessible)
  104857600,  -- 100MB limit per file
  ARRAY['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/webm']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy 1: Authenticated users can upload audio files
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-files'
  AND auth.role() = 'authenticated'
);

-- RLS Policy 2: Users can read ONLY their own audio files
CREATE POLICY "Users can read own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-files'
  AND owner = auth.uid()::text
);

-- RLS Policy 3: Users can delete their own files
CREATE POLICY "Users can delete own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-files'
  AND owner = auth.uid()::text
);

-- RLS Policy 4: Users can update their own files
CREATE POLICY "Users can update own audio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio-files'
  AND owner = auth.uid()::text
);
```

**Hybrid Storage Strategy:**

The app uses a tiered storage approach based on subscription:

| Tier     | Local Storage | Cloud Storage    | Cross-Device Sync | Cost/100 Users/Month |
| -------- | ------------- | ---------------- | ----------------- | -------------------- |
| **Free** | ✅ IndexedDB  | ❌ None          | ❌ No             | $0                   |
| **Pro**  | ✅ IndexedDB  | ✅ Metadata only | ⚠️ Results only   | ~$0.02               |
| **Team** | ✅ IndexedDB  | ✅ Full audio    | ✅ Full sync      | ~$55.50              |

**Accessing Audio Files:**

Audio files are served through `/api/audio/:sessionId` endpoint which:

1. Verifies user authentication (Clerk JWT)
2. Checks session ownership
3. Streams file from private bucket
4. Prevents unauthorized access

**Security Benefits:**

- ✅ Private bucket prevents URL stealing
- ✅ RLS policies enforce owner-only access
- ✅ Authenticated API endpoint required
- ✅ File size limited to 100MB
- ✅ Only audio MIME types allowed

---

## 3. Verification Steps

### Test API Key Encryption

```bash
# 1. Sign in to the app
# 2. Navigate to Settings or Configuration
# 3. Enter OpenAI API key
# 4. Check "Remember my API key"
# 5. Submit

# Verify in Supabase:
# - Go to Table Editor → user_settings
# - You should see a row with your user_id
# - openai_api_key_encrypted should contain encrypted data (not plaintext)
```

### Test BYOK Transcription

```bash
# Scenario A: Free user with session-only API key
# 1. Sign in (no subscription)
# 2. Configure API key (don't check "Remember")
# 3. Upload audio → Should transcribe successfully
# 4. Check console logs for: "[Transcribe] User <userId> using BYOK mode"
# 5. Close tab and reopen → API key should be gone

# Scenario B: Free user with saved API key
# 1. Sign in (no subscription)
# 2. Configure API key + check "Remember my API key"
# 3. Upload audio → Should transcribe successfully
# 4. Close tab and reopen → API key should still be there
# 5. Process audio → Should still work

# Scenario C: Free user without API key
# 1. Sign in (no subscription, no API key)
# 2. Try to upload audio
# 3. Should get 403 error with message:
#    "Free tier users must provide their own OpenAI API key. Configure it in Settings or upgrade to Pro."
# 4. Error should include requiresApiKey: true flag
```

### Test Paid Users

```bash
# Scenario: Pro/Team user
# 1. Sign in with Pro/Team subscription (no API key needed)
# 2. Upload audio → Should use platform API
# 3. Check console logs for: "[Transcribe] User <userId> (pro/team) using platform API with quota tracking"
# 4. Verify quota deduction in subscriptions table
```

---

## 4. Security Checklist

- [ ] `ENCRYPTION_KEY` is set in environment variables
- [ ] `ENCRYPTION_KEY` is exactly 64 characters (32 bytes in hex)
- [ ] `ENCRYPTION_KEY` is different for production and development
- [ ] `user_settings` table has RLS enabled
- [ ] RLS policies prevent users from accessing other users' settings
- [ ] API keys in database are encrypted (not plaintext)
- [ ] Session storage API keys are cleared on tab close
- [ ] No API keys logged to console (except in development)

---

## 5. Migration Notes

### Existing Users

For existing users who had the old BYOK system:

- They will need to reconfigure their API keys
- Previous session storage keys will still work until tab is closed
- Inform users via email or in-app notification about the new "Remember my API key" feature

### Rollback Plan

If issues arise:

1. Keep the transcription API changes (they fix the core issue)
2. The API key storage feature can be disabled by removing the "Remember" checkbox
3. Session-only API keys will continue to work

---

## 6. Monitoring

### Logs to Watch

```bash
# Success logs:
[Transcribe] User <userId> using BYOK mode
[Transcribe] User <userId> (pro/team) using platform API with quota tracking

# Error logs to monitor:
- "API key required" (expected for free users without keys)
- "Quota exceeded" (expected for paid users who hit limits)
- Encryption/decryption errors (investigate immediately)
```

### Metrics to Track

- Number of free users using BYOK
- Number of free users with saved API keys
- Number of paid users using platform API
- Transcription success rate by tier
- API key validation failures

---

## 7. Known Limitations

1. **API Key Sharing**: Users can only save one OpenAI API key per account
2. **Key Rotation**: Users must manually update their saved API key if they rotate it
3. **Browser Dependency**: Session-only API keys are browser-specific (won't sync across devices)
4. **Encryption**: Uses AES-256-GCM, considered secure but not hardware-backed

---

## 8. Future Enhancements

- [ ] Support multiple API key providers (Anthropic, etc.)
- [ ] API key rotation reminders
- [ ] Usage analytics for BYOK users (via OpenAI API)
- [ ] Key validation on save (test connection before storing)
- [ ] Browser extension for secure key management

---

## Support

For issues or questions:

- Check logs in Vercel dashboard
- Verify Supabase RLS policies are active
- Test encryption/decryption independently
- Contact dev team for encryption key issues
