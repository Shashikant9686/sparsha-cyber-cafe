import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Clock, IndianRupee, MessageCircle, ArrowRight, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching services:', error);
  }

  const serviceList = services || [];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Services Directory</h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore all online applications, student schemes, and seva kendra services available at Sparsha Cyber Cafe.
          </p>
        </div>

        {serviceList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Services Published Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              New schemes and certificate application services will appear here once configured in the admin desk.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceList.map((service) => {
              const displayTitle = service.title || service.name || 'Untitled Service';
              const displayDesc = service.short_description || service.description || '';
              const fee = service.official_fee || service.service_charge || '';
              const time = service.processing_time || '';
              const slug = service.slug || service.id;

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {service.category && (
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full">
                        {service.category}
                      </span>
                    )}

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {displayTitle}
                    </h3>

                    {displayDesc && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {displayDesc}
                      </p>
                    )}

                    {(time || fee) && (
                      <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
                        {time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            {time}
                          </span>
                        )}
                        {fee && (
                          <span className="inline-flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                            {fee}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/917090161083?text=${encodeURIComponent(`Hello Sparsha Cyber Cafe, I need documents verification and help for: ${displayTitle}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Help</span>
                    </a>

                    <Link
                      href={`/services/${slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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