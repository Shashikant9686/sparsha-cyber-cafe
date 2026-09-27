-- Restrict admin_users management to superadmins only.
-- Preserves the self-read access required by requireAdminSession().

begin;

-- Fail safely rather than leaving the project with no account able to manage
-- administrator access after the broad policy is removed.
do $$
begin
  if not exists (
    select 1
    from public.admin_users
    where role = 'superadmin'
  ) then
    raise exception
      'Migration aborted: public.admin_users must contain at least one superadmin before role-management policies are restricted.';
  end if;
end
$$;

-- SECURITY DEFINER avoids recursive RLS evaluation when policies on
-- public.admin_users need to verify the caller's role.
create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public, auth, pg_temp
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and role = 'superadmin'
  );
$$;

-- This helper is used only by authenticated admin_users policies.
revoke all on function public.is_superadmin() from public;
grant execute on function public.is_superadmin() to authenticated;

-- Remove the policy that lets any admin_users member manage every row.
drop policy if exists "admin_users_admin_full_access"
on public.admin_users;

-- Keep the minimum SELECT permission required by src/lib/auth.ts.
drop policy if exists "admin_users_select_own"
on public.admin_users;

create policy "admin_users_select_own"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

-- Superadmins can view and manage the complete administrator list.
create policy "admin_users_select_superadmin"
on public.admin_users
for select
to authenticated
using (public.is_superadmin());

create policy "admin_users_insert_superadmin"
on public.admin_users
for insert
to authenticated
with check (public.is_superadmin());

create policy "admin_users_update_superadmin"
on public.admin_users
for update
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy "admin_users_delete_superadmin"
on public.admin_users
for delete
to authenticated
using (public.is_superadmin());

commit;
