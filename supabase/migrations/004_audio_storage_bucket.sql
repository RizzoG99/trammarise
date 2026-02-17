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
-- Only logged-in users can upload to the bucket
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-files'
  AND auth.role() = 'authenticated'
);

-- RLS Policy 2: Users can read ONLY their own audio files
-- Ownership is determined by matching auth.uid() with the owner field
-- This prevents users from accessing other users' private audio
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

-- RLS Policy 4: Users can update their own files (for upsert operations)
CREATE POLICY "Users can update own audio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio-files'
  AND owner = auth.uid()::text
);

-- Add helpful comments
COMMENT ON POLICY "Authenticated users can upload audio files" ON storage.objects
IS 'Allows authenticated users to upload audio files. File size limited to 100MB, only audio MIME types allowed.';

COMMENT ON POLICY "Users can read own audio files" ON storage.objects
IS 'Privacy protection: Users can only access files they own. Files must be retrieved via authenticated API endpoint /api/audio/[sessionId].';

COMMENT ON POLICY "Users can delete own audio files" ON storage.objects
IS 'Allows users to delete only their own audio files using auth.uid() ownership check.';
