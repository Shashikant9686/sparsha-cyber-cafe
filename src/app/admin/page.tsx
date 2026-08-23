import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import WebsiteQR from '@/components/WebsiteQR';
import { 
  FileText, 
  FolderKanban, 
  GraduationCap, 
  Megaphone, 
  Plus, 
  ArrowRight, 
  ExternalLink,
  Edit
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: servicesCount, data: recentServices }, { count: categoriesCount }, { count: admissionsCount }, { count: announcementsCount }] = await Promise.all([
    supabase.from('services').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('counselling_schedules').select('*', { count: 'exact', head: true }),
    supabase.from('announcements').select('*', { count: 'exact', head: true }),
  ]);

  const services = recentServices || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[11px] font-bold">
            <span>OPERATOR CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Sparsha Cyber Cafe Management Desk</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Aland taluk service directory, application checklists, and live flash banners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/services/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Catalog</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{servicesCount || services.length || 0}</p>
            <span className="text-[11px] text-slate-500">Active Schemes & Services</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categories</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{categoriesCount || 6}</p>
            <span className="text-[11px] text-slate-500">Organized Departments</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admissions</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{admissionsCount || 0}</p>
            <span className="text-[11px] text-slate-500">KCET / NEET Schedules</span>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Broadcasts</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{announcementsCount || 0}</p>
            <span className="text-[11px] text-slate-500">Flash Alert Notices</span>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Operations & Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Operations</h2>
          <div className="space-y-2.5">
            <Link
              href="/admin/services/new"
              className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl transition flex items-center justify-between group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                Publish New Government Application
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </Link>

            <Link
              href="/admin/announcements"
              className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl transition flex items-center justify-between group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                Broadcast Flash Notice / Deadline Alert
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </Link>

            <Link
              href="/admin/counselling"
              className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl transition flex items-center justify-between group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                Update KCET / NEET Option Entry Dates
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </Link>

            <Link
              href="/admin/services"
              className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl transition flex items-center justify-between group"
            >
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                Manage & Edit Published Services
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recently Configured Services</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Live listings visible to public visitors</p>
            </div>
            <Link href="/admin/services" className="text-xs font-bold text-blue-600 hover:underline">
              View All ({servicesCount || services.length})
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No services registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((svc: any) => {
                const title = svc.title || svc.name || 'Untitled Service';
                const cat = svc.category || 'General';
                return (
                  <div
                    key={svc.id}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-white hover:border-slate-200 hover:shadow-xs transition"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">{title}</p>
                      <span className="inline-block text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                        {cat}
                      </span>
                    </div>

                    <Link
                      href={`/admin/services/${svc.id}/edit`}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition inline-flex items-center gap-1 text-xs font-semibold"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Private Admin Counter Standee Generator */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
            Operator Counter Utility
          </span>
          <h2 className="text-lg font-black text-slate-900">
            Sparsha Seva Kendra Desk Standee Generator
          </h2>
          <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
            Download the high-resolution QR image below to print and laminate for your cafe counter. Customers scanning this QR will instantly load your public seva catalog on their mobile phones.
          </p>
        </div>

        <div className="shrink-0">
          <WebsiteQR />
        </div>
      </div>
    </div>
  );
}