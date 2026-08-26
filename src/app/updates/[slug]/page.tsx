import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static';
import UpdateDetailClient from '@/components/updates/UpdateDetailClient';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparsha-cyber-cafe.vercel.app';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('slug')
      .eq('status', 'active');

    if (error || !data) return [];
    return data.map((u) => ({ slug: u.slug }));
  } catch (err) {
    console.error('generateStaticParams execution failure (updates):', err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: update } = await supabase
    .from('announcements')
    .select('title, description, image_url, category')
    .eq('slug', slug)
    .maybeSingle();

  if (!update) {
    return {
      title: 'Update Not Found | Sparsha Online Center',
      description: 'The requested update is not available.',
    };
  }

  const title = `${update.title} | Sparsha Online Center Updates`;
  const description = update.description || `${update.category || 'Latest'} update from Sparsha Online Center, Aland.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/updates/${slug}`,
      images: update.image_url ? [{ url: update.image_url }] : undefined,
    },
  };
}

export default async function UpdateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: update, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !update || update.status !== 'active' || (update.expires_at && new Date(update.expires_at) < new Date())) {
    notFound();
  }

  const { data: images } = await supabase
    .from('announcement_images')
    .select('id, image_url, alt_text, display_order')
    .eq('announcement_id', update.id)
    .order('display_order', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/updates"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          ← Back to Updates
        </Link>

        <UpdateDetailClient update={update} images={images || []} />
      </div>
    </div>
  );
}