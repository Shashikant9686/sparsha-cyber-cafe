-- Migration: 20260823_03_storage_setup.sql
-- Description: Creates the public service-images storage bucket and configures granular RLS policies.

-- ==============================================================================
-- 1. CREATE STORAGE BUCKET
-- ==============================================================================

-- Create the canonical "service-images" bucket if not present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- 2. STORAGE RLS POLICIES (SCOPED TO service-images)
-- ==============================================================================

-- Allow public read access to all images in the service-images bucket for website visitors
CREATE POLICY "public_read_service_images_bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'service-images');

-- Restrict image uploads to authenticated administrators only
CREATE POLICY "admin_insert_service_images_bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-images' 
  AND public.is_admin()
);

-- Restrict image metadata/content updates to authenticated administrators only
CREATE POLICY "admin_update_service_images_bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND public.is_admin()
)
WITH CHECK (
  bucket_id = 'service-images' 
  AND public.is_admin()
);

-- Restrict image deletions to authenticated administrators only
CREATE POLICY "admin_delete_service_images_bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND public.is_admin()
);

-- ==============================================================================
-- 3. MANUAL VERIFICATION / TEST QUERIES (COMMENTED OUT)
-- ==============================================================================
/*
-- 1. Test Public Read:
-- SET ROLE anon;
-- SELECT * FROM storage.objects WHERE bucket_id = 'service-images'; -- Allowed

-- 2. Test Public / Non-Admin Write Rejection:
-- SET ROLE anon;
-- INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('service-images', 'test.png', null); -- Expected: Fails (permission denied)

-- 3. Test Admin Upload:
-- SET ROLE authenticated;
-- SET request.jwt.claim.sub = '<admin_uuid>'; -- Must exist in public.admin_users
-- INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('service-images', 'test.png', auth.uid()); -- Expected: Succeeds
-- RESET ROLE;
*/