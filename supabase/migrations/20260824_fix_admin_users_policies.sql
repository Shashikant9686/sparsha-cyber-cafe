-- This migration exists because the original 20260823_admin_users.sql enabled RLS with no policies,
-- which combined with earlier ad-hoc dashboard policies caused infinite recursion (Postgres error,
-- not just access denial) in requireAdminSession(), breaking all admin login.
-- This migration is idempotent-safe to run even if some of those policies don't exist (drop if exists)
-- or already match (create replaces cleanly since they're dropped first).

-- Ensure a clean slate in case any ad-hoc policies exist from manual dashboard changes
drop policy if exists "Admins can view admin list" on public.admin_users;
drop policy if exists "Superadmins can manage admin list" on public.admin_users;
drop policy if exists "Allow superadmin full access" on public.admin_users;
drop policy if exists "Allow authenticated read admin_users" on public.admin_users;
drop policy if exists "Allow users to read their own admin record" on public.admin_users;
drop policy if exists "Authenticated users can read their own admin record" on public.admin_users;
drop policy if exists "users_can_read_own_admin_row" on public.admin_users;
drop policy if exists "admin_users_select_own" on public.admin_users;
drop policy if exists "admin_users_admin_full_access" on public.admin_users;

-- A user can always read their own row (required for login's admin check to work at all)
create policy "admin_users_select_own"
on public.admin_users
for select
using (auth.uid() = user_id);

-- Only existing admins (via the safe, non-recursive is_admin() function) can read the
-- full list or write/update/delete any row
create policy "admin_users_admin_full_access"
on public.admin_users
for all
using (public.is_admin())
with check (public.is_admin());