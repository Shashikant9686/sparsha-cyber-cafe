import React from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';
import { Service, Category } from '@/lib/types';

export const metadata: Metadata = {
  title: 'All Online Application & Citizen Seva Services',
  description:
    'Browse the catalog of citizen and student services in Aland: PAN card creation, scholarship applications, exam registrations, and printing.',
  openGraph: {
    title: 'Services Directory | SPARSHA CYBER CAFE Aland',
    description:
      'Check required documents, fees, and processing details for all cyber cafe services in Aland.',
  },
};

export default async function ServicesPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from('categories').select('*').order('display_order', { ascending: true }),
    supabase
      .from('services')
      .select('*, categories(*)')
      .eq('status', 'Active')
      .order('featured', { ascending: false }),
  ]);

  const categoryList: Category[] = categories || [];
  const serviceList: Service[] = (services as unknown as Service[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Services Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore all online applications, student schemes, and seva kendra services available at Sparsha Cyber Cafe.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceList.map((service) => (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {service.categories?.name || 'General Service'}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition">
                  {service.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {service.short_description}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>View Checklist & Apply</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}