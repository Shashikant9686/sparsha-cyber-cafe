'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  FileText,
  GraduationCap,
  BellRing,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface OverviewStats {
  servicesCount: number;
  counsellingCount: number;
  announcementsCount: number;
  categoriesCount: number;
}

export default function AdminDashboardOverview() {
  const supabase = createClient();

  const [stats, setStats] = useState<OverviewStats>({
    servicesCount: 0,
    counsellingCount: 0,
    announcementsCount: 0,
    categoriesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const [servicesRes, counsellingRes, announcementsRes, categoriesRes] = await Promise.all([
          supabase.from('services').select('*', { count: 'exact', head: true }),
          supabase.from('counselling_events').select('*', { count: 'exact', head: true }),
          supabase.from('announcements').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true })
        ]);

        if (isMounted) {
          setStats({
            servicesCount: servicesRes.count || 0,
            counsellingCount: counsellingRes.count || 0,
            announcementsCount: announcementsRes.count || 0,
            categoriesCount: categoriesRes.count || 0
          });
        }
      } catch (err: unknown) {
        console.error('Failed to load admin stats:', err);
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch dashboard metrics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const cards = [
    {
      title: 'Active Services',
      count: stats.servicesCount,
      description: 'Government portals, student forms & pan card listings',
      href: '/admin/services',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Counselling Events',
      count: stats.counsellingCount,
      description: 'KCET, NEET, and DCET admission tracking schedules',
      href: '/admin/counselling',
      icon: GraduationCap,
      color: 'amber'
    },
    {
      title: 'Live Announcements',
      count: stats.announcementsCount,
      description: 'Top emergency banner updates and portal deadline alerts',
      href: '/admin/announcements',
      icon: BellRing,
      color: 'rose'
    },
    {
      title: 'Service Categories',
      count: stats.categoriesCount,
      description: 'Taxonomies, filters, and icon assignments',
      href: '/admin/categories',
      icon: Layers,
      color: 'emerald'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor cafe metrics, live applications, and admissions desk schedules
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-3xl p-6 transition group shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                </div>

                <div>
                  <div className="text-2xl font-black text-slate-900">
                    {loading ? '...' : card.count}
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{card.title}</div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Manage records</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}