-- Migration: 20260823_admin_users.sql
-- Description: Creates the admin_users table with strict role validation.
-- Explicitly prevents automatic privilege escalation or auto-seeding.

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'operator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT admin_users_user_id_key UNIQUE (user_id),
    CONSTRAINT admin_users_email_key UNIQUE (email)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Note on seeding initial admin access:
-- Do NOT auto-seed rows in this migration. The first admin user must be manually provisioned
-- via the Supabase SQL Editor after the user signs up through Supabase Auth.
--
-- Example manual insertion:
-- INSERT INTO public.admin_users (user_id, email, role)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Replace with genuine auth.users UUID
--   'operator@example.com',                 -- Replace with genuine user email
--   'superadmin'
-- );