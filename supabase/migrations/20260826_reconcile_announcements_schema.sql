-- Migration: 20260826_reconcile_announcements_schema.sql
-- Description: Reconciles migration history with the live database for the "Updates"
-- feature (public /updates, /updates/[slug], admin announcements page).
--
-- Context: `category`, `expires_at` on public.announcements, and the entire
-- public.announcement_images table already exist on the live Supabase project
-- (confirmed via information_schema) but were never captured in a migration file
-- (likely created manually via the dashboard, per this project's known history of
-- schema drift). This migration is written to be a no-op against the current live
-- database — it only documents/backfills what's already there via IF NOT EXISTS
-- guards, so migration history matches reality and fresh environments stay
-- reproducible. Nothing here renames or drops any existing column.
--
-- Also fixes:
--   1. public.announcement_images had no RLS policies in any migration (likely
--      created without RLS enabled) — this closes that gap using the same
--      admin-only-write / public-read pattern already used for announcements.
--   2. The live `status` column default was `'Active'` (capital A) while every
--      query in the app filters on lowercase `'active'`. No existing rows are
--      affected today, but this default would silently hide any future row
--      inserted without an explicit status. Normalized to lowercase.

-- ==============================================================================
-- 1. BACKFILL COLUMNS ON public.announcements (no-op if already present)
-- ==============================================================================

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Align the default with what the application actually writes/queries.
ALTER TABLE public.announcements
  ALTER COLUMN status SET DEFAULT 'active';

-- ==============================================================================
-- 2. BACKFILL public.announcement_images TABLE (no-op if already present)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.announcement_images (
  id uuid primary key default uuid_generate_v4(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_announcement_images_announcement_id
  ON public.announcement_images(announcement_id);

DROP TRIGGER IF EXISTS tr_announcement_images_updated_at ON public.announcement_images;
CREATE TRIGGER tr_announcement_images_updated_at
  BEFORE UPDATE ON public.announcement_images
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 3. RLS FOR public.announcement_images
-- ==============================================================================

ALTER TABLE public.announcement_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_announcement_images" ON public.announcement_images;
DROP POLICY IF EXISTS "admin_insert_announcement_images" ON public.announcement_images;
DROP POLICY IF EXISTS "admin_update_announcement_images" ON public.announcement_images;
DROP POLICY IF EXISTS "admin_delete_announcement_images" ON public.announcement_images;

CREATE POLICY "public_read_announcement_images"
ON public.announcement_images
FOR SELECT
TO public
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.announcements a
    WHERE a.id = announcement_images.announcement_id
      AND LOWER(a.status) != 'hidden'
  )
);

CREATE POLICY "admin_insert_announcement_images"
ON public.announcement_images
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_announcement_images"
ON public.announcement_images
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_announcement_images"
ON public.announcement_images
FOR DELETE
TO authenticated
USING (public.is_admin());