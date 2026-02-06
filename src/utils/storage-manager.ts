/**
 * Storage Manager - Handle audio file uploads to Supabase Storage
 *
 * Provides utilities for uploading audio files to Supabase Storage bucket
 * and retrieving public URLs for playback.
 */

import { supabaseClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'audio-files';

/**
 * Upload audio file to Supabase Storage
 *
 * @param sessionId - Unique session identifier
 * @param blob - Audio file blob
 * @param filename - Original filename
 * @returns Public URL to the uploaded file
 * @throws Error if upload fails
 */
export async function uploadAudioFile(
  sessionId: string,
  blob: Blob,
  filename: string
): Promise<string> {
  // Create unique path: sessions/{sessionId}/{filename}
  const filePath = `${sessionId}/${filename}`;

  // Upload to Supabase Storage
  const { data, error } = await supabaseClient.storage.from(BUCKET_NAME).upload(filePath, blob, {
    cacheControl: '3600',
    upsert: false, // Don't overwrite existing files
  });

  if (error) {
    console.error('Failed to upload audio file:', error);
    throw new Error(`Failed to upload audio file: ${error.message}`);
  }

  // Get public URL for the uploaded file
  const { data: urlData } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return urlData.publicUrl;
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
