import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { 
  ArrowLeft, 
  Calendar, 
  ExternalLink, 
  ShieldAlert, 
  Tag, 
  Monitor, 
  Image as ImageIcon 
} from 'lucide-react';
import ServiceChecklistSection from '@/components/services/ServiceChecklistSection';
import type { Category, RequiredDocument, ServiceImage } from '@/lib/types';

interface ServiceDetail {
  id: string;
  name: string;
  slug: string;
  category_id?: string | null;
  categories?: Pick<Category, 'name'> | null;
  short_description?: string | null;
  full_description?: string | null;
  fee?: number | null;
  service_charge?: number | null;
  status?: string;
  featured?: boolean;
  disclaimer?: string | null;
  official_link?: string | null;
  start_date?: string | null;
  last_date?: string | null;
  submission_method?: string | null;
  required_documents?: RequiredDocument[];
  service_images?: ServiceImage[];
}

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*, categories(name), required_documents(*), service_images(*)')
    .eq('slug', slug)
    .single();

  if (error || !data || data.status === 'Hidden') {
    notFound();
  }

  const service = data as unknown as ServiceDetail;
  const documents = service.required_documents || [];
  const images = (service.service_images || []).sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
          {service.categories?.name || 'General Service'}
        </span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {service.submission_method && (
              <>
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <Monitor className="w-3.5 h-3.5" />
                  {service.submission_method}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {service.categories?.name || 'General'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {service.name}
          </h1>

          {service.short_description && (
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {service.short_description}
            </p>
          )}
        </div>

        {/* Pricing & Deadlines Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Govt Fee</span>
            <span className="text-sm font-black text-slate-900">
              {service.fee != null ? `₹${service.fee}` : 'Free'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Cafe Operator Fee</span>
            <span className="text-sm font-black text-slate-900">
              {service.service_charge != null ? `₹${service.service_charge}` : '₹0'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Start Date</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              {service.start_date ? new Date(service.start_date).toLocaleDateString() : 'Active'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Deadline / Last Date</span>
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {service.last_date ? new Date(service.last_date).toLocaleDateString() : 'Ongoing'}
            </span>
          </div>
        </div>

        {service.official_link && (
          <div className="pt-2">
            <a
              href={service.official_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100 transition"
            >
              <span>Visit Official Government Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Full Description & Guidelines */}
      {service.full_description && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Application Details & Guidelines
          </h2>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {service.full_description}
          </div>
        </div>
      )}

      {/* Interactive Required Documents Checklist */}
      <ServiceChecklistSection serviceName={service.name} documents={documents} />

      {/* Service Posters & Image References */}
      {images.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Official Posters & Notifications
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.alt_text || service.name}
                  className="w-full aspect-video object-cover group-hover:scale-105 transition duration-300"
                />
                {img.alt_text && (
                  <p className="p-2.5 text-[11px] font-semibold text-slate-700 truncate bg-white">
                    {img.alt_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Disclaimer */}
      {service.disclaimer && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 sm:p-8 flex items-start gap-3.5 text-amber-900 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wide">Important Note & Disclaimer</h3>
            <p className="text-xs text-amber-800 leading-relaxed">{service.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  );
}