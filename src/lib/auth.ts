import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export type AdminRole = 'superadmin' | 'admin' | 'operator';

export interface AdminSession {
  user: User;
  role: AdminRole;
}

/**
 * Validates whether the current request is backed by an authenticated Supabase user
 * who exists in the `admin_users` table by matching on `user_id`.
 * 
 * - Unauthenticated users are redirected to /login.
 * - Authenticated users NOT found in `admin_users` are denied access and redirected to /login?error=unauthorized.
 * - No automatic row creation or privilege promotion is performed.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Look up admin privilege exclusively by user_id to prevent email-spoofing escalation
  const { data: adminRecord, error: dbError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (dbError || !adminRecord) {
    // Access denied: Authenticated user lacks explicit administrative privileges
    redirect('/login?error=unauthorized');
  }

  return {
    user,
    role: adminRecord.role as AdminRole,
  };
}