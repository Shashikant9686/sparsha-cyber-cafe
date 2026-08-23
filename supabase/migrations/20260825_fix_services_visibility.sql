-- Migration: Fix services visibility policy to use strict allow-list logic
-- ========================================================================
-- Reason:
-- Previous policy (public_read_services in 20260823_02_enable_rls.sql) only
-- hid services where status = 'hidden'. However, the admin portal uses
-- 'active' | 'inactive' | 'draft'. This left 'inactive' and 'draft'
-- records inadvertently readable by public unauthenticated visitors.
--
-- This migration converts the policy to an allow-list:
-- Only rows where LOWER(status) = 'active' are visible to the public.
-- Authenticated admins continue to see all statuses via public.is_admin().
-- ========================================================================

-- Drop the old deny-list policy
DROP POLICY IF EXISTS "public_read_services" ON public.services;

-- Recreate with fail-closed allow-list policy
CREATE POLICY "public_read_services" ON public.services
  FOR SELECT
  USING (
    LOWER(status) = 'active'
    OR public.is_admin()
  );