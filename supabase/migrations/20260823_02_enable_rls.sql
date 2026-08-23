-- Migration: 20260823_02_enable_rls.sql
-- Description: Enables Row Level Security (RLS) across content tables and defines granular access policies.

-- ==============================================================================
-- 1. REUSABLE HELPER FUNCTION
-- ==============================================================================

-- Helper function to safely verify admin membership via admin_users without leaking table access.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselling_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_dates ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. RLS POLICIES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: categories
-- ------------------------------------------------------------------------------

-- Allow anyone (anon and authenticated) to view categories for organization/navigation.
CREATE POLICY "public_read_categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- Restrict category creation to authenticated admins only.
CREATE POLICY "admin_insert_categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Restrict category updates to authenticated admins only.
CREATE POLICY "admin_update_categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Restrict category deletion to authenticated admins only.
CREATE POLICY "admin_delete_categories"
ON public.categories
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Table: services
-- ------------------------------------------------------------------------------

-- Allow public to view non-hidden services; admins can view all services (including hidden).
CREATE POLICY "public_read_services"
ON public.services
FOR SELECT
TO public
USING (
  LOWER(status) != 'hidden' 
  OR public.is_admin()
);

-- Restrict service insertion to admins.
CREATE POLICY "admin_insert_services"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Restrict service updates to admins.
CREATE POLICY "admin_update_services"
ON public.services
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Restrict service deletion to admins.
CREATE POLICY "admin_delete_services"
ON public.services
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Table: required_documents
-- ------------------------------------------------------------------------------

-- Allow public to view document checklists (parent service visibility handles page-level exposure).
CREATE POLICY "public_read_required_documents"
ON public.required_documents
FOR SELECT
TO public
USING (true);

-- Restrict checklist creation to admins.
CREATE POLICY "admin_insert_required_documents"
ON public.required_documents
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Restrict checklist updates to admins.
CREATE POLICY "admin_update_required_documents"
ON public.required_documents
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Restrict checklist deletion to admins.
CREATE POLICY "admin_delete_required_documents"
ON public.required_documents
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Table: service_images
-- ------------------------------------------------------------------------------

-- Allow public to view service gallery images.
CREATE POLICY "public_read_service_images"
ON public.service_images
FOR SELECT
TO public
USING (true);

-- Restrict service image addition to admins.
CREATE POLICY "admin_insert_service_images"
ON public.service_images
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Restrict service image modifications to admins.
CREATE POLICY "admin_update_service_images"
ON public.service_images
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Restrict service image deletions to admins.
CREATE POLICY "admin_delete_service_images"
ON public.service_images
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Table: announcements
-- ------------------------------------------------------------------------------

-- Allow public to view visible announcements; admins can view all (including hidden).
CREATE POLICY "public_read_announcements"
ON public.announcements
FOR SELECT
TO public
USING (
  LOWER(status) != 'hidden' 
  OR public.is_admin()
);

-- Restrict announcement creation to admins.
CREATE POLICY "admin_insert_announcements"
ON public.announcements
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Restrict announcement updates to admins.
CREATE POLICY "admin_update_announcements"
ON public.announcements
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Restrict announcement deletion to admins.
CREATE POLICY "admin_delete_announcements"
ON public.announcements
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Table: counselling_events
-- ------------------------------------------------------------------------------

-- Allow public to view visible counselling events; admins can view all.
CREATE POLICY "public_read_counselling_events"
ON public.counselling_events
FOR SELECT
TO public
USING (
  LOWER(status) != 'hidden' 
  OR public.is_admin()
);

-- Restrict counselling event creation to admins.
CREATE POLICY "admin_insert_counselling_events"
ON public.counselling_events
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Restrict counselling event updates to admins.
CREATE POLICY "admin_update_counselling_events"
ON public.counselling_events
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Restrict counselling event deletion to admins.
CREATE POLICY "admin_delete_counselling_events"
ON public.counselling_events
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Table: event_dates
-- ------------------------------------------------------------------------------

-- Allow public to view event schedule dates (filtered upstream by parent event).
CREATE POLICY "public_read_event_dates"
ON public.event_dates
FOR SELECT
TO public
USING (true);

-- Restrict date item creation to admins.
CREATE POLICY "admin_insert_event_dates"
ON public.event_dates
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Restrict date item updates to admins.
CREATE POLICY "admin_update_event_dates"
ON public.event_dates
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Restrict date item deletion to admins.
CREATE POLICY "admin_delete_event_dates"
ON public.event_dates
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 4. MANUAL VERIFICATION / TEST QUERIES (COMMENTED OUT)
-- ==============================================================================
/*
-- 1. Test as Anonymous / Public User:
-- SET ROLE anon;
-- SELECT * FROM public.services; -- Should NOT return any rows where status = 'hidden' (case-insensitive)
-- SELECT * FROM public.announcements; -- Should NOT return hidden announcements
-- INSERT INTO public.categories (name, slug) VALUES ('Test Cat', 'test-cat'); -- Expected: Fails (permission denied)

-- 2. Test as Non-Admin Authenticated User:
-- SET ROLE authenticated;
-- SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001'; -- Arbitrary non-admin user
-- SELECT * FROM public.services; -- Should NOT return hidden rows
-- DELETE FROM public.services WHERE id = '...'; -- Expected: Fails (permission denied)

-- 3. Test as Superadmin / Admin User:
-- SET ROLE authenticated;
-- SET request.jwt.claim.sub = '<genuine_admin_user_id>'; -- Must exist in admin_users table
-- SELECT * FROM public.services; -- Returns ALL rows including hidden items
-- INSERT INTO public.categories (name, slug) VALUES ('Admin Cat', 'admin-cat'); -- Expected: Succeeds
-- RESET ROLE;
*/