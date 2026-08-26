import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Megaphone, Calendar, ArrowRight, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparsha-cyber-cafe.vercel.app';

export const metadata: Metadata = {
  title: 'Latest Updates & Applications | Sparsha Online Center',
  description: 'Latest government applications, exam notifications, scholarships, and important updates from Sparsha Online Center, Aland.',
  openGraph: {
    title: 'Latest Updates & Applications | Sparsha Online Center',
    description: 'Latest government applications, exam notifications, scholarships, and important updates.',
    url: `${SITE_URL}/updates`,
  },
};

interface UpdateRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  status: string;
  featured: boolean;
  start_date: string | null;
  last_date: string | null;
  expires_at: string | null;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function UpdatesPage() {
  const supabase = await createClient();

  const { data: updates, error } = await supabase
    .from('announcements')
    .select('id, title, slug, description, image_url, category, status, featured, start_date, last_date, expires_at, created_at')
    .eq('status', 'active')
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  const list: UpdateRow[] = updates || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Latest Updates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Latest Applications & Important Updates
          </h1>
          <p className="text-sm text-slate-500">
            Exam applications, scholarships, government notices, and admission updates from Sparsha Online Center.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
            Unable to load updates right now. Please try again shortly.
          </div>
        )}

        {!error && list.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">No active updates right now</p>
            <p className="text-xs text-slate-400">Check back soon, or contact us directly for the latest information.</p>
          </div>
        )}

        {list.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((update) => (
              <Link
                key={update.id}
                href={`/updates/${update.slug}`}
                className={`group bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition flex flex-col ${
                  update.featured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                {update.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={update.image_url}
                    alt={update.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                    <Megaphone className="w-8 h-8 text-blue-200" />
                  </div>
                )}

                <div className="p-5 space-y-2.5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    {update.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    {update.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        {update.category}
                      </span>
                    )}
                  </div>

                  <h2 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition">
                    {update.title}
                  </h2>

                  {update.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {update.description}
                    </p>
                  )}

                  <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    {update.last_date ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                        <Calendar className="w-3 h-3" />
                        Last date: {formatDate(update.last_date)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(update.created_at)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 font-bold text-blue-600">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}