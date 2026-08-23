import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import WebsiteQR from '@/components/WebsiteQR';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowRight, 
  MessageCircle, 
  ShieldCheck, 
  GraduationCap, 
  FileText,
  FileCheck,
  Printer
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch active featured services and announcements
  const [{ data: services }, { data: announcement }] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('is_featured', true)
      .limit(6),
    supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const featuredServices = services || [];

  return (
    <div className="min-h-screen bg-slate-50 space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authorised Cyber Cafe & Citizen Facilitation Center</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Aland’s Trusted Center for <span className="text-blue-400">Government Applications</span> & Admission Seva.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Specialized assistance for Karnataka 371(J) quota certificates, Bhoomi RTC Pahani extracts, KCET/NEET option entry, job recruitment, and document scanning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/services"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition inline-flex items-center gap-2"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/917090161083?text=Hello%20Sparsha%20Cyber%20Cafe,%20I%20need%20assistance%20with%20online%20application"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Pre-Verification</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-800 text-slate-300">
            <div>
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs text-slate-400">Error-Free Checklists</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">371(J)</p>
              <p className="text-xs text-slate-400">Regional Quota Experts</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">Instant</p>
              <p className="text-xs text-slate-400">Pahani & e-KYC Prints</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Catalog */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Catalog Highlights</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Popular Citizen & Student Schemes
            </h2>
          </div>
          <Link
            href="/services"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
          >
            <span>View All Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredServices.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm text-slate-500 text-xs">
            No featured services configured yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => {
              const title = service.title || service.name || 'Untitled Service';
              const desc = service.short_description || service.description || '';
              const slug = service.slug || service.id;

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {service.category && (
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full">
                        {service.category}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>
                    {desc && <p className="text-xs text-slate-600 line-clamp-2">{desc}</p>}
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`https://wa.me/917090161083?text=${encodeURIComponent(`Hello Sparsha Cyber Cafe, I need help with: ${title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Verify Docs</span>
                    </a>
                    <Link
                      href={`/services/${slug}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <span>Checklist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Admissions Fast-Track Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="inline-block px-3 py-1 bg-white/10 text-blue-300 text-xs font-bold rounded-full">
              ADMISSIONS 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              KCET, NEET & DCET Option Entry Guidance
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Don't risk seat rejection. We help you create personalized college priority trees, calculate cutoff possibilities, and verify 371(J) HK claims.
            </p>
          </div>
          <Link
            href="/counselling"
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition shrink-0"
          >
            Check Live Cutoffs & Dates
          </Link>
        </div>
      </section>

      {/* Public QR Showcase Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-2xl">
          <div className="space-y-3 text-center md:text-left max-w-lg">
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30">
              Mobile Portal Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Scan & Carry Sparsha Seva On Your Phone
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Scan with any mobile camera or Google Lens to view all 371(J) guidelines, admission alerts, and pre-verify your certificates directly over WhatsApp.
            </p>
          </div>

          <div className="shrink-0 flex justify-center w-full md:w-auto">
            <WebsiteQR />
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Direct Visit</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Visit Sparsha Seva Kendra in Aland</h2>
            
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>Near Lingayat Bhavan, Sagri Complex, Razvi Road, Aland, Karnataka 585302</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <p>Monday – Sunday: 8:00 AM – 8:00 PM</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <p>+91 7090161083 / +91 7483941814</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <p>Shashikantkmali83@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Plus Code Map Route</h3>
            <p className="text-xs text-slate-600">
              Locate us precisely via Google Maps Plus Code: <strong className="text-slate-900">HH78+Q27, Aland, Karnataka</strong>
            </p>
            <a
              href="https://maps.google.com/?q=HH78%2BQ27+Aland+Karnataka"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}