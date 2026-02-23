import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase-admin';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * API Key Management Endpoint
 *
 * Manages secure storage of user API keys (e.g., OpenAI keys for BYOK mode).
 * Keys are encrypted at rest using AES-256-GCM encryption.
 *
 * Routes:
 * - POST   /api/user-settings/api-key - Save encrypted API key
 * - GET    /api/user-settings/api-key - Retrieve and decrypt API key
 * - DELETE /api/user-settings/api-key - Remove saved API key
 *
 * @requires ENCRYPTION_KEY environment variable (64-char hex string)
 * @see api/utils/encryption.ts for encryption implementation
 *
 * Database Schema (user_settings table):
 * ```sql
 * CREATE TABLE user_settings (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *   openai_api_key_encrypted TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE(user_id)
 * );
 *
 * CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
 *
 * -- Row-Level Security (RLS)
 * ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Users can view own settings"
 *   ON user_settings FOR SELECT
 *   USING (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can update own settings"
 *   ON user_settings FOR UPDATE
 *   USING (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can insert own settings"
 *   ON user_settings FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 *
 * CREATE POLICY "Users can delete own settings"
 *   ON user_settings FOR DELETE
 *   USING (auth.uid() = user_id);
 * ```
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = await requireAuth(req);

    switch (req.method) {
      case 'POST':
        return await handleSaveKey(userId, req, res);
      case 'GET':
        return await handleGetKey(userId, res);
      case 'DELETE':
        return await handleDeleteKey(userId, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in user-settings/api-key:', error);

    if (error instanceof Error && error.name === 'AuthError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST - Save encrypted API key to database
 *
 * Request body:
 * {
 *   apiKey: string,      // The API key to encrypt and store
 *   provider?: string    // Optional: 'openai' (future: 'anthropic', etc.)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
async function handleSaveKey(userId: string, req: VercelRequest, res: VercelResponse) {
  const { apiKey, provider = 'openai' } = req.body;

  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'API key is required' });
  }

  if (apiKey.trim().length === 0) {
    return res.status(400).json({ error: 'API key cannot be empty' });
  }

  // Validate API key format (basic check for OpenAI keys)
  if (provider === 'openai' && !apiKey.startsWith('sk-')) {
    return res.status(400).json({
      error: 'Invalid OpenAI API key format (must start with sk-)',
    });
  }

  try {
    // Encrypt the API key
    const encryptedKey = encrypt(apiKey);

    // Upsert user settings (insert or update)
    const { error } = await supabaseAdmin.from('user_settings').upsert(
      {
        user_id: userId,
        openai_api_key_encrypted: encryptedKey,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      console.error('Failed to save API key:', error);
      return res.status(500).json({ error: 'Failed to save API key' });
    }

    return res.status(200).json({
      success: true,
      message: 'API key saved successfully',
    });
  } catch (error) {
    console.error('Encryption error:', error);
    return res.status(500).json({ error: 'Failed to encrypt API key' });
  }
}

/**
 * GET - Retrieve and decrypt API key from database
 *
 * Response:
 * {
 *   apiKey: string,      // The decrypted API key
 *   hasKey: boolean      // Whether a key exists
 * }
 */
async function handleGetKey(userId: string, res: VercelResponse) {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('user_settings')
      .select('openai_api_key_encrypted')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch API key:', error);
      return res.status(500).json({ error: 'Failed to retrieve API key' });
    }

    // No settings found
    if (!settings || !settings.openai_api_key_encrypted) {
      return res.status(200).json({
        hasKey: false,
        apiKey: null,
      });
    }

    // Decrypt the API key
    const decryptedKey = decrypt(settings.openai_api_key_encrypted);

    return res.status(200).json({
      hasKey: true,
      apiKey: decryptedKey,
    });
  } catch (error) {
    console.error('Decryption error:', error);
    return res.status(500).json({ error: 'Failed to decrypt API key' });
  }
}

/**
 * DELETE - Remove saved API key from database
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
async function handleDeleteKey(userId: string, res: VercelResponse) {
  try {
    const { error } = await supabaseAdmin
      .from('user_settings')
      .update({
        openai_api_key_encrypted: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to delete API key:', error);
      return res.status(500).json({ error: 'Failed to delete API key' });
    }

    return res.status(200).json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return res.status(500).json({ error: 'Failed to delete API key' });
  }
}
