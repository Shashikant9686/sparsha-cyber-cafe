'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { FileText, Bell, Award, ArrowUpRight, Loader2 } from 'lucide-react';
import type { Service } from '@/lib/types';

interface DashboardStats {
  servicesCount: number;
  announcementsCount: number;
  counsellingCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    servicesCount: 0,
    announcementsCount: 0,
    counsellingCount: 0,
  });
  const [recentServices, setRecentServices] = useState<Pick<Service, 'id' | 'name' | 'status' | 'created_at'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const supabase = createClient();

        const [
          { count: sCount, error: sErr },
          { count: aCount, error: aErr },
          { count: cCount, error: cErr },
          { data: latestServices, error: lErr },
        ] = await Promise.all([
          supabase.from('services').select('*', { count: 'exact', head: true }),
          supabase.from('announcements').select('*', { count: 'exact', head: true }),
          supabase.from('counselling_events').select('*', { count: 'exact', head: true }),
          supabase.from('services').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(5),
        ]);

        if (sErr || aErr || cErr || lErr) {
          throw new Error('Failed to load dashboard metrics');
        }

        setStats({
          servicesCount: sCount || 0,
          announcementsCount: aCount || 0,
          counsellingCount: cCount || 0,
        });

        setRecentServices((latestServices as Pick<Service, 'id' | 'name' | 'status' | 'created_at'>[]) || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Admin Control Center</h1>
        <p className="text-xs text-slate-500 mt-1">Overview of cyber cafe operations, live services, and updates.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Services</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-4">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats.servicesCount}
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Announcements</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-4">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats.announcementsCount}
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Counselling Hubs</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-4">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : stats.counsellingCount}
          </div>
        </div>
      </div>

      {/* Recent Services List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Recent Service Catalog Updates</h2>
          <Link href="/admin/services" className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 flex justify-center text-slate-300">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : recentServices.length === 0 ? (
          <p className="text-xs text-slate-400">No services created yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {recentServices.map((svc) => (
              <div key={svc.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{svc.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(svc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  svc.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}