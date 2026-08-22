'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  Layers, 
  FileCheck, 
  GraduationCap, 
  Megaphone, 
  Plus, 
  ArrowRight, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface StatsOverview {
  totalServices: number;
  totalCategories: number;
  totalAnnouncements: number;
  totalCounselling: number;
}

export default function AdminDashboardPage() {
  const supabase = createClient();

  const [stats, setStats] = useState<StatsOverview>({
    totalServices: 0,
    totalCategories: 0,
    totalAnnouncements: 0,
    totalCounselling: 0,
  });
  const [recentServices, setRecentServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        setLoading(true);

        const [
          { count: srvCount },
          { count: catCount },
          { count: annCount },
          { count: cnsCount },
          { data: recentSrv }
        ] = await Promise.all([
          supabase.from('services').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('announcements').select('*', { count: 'exact', head: true }),
          supabase.from('counselling_events').select('*', { count: 'exact', head: true }),
          supabase.from('services').select('id, name, slug, status, categories(name)').order('created_at', { ascending: false }).limit(6)
        ]);

        setStats({
          totalServices: srvCount || 0,
          totalCategories: catCount || 0,
          totalAnnouncements: annCount || 0,
          totalCounselling: cnsCount || 0,
        });

        setRecentServices(recentSrv || []);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardMetrics();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 sm:p-8 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Operator Control Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Sparsha Cyber Cafe Management Desk</h1>
          <p className="text-xs text-slate-300 mt-1">Aland taluk service directory, application checklists, and live flash banners.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/services/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Service
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            View Live Site <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Services Count */}
        <Link href="/admin/services" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Live Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalServices}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active Schemes & Services</span>
          </div>
        </Link>

        {/* Categories Count */}
        <Link href="/admin/categories" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Categories</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalCategories}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Organized Departments</span>
          </div>
        </Link>

        {/* Counselling Events Count */}
        <Link href="/admin/counselling" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Admissions</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalCounselling}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">KCET / NEET Schedules</span>
          </div>
        </Link>

        {/* Announcements Count */}
        <Link href="/admin/announcements" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-400 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Broadcasts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalAnnouncements}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Flash Alert Notices</span>
          </div>
        </Link>

      </div>

      {/* Grid: Quick Actions & Recently Added Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Operational Shortcuts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Quick Operations</h2>
          
          <div className="space-y-2.5 text-xs font-semibold">
            <Link
              href="/admin/services/new"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-200 transition text-slate-800 hover:text-blue-700"
            >
              <span>Publish New Government Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/announcements"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition text-slate-800 hover:text-rose-700"
            >
              <span>Broadcast Flash Notice / Deadline Alert</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/counselling"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition text-slate-800 hover:text-indigo-700"
            >
              <span>Update KCET / NEET Option Entry Dates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 hover:border-amber-200 transition text-slate-800 hover:text-amber-700"
            >
              <span>Manage Service Category Names</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Live Catalog Table Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recently Configured Services</h2>
              <p className="text-[11px] text-slate-400">Live listings visible to public visitors</p>
            </div>
            <Link
              href="/admin/services"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              View All ({stats.totalServices})
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
              <p className="text-xs text-slate-400">Loading catalog items...</p>
            </div>
          ) : recentServices.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {recentServices.map((srv) => (
                <div key={srv.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-xl transition">
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{srv.name}</p>
                    <span className="text-[10px] text-slate-400">{srv.categories?.name?.split('/')[0] || 'General'}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {srv.status}
                    </span>
                    <Link
                      href={`/admin/services/${srv.id}`}
                      className="text-slate-400 hover:text-blue-600 font-bold"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No services registered yet.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}