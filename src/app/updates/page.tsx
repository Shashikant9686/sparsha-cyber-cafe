import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Megaphone, Calendar, ArrowRight, Star } from 'lucide-react';
import { getUpdateUrgency, getUrgencyBadgeClasses } from '@/lib/date-utils';

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
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  const list: UpdateRow[] = updates || [];

  return (
    <div className="min-h-screen bg-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-saffron">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Latest Updates</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Latest Applications & Important Updates
          </h1>
          <p className="text-sm text-stone-500">
            Exam applications, scholarships, government notices, and admission updates from Sparsha Online Center.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-saffron-soft border border-saffron/20 rounded-panel text-saffron text-xs">
            Unable to load updates right now. Please try again shortly.
          </div>
        )}

        {!error && list.length === 0 && (
          <div className="bg-surface rounded-panel border border-stone-200 p-12 text-center space-y-2">
            <Megaphone className="w-8 h-8 text-stone-500/40 mx-auto" />
            <p className="text-sm font-bold text-stone-500">No active updates right now</p>
            <p className="text-xs text-stone-500/70">Check back soon, or contact us directly for the latest information.</p>
          </div>
        )}

        {list.length > 0 && (
          <div className="divide-y divide-stone-200">
            {list.map((update) => (
              <Link
                key={update.id}
                href={`/updates/${update.slug}`}
                className="group flex flex-col sm:flex-row gap-5 py-6 first:pt-0"
              >
                {update.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={update.image_url}
                    alt={update.title}
                    className="w-full sm:w-40 h-32 object-cover rounded-panel shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-40 h-32 bg-ink rounded-panel flex items-center justify-center shrink-0">
                    <Megaphone className="w-6 h-6 text-saffron/60" />
                  </div>
                )}

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    {update.featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-saffron">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                    {update.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-green">
                        {update.category}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-lg font-semibold text-ink leading-snug group-hover:text-saffron transition">
                    {update.title}
                  </h2>

                  {update.description && (
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 max-w-2xl">
                      {update.description}
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500">
                    {update.last_date && getUpdateUrgency(update.last_date) ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${getUrgencyBadgeClasses(
                          getUpdateUrgency(update.last_date)!.state
                        )}`}
                      >
                        <Calendar className="w-3 h-3" />
                        {getUpdateUrgency(update.last_date)!.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(update.created_at)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 font-bold text-saffron shrink-0">
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