# User Settings API

## Overview

Secure API key storage and management for user settings. Supports saving encrypted API keys (OpenAI, etc.) for BYOK (Bring Your Own Key) mode.

## Endpoints

### `POST /api/user-settings/api-key`

Save encrypted API key to database.

**Request:**

```json
{
  "apiKey": "sk-proj-...",
  "provider": "openai" // optional, defaults to "openai"
}
```

**Response:**

```json
{
  "success": true,
  "message": "API key saved successfully"
}
```

### `GET /api/user-settings/api-key`

Retrieve and decrypt saved API key.

**Response:**

```json
{
  "hasKey": true,
  "apiKey": "sk-proj-..."
}
```

### `DELETE /api/user-settings/api-key`

Remove saved API key.

**Response:**

```json
{
  "success": true,
  "message": "API key deleted successfully"
}
```

## Database Setup

### Create Table

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  openai_api_key_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

### Row-Level Security (RLS)

```sql
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON user_settings FOR DELETE
  USING (auth.uid() = user_id);
```

## Environment Variables

### Required

**`ENCRYPTION_KEY`** (64-character hex string)

- Used for AES-256-GCM encryption of API keys
- Generate with: `openssl rand -hex 32`
- Must be exactly 64 characters (32 bytes in hex format)
- **CRITICAL**: Store securely and never commit to version control

Example:

```bash
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Development Setup

1. Generate encryption key:

   ```bash
   openssl rand -hex 32
   ```

2. Add to `.env`:

   ```bash
   ENCRYPTION_KEY=<your_generated_key>
   ```

3. Verify key length (should output 64):
   ```bash
   echo -n "$ENCRYPTION_KEY" | wc -c
   ```

### Production Setup

1. Generate a new key (do NOT reuse development key)
2. Add to Vercel environment variables:
   - Go to Project Settings > Environment Variables
   - Add `ENCRYPTION_KEY` with your generated value
   - Set scope to Production, Preview, and Development

## Security

- API keys are encrypted at rest using **AES-256-GCM**
- Encryption provides both confidentiality and authentication
- Each encryption operation uses a unique IV (initialization vector)
- Authentication tag prevents tampering
- Keys are never logged or exposed in error messages
- RLS policies ensure users can only access their own settings

## Implementation

- `api/utils/encryption.ts` - Encryption/decryption functions
- `api/user-settings/api-key.ts` - API endpoint handlers
- `src/types/database.ts` - TypeScript types for user_settings table

## Testing

```typescript
// Test encryption/decryption
import { encrypt, decrypt } from './api/utils/encryption';

const original = 'sk-proj-test';
const encrypted = encrypt(original);
const decrypted = decrypt(encrypted);

console.log(original === decrypted); // true
```

## Error Handling

| Status | Error                         | Cause                             |
| ------ | ----------------------------- | --------------------------------- |
| 400    | Invalid OpenAI API key format | Key doesn't start with `sk-`      |
| 401    | Unauthorized                  | Missing or invalid authentication |
| 500    | Failed to encrypt API key     | ENCRYPTION_KEY not set or invalid |
| 500    | Failed to decrypt API key     | Wrong key or corrupted data       |
