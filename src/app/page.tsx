'use client';
import type { Metadata } from 'next';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BUSINESS_INFO } from '@/lib/constants';
import { 
  ShieldCheck, 
  GraduationCap, 
  FileText, 
  MapPin, 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Users,
  Award
} from 'lucide-react';

export default function HomePage() {
  const supabase = createClient();
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select(`
            id,
            name,
            slug,
            short_description,
            fee,
            service_charge,
            status,
            categories (name),
            required_documents (id, document_name, is_mandatory)
          `)
          .eq('featured', true)
          .eq('status', 'Active')
          .limit(8);

        if (!error && data) {
          setFeaturedServices(data);
        }
      } catch (err) {
        console.error('Error fetching featured services:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeatured();
  }, []);

  const handleGeneralWhatsApp = () => {
    const message = `*Sparsha Cyber Cafe Aland - Quick Inquiry*\n\n` +
      `Hello, I would like assistance with an application. Please check my eligibility and document requirements.`;
    window.open(`https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Trusted Cyber & Digital Center in Aland
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Fast, Error-Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">Online & Land Services</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Your one-stop digital assistance desk for Kalyana-Karnataka 371(J) certificates, Bhoomi RTC Pahani extracts, KCET/NEET option entry, and state recruitment applications.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/services"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2"
              >
                Browse Service Directory <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleGeneralWhatsApp}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Document Check
              </button>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-center lg:text-left">
              <div>
                <span className="block text-xl sm:text-2xl font-black text-white">100%</span>
                <span className="text-[11px] text-slate-400 font-medium">Error-Free Checklists</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-400">371(J)</span>
                <span className="text-[11px] text-slate-400 font-medium">Regional Quota Experts</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-blue-400">Instant</span>
                <span className="text-[11px] text-slate-400 font-medium">Pahani & e-KYC Prints</span>
              </div>
            </div>
          </div>

          {/* Hero Side Feature Card */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/15 space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" /> Center Quick Info
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Near Lingayat Bhavan, M.K Sagri Complex, Aland, Karnataka 585302</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Open 8:00 AM – 8:00 PM (Monday – Sunday)</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono font-bold">+91 7090161083 / +91 7483941814</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-500/30 text-xs text-blue-200 space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> WhatsApp Pre-Verification
              </p>
              <p className="text-[11px] text-slate-300">
                Send photos of your documents via WhatsApp before arriving at the cafe to ensure complete eligibility.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Top Popular Services Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 block">Catalog Highlights</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Popular Citizen & Student Schemes</h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            View All Services <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-blue-300 transition group space-y-4"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    {srv.categories?.name?.split('/')[0] || 'Government Service'}
                  </span>

                  <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {srv.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {srv.short_description}
                  </p>

                  {srv.required_documents && srv.required_documents.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Key Documents:</span>
                      <ul className="text-[11px] text-slate-600 space-y-0.5">
                        {srv.required_documents.slice(0, 2).map((doc: any) => (
                          <li key={doc.id} className="truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                            {doc.document_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/services/${srv.slug}`}
                    className="text-xs font-bold text-slate-700 hover:text-blue-600 transition flex items-center gap-1"
                  >
                    View Checklist <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/services/${srv.slug}`}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs rounded-xl transition"
                  >
                    Apply Desk
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Counselling Dedicated Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
              Admissions 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">KCET, NEET & DCET Option Entry Guidance</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Don't risk seat rejection. We help you create personalized college priority trees, calculate cutoff possibilities, and verify 371(J) HK claims.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/counselling"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition"
            >
              Check Live Cutoffs & Dates
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Contact & Center Visit Section */}
      <section id="contact" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 block">Visit Our Center</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sparsha Online Centre Aland</h2>
              <p className="text-xs text-slate-500 mt-1">Conveniently located near the center of Aland town.</p>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Address:</p>
                  <p className="text-slate-600">Near Lingasayat Bhavan, M.K Sagri Complex, Aland, Karnataka 585302</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Helpline Numbers:</p>
                  <p className="font-mono text-slate-600 font-bold">+91 7090161083 / +91 7483941814</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Business Hours:</p>
                  <p className="text-slate-600">Monday – Sunday: 8:00 AM – 8:00 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" /> Call Now
              </a>
              <button
                type="button"
                onClick={handleGeneralWhatsApp}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> Message on WhatsApp
              </button>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
            <iframe
              title="Sparsha Cyber Cafe Location"
              src="https://maps.google.com/maps?q=Aland,Karnataka&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>

        </div>
      </section>

    </div>
  );
}