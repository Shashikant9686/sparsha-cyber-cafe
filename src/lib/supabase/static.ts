import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Build-time-safe Supabase client for use in generateStaticParams / generateMetadata
 * contexts where no HTTP request (and therefore no cookies) exists yet.
 * Do NOT use this for anything requiring an authenticated session — it has none.
 * Only use it for fetching public, RLS-permitted data.
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}