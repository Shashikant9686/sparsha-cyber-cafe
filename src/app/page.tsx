import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, ShieldCheck, Clock, FileCheck, HelpCircle, Users, MessageCircle, ListChecks, Megaphone, CalendarClock } from 'lucide-react';
import { getCategoryIcon } from '@/lib/category-icons';
import WebsiteQR from '@/components/WebsiteQR';
import type { Service, Category } from '@/lib/types';
import { BUSINESS_INFO } from '@/lib/constants';
import { getUpdateUrgency, getUrgencyBadgeClasses } from '@/lib/date-utils';
import ApplicationCoreScene from '@/components/three/ApplicationCoreScene';

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
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
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
      <section className="relative overflow-hidden rounded-panel bg-ink text-ivory p-8 sm:p-12 md:p-16 border border-ink-soft">
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-6 items-center">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-saffron/10 border border-saffron/20 rounded-full text-saffron text-xs font-semibold animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
              Aland&apos;s One-Stop Digital Service Center
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight animate-fade-in-up-1">
              {BUSINESS_INFO.name}
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-saffron tracking-tight animate-fade-in-up-1">
              {BUSINESS_INFO.tagline}
            </p>
            <p className="text-ivory/70 text-sm sm:text-base leading-relaxed animate-fade-in-up-2">
              Government certificates, land services, PAN &amp; Aadhaar assistance, exam and college applications, KCET/JEE/NEET counselling, document services, and printing — all completed with verified, checklist-accurate applications.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 animate-fade-in-up-3">
              <Link
                href="/services"
                className="px-6 py-3 bg-saffron hover:opacity-90 text-ink rounded-control text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2 shadow-panel-hover"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/updates"
                className="px-6 py-3 bg-ink-soft hover:bg-ink-soft/70 text-ivory rounded-control text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2 border border-ivory/10"
              >
                <Megaphone className="w-4 h-4" />
                <span>View Latest Updates</span>
              </Link>
              <a
              
                href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Sparsha%20Online%20Center,%20I%20have%20an%20application%20inquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-whatsapp hover:opacity-90 text-white rounded-control text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2 shadow-panel-hover"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact / WhatsApp</span>
              </a>
            </div>
          </div>

            <ApplicationCoreScene />
        </div>
      </section>

      {/* Latest Updates */}
      {latestUpdates && latestUpdates.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Latest Updates</h2>
              <p className="text-xs text-stone-500">New applications, exam notices, and important deadlines</p>
            </div>
            <Link href="/updates" className="text-xs font-bold text-saffron hover:opacity-80 inline-flex items-center gap-1 active:scale-95 transition-transform">
              <span>View All Updates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            {/* Featured update */}
            {(() => {
              const featured = latestUpdates[0];
              return (
                <Link
                  href={`/updates/${featured.slug}`}
                  className={`group bg-surface rounded-panel border overflow-hidden shadow-panel hover:shadow-panel-hover hover:-translate-y-1 active:scale-95 transition-all duration-300 flex flex-col sm:flex-row animate-fade-in-up ${
                    featured.featured ? 'border-saffron/40 ring-1 ring-saffron/20 featured-card-glow' : 'border-stone-200'
                  }`}
                >
                  {featured.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.image_url} alt={featured.title} className="w-full sm:w-2/5 h-40 sm:h-auto object-cover" />
                  ) : (
                    <div className="w-full sm:w-2/5 h-40 sm:h-auto bg-saffron-soft flex items-center justify-center">
                      <Megaphone className="w-8 h-8 text-saffron/50" />
                    </div>
                  )}
                  <div className="p-5 sm:p-6 space-y-2 flex-1 flex flex-col justify-center">
                    {featured.category && (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-saffron-soft text-saffron rounded-md w-fit">
                        {featured.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-ink leading-snug group-hover:text-saffron transition">
                      {featured.title}
                    </h3>
                    {featured.description && (
                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                        {featured.description}
                      </p>
                    )}
                    {featured.last_date && getUpdateUrgency(featured.last_date) && (
                      <span
                        className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md w-fit ${getUrgencyBadgeClasses(
                          getUpdateUrgency(featured.last_date)!.state
                        )}`}
                      >
                        <CalendarClock className="w-3 h-3" />
                        {getUpdateUrgency(featured.last_date)!.label}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })()}

            {/* Supporting updates */}
            <div className="flex flex-col gap-4">
              {latestUpdates.slice(1).map((update, i) => (
                <Link
                  key={update.id}
                  href={`/updates/${update.slug}`}
                  className={`group flex items-center gap-4 p-4 bg-surface rounded-panel border border-stone-200 hover:border-saffron/40 hover:-translate-y-0.5 active:scale-95 shadow-panel hover:shadow-panel-hover transition-all duration-300 ${staggerClass(i + 1)}`}
                >
                  <div className="w-12 h-12 rounded-control bg-saffron-soft text-saffron flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    {update.category && (
                      <span className="inline-block text-[10px] font-bold text-saffron">{update.category}</span>
                    )}
                    <h3 className="text-sm font-bold text-ink leading-snug line-clamp-1 group-hover:text-saffron transition">
                      {update.title}
                    </h3>
                    {update.last_date && getUpdateUrgency(update.last_date) && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md w-fit ${getUrgencyBadgeClasses(
                          getUpdateUrgency(update.last_date)!.state
                        )}`}
                      >
                        <CalendarClock className="w-2.5 h-2.5" />
                        {getUpdateUrgency(update.last_date)!.label}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Services */}
      {featuredServices && featuredServices.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Popular Services</h2>
              <p className="text-xs text-stone-500">Most requested applications and certificates</p>
            </div>
            <Link href="/services" className="text-xs font-bold text-saffron hover:opacity-80 inline-flex items-center gap-1 active:scale-95 transition-transform">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((svc: Service, i: number) => (
              <Link
                key={svc.id}
                href={`/services/${svc.slug}`}
                className={`group bg-surface border border-stone-200 hover:border-saffron/50 hover:-translate-y-1 active:scale-95 rounded-panel transition-all duration-300 shadow-panel hover:shadow-panel-hover flex flex-col justify-between ${staggerClass(i)} ${
                  i === 0 ? 'sm:col-span-2 p-8' : 'p-6'
                }`}
              >
                <div className="space-y-2">
                  {i === 0 && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-saffron text-ink rounded-md w-fit mb-1">
                      Most Requested
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-saffron">
                    {svc.submission_method}
                  </span>
                  <h3 className={`font-bold text-ink group-hover:text-saffron transition ${i === 0 ? 'text-lg' : 'text-sm'}`}>
                    {svc.name}
                  </h3>
                  <p className={`text-stone-500 leading-relaxed ${i === 0 ? 'text-sm line-clamp-2 max-w-lg' : 'text-xs line-clamp-2'}`}>
                    {svc.short_description || 'View required documents and guidelines.'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
                  <span>{svc.fee != null ? `Fee: ₹${svc.fee}` : 'Free Application'}</span>
                  <span className="text-saffron group-hover:translate-x-1 transition">Apply &rarr;</span>
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
            <h2 className="font-display text-xl font-semibold text-ink">What We Help With</h2>
            <p className="text-xs text-stone-500">Browse by category to find the right application faster</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/services?category=${encodeURIComponent(cat.slug)}`}
                className={`group shrink-0 flex items-center gap-2 pl-2 pr-4 py-2 bg-surface border border-stone-200 hover:border-saffron/50 hover:bg-saffron-soft rounded-full transition-all duration-300 shadow-panel hover:shadow-panel-hover active:scale-95 ${staggerClass(i)}`}
              >
                <div className="p-2 bg-saffron-soft text-saffron rounded-full shrink-0 group-hover:bg-surface transition">
                  {(() => {
                    const CatIcon = getCategoryIcon(cat.icon);
                    return <CatIcon className="w-4 h-4" />;
                  })()}
                </div>
                <span className="text-xs font-bold text-ink whitespace-nowrap">
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
          <h2 className="font-display text-xl font-semibold text-ink">Why Choose {BUSINESS_INFO.name}</h2>
          <p className="text-xs text-stone-500">One center for every kind of online application and document need</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 bg-surface border border-stone-200 rounded-panel shadow-panel p-8 sm:p-10">
          {/* Trust statement */}
          <div className="space-y-4 lg:pr-8 lg:border-r lg:border-stone-200">
            <div className="w-12 h-12 rounded-control bg-saffron-soft text-saffron flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-ink leading-snug">
              Every application, checked before it&apos;s submitted.
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              SPARSHA brings government applications, land services, education counselling, and document work into one verified process — so nothing goes in incomplete or incorrect.
            </p>
          </div>

          {/* Supporting points */}
          <div className="divide-y divide-stone-200">
            {[
              { icon: Users, title: 'One-Stop Digital Center', desc: 'Government applications, land services, exams, admissions, and document work — handled in one place.' },
              { icon: ListChecks, title: 'Checklist-Accurate Applications', desc: 'Every document is verified against the official checklist before submission.' },
              { icon: FileCheck, title: 'Education & Counselling Support', desc: 'KCET, JEE, and NEET option-entry and counselling assistance for students and parents.' },
              { icon: ShieldCheck, title: 'Land Service Expertise', desc: 'Bhoomi RTC, Pahani, and land-record certificate support alongside every other service.' },
              { icon: Clock, title: 'Printing & Document Services', desc: 'Scanning, printing, lamination, and document preparation on the same visit.' },
              { icon: MessageCircle, title: 'Easy WhatsApp Support', desc: 'Reach us directly on WhatsApp for quick questions or help with any application.' },
            ].map((item, i) => (
              <div key={item.title} className={`flex items-start gap-4 py-4 first:pt-0 last:pb-0 ${staggerClass(i)}`}>
                <div className="p-2 bg-green-soft text-green rounded-control shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-ink">{item.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-ink text-ivory rounded-panel p-8 sm:p-12 space-y-10">
        <div>
          <h2 className="font-display text-xl font-semibold text-ivory">How It Works</h2>
          <p className="text-xs text-ivory/60">Four simple steps, every time</p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-5 left-0 right-0 h-px bg-ivory/15" aria-hidden="true" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {[
              { step: '1', title: 'Choose a Service', desc: 'Browse our full list of applications and certificates.' },
              { step: '2', title: 'Check Required Documents', desc: 'View the exact checklist for your chosen service.' },
              { step: '3', title: 'Contact or Visit', desc: 'Reach out on WhatsApp or come to the center directly.' },
              { step: '4', title: 'Application Completed', desc: 'We handle the submission, checked and verified.' },
            ].map((item, i) => (
              <div key={item.step} className={`relative space-y-2 ${staggerClass(i)}`}>
                <div className="relative z-10 w-10 h-10 rounded-full bg-saffron text-ink flex items-center justify-center font-display font-semibold text-sm">
                  {item.step}
                </div>
                <h3 className="font-bold text-sm text-ivory">{item.title}</h3>
                <p className="text-xs text-ivory/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick QR Access */}
      <section className="bg-surface border border-stone-200 rounded-panel p-8 shadow-panel flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <h3 className="text-lg font-bold text-ink">Visit Sparsha Online Center on your mobile</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Scan this QR code with any camera app to open our services catalog, verify documents, or share with friends and family. It&apos;s instant and requires no installation.
          </p>
        </div>
        <WebsiteQR />
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-ink to-ink-soft text-ivory rounded-panel p-8 sm:p-12 text-center space-y-5 shadow-panel-hover">
        <div className="w-12 h-12 bg-ivory/10 border border-ivory/20 rounded-control flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">Need Help With an Application?</h2>
          <p className="text-sm text-ivory/70 max-w-lg mx-auto leading-relaxed">
            Reach out to {BUSINESS_INFO.name} on WhatsApp for quick guidance, or visit our counter in person — we&apos;ll help you get it done right.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <a
          
            href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Sparsha%20Online%20Center,%20I%20have%20an%20application%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-whatsapp hover:opacity-90 text-white rounded-control text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2 shadow-panel-hover"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <Link
            href="/contact"
            className="px-6 py-3 bg-ivory/10 hover:bg-ivory/20 border border-ivory/20 text-ivory rounded-control text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center gap-2"
          >
            <span>Contact & Location</span>
          </Link>
        </div>
      </section>
    </div>
  );
}