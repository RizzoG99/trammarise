/**
 * Storage Manager - Handle audio file uploads to Supabase Storage
 *
 * Provides utilities for uploading audio files to Supabase Storage bucket
 * with hybrid strategy based on user subscription tier.
 */

import { supabaseClient } from '@/lib/supabase/client';
import type { SubscriptionTier } from '@/context/subscription-types';

const BUCKET_NAME = 'audio-files';

type UploadStrategy = 'none' | 'metadata' | 'full';

/**
 * Determine upload strategy based on user subscription tier
 *
 * @param tier - User's subscription tier (undefined = free/unauthenticated)
 * @returns Upload strategy to use
 */
function getUploadStrategy(tier?: SubscriptionTier): UploadStrategy {
  if (!tier || tier === 'free') {
    // Free/BYOK users: local-only (no cloud upload)
    return 'none';
  }

  if (tier === 'pro') {
    // Pro users: metadata only (audio stays local)
    // Metadata upload is handled separately in session-manager
    return 'metadata';
  }

  // Team users: full audio backup
  return 'full';
}

/**
 * Upload audio file to Supabase Storage (private bucket)
 *
 * Implements hybrid storage strategy based on subscription tier:
 * - Free: No upload (local-only)
 * - Pro: Metadata only (no audio upload)
 * - Team: Full audio backup
 *
 * @param sessionId - Unique session identifier
 * @param blob - Audio file blob
 * @param filename - Original filename
 * @param tier - Optional subscription tier (defaults to free if not provided)
 * @returns Private URL to the uploaded file, or null if upload skipped
 * @throws Error if upload fails (only for team tier)
 */
export async function uploadAudioFile(
  sessionId: string,
  blob: Blob,
  filename: string,
  tier?: SubscriptionTier
): Promise<string | null> {
  const uploadStrategy = getUploadStrategy(tier);

  if (uploadStrategy === 'none') {
    console.log('[Storage] Local-only mode: skipping Supabase upload (free tier)');
    return null;
  }

  if (uploadStrategy === 'metadata') {
    console.log('[Storage] Pro mode: skipping audio upload (metadata only)');
    return null;
  }

  // Team tier: Upload full audio to private bucket
  const filePath = `${sessionId}/${filename}`;

  try {
    const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).upload(filePath, blob, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('[Storage] Failed to upload audio file:', error);
      throw new Error(`Failed to upload audio file: ${error.message}`);
    }

    // Return private URL (will be accessed via /api/audio/:sessionId)
    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    console.log('[Storage] Team mode: Full audio uploaded successfully');
    return publicUrl;
  } catch (error) {
    console.error('[Storage] Upload error:', error);
    throw error;
  }
}

/**
 * Delete audio file from Supabase Storage
 *
 * @param sessionId - Session identifier
 * @param filename - Filename to delete
 * @throws Error if deletion fails
 */
export async function deleteAudioFile(sessionId: string, filename: string): Promise<void> {
  const filePath = `${sessionId}/${filename}`;

  const { error } = await supabaseClient.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error('Failed to delete audio file:', error);
    throw new Error(`Failed to delete audio file: ${error.message}`);
  }
}

/**
 * Get public URL for an existing audio file
 *
 * @param sessionId - Session identifier
 * @param filename - Filename
 * @returns Public URL to the file
 */
export function getAudioFileUrl(sessionId: string, filename: string): string {
  const filePath = `${sessionId}/${filename}`;
  const { data } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Check if audio file exists in storage
 *
 * @param sessionId - Session identifier
 * @param filename - Filename to check
 * @returns True if file exists, false otherwise
 */
export async function audioFileExists(sessionId: string, filename: string): Promise<boolean> {
  const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).list(sessionId, {
    search: filename,
  });

  if (error) {
    console.error('Failed to check file existence:', error);
    return false;
  }

  return data.length > 0;
}
