import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Clock, IndianRupee, MessageCircle, ArrowRight, Layers, Search } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

function isRecentlyAdded(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const daysSince = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince <= 14;
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const { q, category } = await searchParams;
  const query = q?.trim() || '';
  const categorySlug = category?.trim() || '';

  const supabase = await createClient();

  let selectedCategory: { id: string; name: string } | null = null;
  if (categorySlug) {
    const { data: matchedCategory } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .maybeSingle();
    selectedCategory = matchedCategory || null;
  }

  let request = supabase
    .from('services')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (selectedCategory) {
    request = request.eq('category_id', selectedCategory.id);
  }

  if (query) {
    request = request.or(`name.ilike.%${query}%,short_description.ilike.%${query}%,full_description.ilike.%${query}%`);
  }

  const { data: services, error } = await request;

  if (error) {
    console.error('Error fetching services:', error);
  }

  const serviceList = services || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Services Directory</h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore all online applications, student schemes, and digital services available at {BUSINESS_INFO.name}.
          </p>
        </div>

        <form method="GET" className="relative animate-fade-in-up-1">
          {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search services (e.g. PAN card, ration card, KCET)..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:border-blue-500 focus:outline-hidden transition shadow-xs"
          />
        </form>
        {(query || selectedCategory) && (
          <p className="text-xs text-slate-500">
            {serviceList.length} result{serviceList.length !== 1 ? 's' : ''}
            {query && <> for &quot;{query}&quot;</>}
            {selectedCategory && (
              <>
                {' '}in <span className="font-bold text-slate-700">{selectedCategory.name}</span>
              </>
            )}
            {' · '}
            <Link
              href={query ? `/services?category=${encodeURIComponent(categorySlug)}` : '/services'}
              className="text-blue-600 font-bold hover:underline"
            >
              {query && selectedCategory ? 'Clear search' : query ? 'Clear search' : 'Clear filter'}
            </Link>
            {query && selectedCategory && (
              <>
                {' · '}
                <Link href="/services" className="text-blue-600 font-bold hover:underline">Clear all</Link>
              </>
            )}
          </p>
        )}

        {serviceList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {query || selectedCategory ? 'No Matching Services Found' : 'No Services Published Yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {query || selectedCategory
                ? 'Try a different search term or category, or contact us directly for help finding the right service.'
                : 'New schemes and certificate application services will appear here once configured in the admin desk.'}
            </p>
            {(query || selectedCategory) && (
              <Link href="/services" className="inline-block text-xs font-bold text-blue-600 hover:underline pt-1">
                View All Services
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceList.map((service, i) => {
              const displayTitle = service.name || 'Untitled Service';
              const displayDesc = service.short_description || service.full_description || '';
              const govtFee = service.fee != null ? `Government Fee: ₹${service.fee}` : '';
              const centerFee = service.service_charge != null ? `Center Service Fee: ₹${service.service_charge}` : '';
              const time = service.processing_time || '';
              const categoryName = service.categories?.name;
              const slug = service.slug || service.id;
              const isNew = isRecentlyAdded(service.created_at);

              const staggerClass = ['animate-fade-in-up', 'animate-fade-in-up-1', 'animate-fade-in-up-2', 'animate-fade-in-up-3'][i % 4];

              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover-lift transition-all flex flex-col justify-between ${staggerClass}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {categoryName && (
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full">
                          {categoryName}
                        </span>
                      )}
                      {isNew && (
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {displayTitle}
                    </h3>

                    {displayDesc && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {displayDesc}
                      </p>
                    )}

                    {(time || govtFee || centerFee) && (
                      <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
                        {time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            {time}
                          </span>
                        )}
                        {govtFee && (
                          <span className="inline-flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                            {govtFee}
                          </span>
                        )}
                        {centerFee && (
                          <span className="inline-flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                            {centerFee}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    
                      <a href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(`Hello, I need help with: ${displayTitle}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition btn-press"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Help</span>
                    </a>

                    <Link href={`/services/${slug}`}
                      className="group/link inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}