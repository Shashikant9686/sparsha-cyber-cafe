import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, ShieldCheck, Clock, FileCheck, HelpCircle } from 'lucide-react';
import WebsiteQR from '@/components/WebsiteQR';
import type { Service } from '@/lib/types';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredServices } = await supabase
    .from('services')
    .select('*, categories(name)')
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(6);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-blue-900 to-slate-950 text-white p-8 sm:p-12 md:p-16 border border-slate-800">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Reliable Karnataka Citizen & Student Services
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Fast, Verified & Transparent Online Applications.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Get your government certificates, student scholarships, KCET/NEET option entry, and exam registrations completed with 100% checklist accuracy.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/services"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/counselling"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-2 border border-slate-700"
            >
              <span>KEA Counselling Desk</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Zero Error Guarantee</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We pre-verify every certificate, photo dimension, and application detail before final submission.
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Instant WhatsApp Checklists</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Send required document checklists directly to your WhatsApp before visiting the cafe.
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Transparent Pricing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Clear separation between official government fees and our minimal operator charges.
          </p>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices && featuredServices.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Popular Services</h2>
              <p className="text-xs text-slate-500">Most requested applications and certificates</p>
            </div>
            <Link href="/services" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredServices.map((svc: Service) => (
              <Link
                key={svc.id}
                href={`/services/${svc.slug}`}
                className="group p-6 bg-white border border-slate-200 hover:border-blue-500 rounded-3xl transition shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {svc.submission_method}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                    {svc.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {svc.short_description || 'View required documents and guidelines.'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{svc.fee != null ? `Fee: ₹${svc.fee}` : 'Free Application'}</span>
                  <span className="text-blue-600 group-hover:translate-x-1 transition">Apply &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick QR Access */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <h3 className="text-lg font-black text-slate-900">Visit Sparsha Cyber Cafe on your mobile</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Scan this QR code with any camera app to open our services catalog, verify documents, or share with friends and family. It&apos;s instant and requires no installation.
          </p>
        </div>
        <WebsiteQR />
      </section>

      {/* FAQ Banner */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex items-center gap-4">
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-blue-600">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-900">Need immediate help with option entry or certificates?</span> Reach out directly via WhatsApp or visit our counter in person.
        </div>
      </section>
    </div>
  );
}