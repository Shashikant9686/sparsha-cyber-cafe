import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function requireAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }

  // Check admin record by user_id OR user email
  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('role, email')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  // If user is authenticated in Supabase auth, allow access and sync role
  if (!adminRecord) {
    // If not in table, insert automatically for the authenticated user
    if (user.email) {
      await supabase.from('admin_users').upsert({
        user_id: user.id,
        email: user.email,
        role: 'superadmin',
      });
    }
  }

  return { user, role: adminRecord?.role || 'superadmin' };
}