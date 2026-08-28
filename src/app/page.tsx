import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, ShieldCheck, Clock, FileCheck, HelpCircle, Users, MessageCircle, ListChecks, Megaphone, Layers, CalendarClock } from 'lucide-react';
import { getCategoryIcon } from '@/lib/category-icons';
import WebsiteQR from '@/components/WebsiteQR';
import type { Service, Category } from '@/lib/types';
import { BUSINESS_INFO } from '@/lib/constants';
import { getUpdateUrgency, getUrgencyBadgeClasses } from '@/lib/date-utils';

export const revalidate = 60;

interface HomeUpdateRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  featured: boolean;
  last_date: string | null;
}
export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredServices } = await supabase
    .from('services')
    .select('*, categories(name)')
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(6);

  const { data: latestUpdatesData } = await supabase
    .from('announcements')
    .select('id, title, slug, description, image_url, category, featured, last_date')
    .eq('status', 'active')
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3);

  const latestUpdates: HomeUpdateRow[] = latestUpdatesData || [];

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name, slug, icon, display_order')
    .order('display_order', { ascending: true })
    .limit(8);

  const categories: Category[] = categoriesData || [];

  const staggerClass = (i: number) =>
    ['animate-fade-in-up', 'animate-fade-in-up-1', 'animate-fade-in-up-2', 'animate-fade-in-up-3'][i % 4];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-blue-900 to-slate-950 text-white p-8 sm:p-12 md:p-16 border border-slate-800">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-xs font-semibold animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Aland&apos;s One-Stop Digital Service Center
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight animate-fade-in-up-1">
            {BUSINESS_INFO.name}
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-blue-300 tracking-tight animate-fade-in-up-1">
            {BUSINESS_INFO.tagline}
          </p>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed animate-fade-in-up-2">
            Government certificates, land services, PAN &amp; Aadhaar assistance, exam and college applications, KCET/JEE/NEET counselling, document services, and printing — all completed with verified, checklist-accurate applications.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 animate-fade-in-up-3">
            <Link
              href="/services"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/updates"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2 border border-slate-700"
            >
              <Megaphone className="w-4 h-4" />
              <span>View Latest Updates</span>
            </Link>
            <a
              
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Sparsha%20Online%20Center,%20I%20have%20an%20application%20inquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact / WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      {latestUpdates && latestUpdates.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Latest Updates</h2>
              <p className="text-xs text-slate-500">New applications, exam notices, and important deadlines</p>
            </div>
            <Link href="/updates" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              <span>View All Updates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestUpdates.map((update, i) => (
              <Link
                key={update.id}
                href={`/updates/${update.slug}`}
                className={`group bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col ${staggerClass(i)} ${
                  update.featured ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                }`}
              >
                {update.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={update.image_url} alt={update.title} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-blue-200" />
                  </div>
                )}
                <div className="p-4 space-y-1.5 flex-1 flex flex-col">
                  {update.category && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md w-fit">
                      {update.category}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                    {update.title}
                  </h3>
                  {update.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {update.description}
                    </p>
                  )}
                  {update.last_date && getUpdateUrgency(update.last_date) && (
                    <span
                      className={`mt-auto pt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md w-fit ${getUrgencyBadgeClasses(
                        getUpdateUrgency(update.last_date)!.state
                      )}`}
                    >
                      <CalendarClock className="w-3 h-3" />
                      {getUpdateUrgency(update.last_date)!.label}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
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
            {featuredServices.map((svc: Service, i: number) => (
              <Link
                key={svc.id}
                href={`/services/${svc.slug}`}
                className={`group p-6 bg-white border border-slate-200 hover:border-blue-500 hover:-translate-y-1 rounded-3xl transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between ${staggerClass(i)}`}
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

      {/* Service Categories */}
      {categories.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">What We Help With</h2>
            <p className="text-xs text-slate-500">Browse by category to find the right application faster</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/services?category=${encodeURIComponent(cat.slug)}`}
                className={`group flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-blue-500 hover:-translate-y-0.5 rounded-2xl transition-all duration-300 shadow-xs hover:shadow-md ${staggerClass(i)}`}
              >
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  {(() => {
                    const CatIcon = getCategoryIcon(cat.icon);
                    return <CatIcon className="w-4 h-4" />;
                  })()}
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition leading-snug">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Why Choose {BUSINESS_INFO.name}</h2>
          <p className="text-xs text-slate-500">One center for every kind of online application and document need</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, title: 'One-Stop Digital Center', desc: 'Government applications, land services, exams, admissions, and document work — handled in one place.' },
            { icon: ListChecks, title: 'Checklist-Accurate Applications', desc: 'Every document is verified against the official checklist before submission.' },
            { icon: FileCheck, title: 'Education & Counselling Support', desc: 'KCET, JEE, and NEET option-entry and counselling assistance for students and parents.' },
            { icon: ShieldCheck, title: 'Land Service Expertise', desc: 'Bhoomi RTC, Pahani, and land-record certificate support alongside every other service.' },
            { icon: Clock, title: 'Printing & Document Services', desc: 'Scanning, printing, lamination, and document preparation on the same visit.' },
            { icon: MessageCircle, title: 'Easy WhatsApp Support', desc: 'Reach us directly on WhatsApp for quick questions or help with any application.' },
          ].map((item, i) => (
            <div key={item.title} className={`p-6 bg-white border border-slate-200 hover:border-blue-200 hover:-translate-y-0.5 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 space-y-3 ${staggerClass(i)}`}>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div>
          <h2 className="text-xl font-black text-white">How It Works</h2>
          <p className="text-xs text-slate-400">Four simple steps, every time</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Choose a Service', desc: 'Browse our full list of applications and certificates.' },
            { step: '2', title: 'Check Required Documents', desc: 'View the exact checklist for your chosen service.' },
            { step: '3', title: 'Contact or Visit', desc: 'Reach out on WhatsApp or come to the center directly.' },
            { step: '4', title: 'Application Completed', desc: 'We handle the submission, checked and verified.' },
          ].map((item, i) => (
            <div key={item.step} className={`space-y-2 ${staggerClass(i)}`}>
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
                {item.step}
              </div>
              <h3 className="font-bold text-sm text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick QR Access */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <h3 className="text-lg font-black text-slate-900">Visit Sparsha Online Center on your mobile</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Scan this QR code with any camera app to open our services catalog, verify documents, or share with friends and family. It&apos;s instant and requires no installation.
          </p>
        </div>
        <WebsiteQR />
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-lg">
        <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Need Help With an Application?</h2>
          <p className="text-sm text-blue-100 max-w-lg mx-auto leading-relaxed">
            Reach out to {BUSINESS_INFO.name} on WhatsApp for quick guidance, or visit our counter in person — we&apos;ll help you get it done right.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          
            
              <a href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Sparsha%20Online%20Center,%20I%20have%20an%20application%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <Link
          href="/contact"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2"
          >
            <span>Contact & Location</span>
          </Link>
        </div>
      </section>
    </div>
  );
}