'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'info' | 'ticker';
  link_url?: string;
  is_active: boolean;
}

export default function BroadcastBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [closed, setClosed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          // Fallback static announcement if table is not yet populated
          setAnnouncements([
            {
              id: 'fallback-1',
              title: 'KCET / NEET Option Entry 2026',
              content: 'Document verification & choice filling desk is active at Sparsha Cyber Cafe.',
              type: 'ticker',
              link_url: '/counselling',
              is_active: true,
            },
          ]);
        } else {
          setAnnouncements(data);
        }
      } catch {
        setAnnouncements([
          {
            id: 'fallback-1',
            title: 'KCET / NEET Option Entry 2026',
            content: 'Document verification & choice filling desk is active at Sparsha Cyber Cafe.',
            type: 'ticker',
            link_url: '/counselling',
            is_active: true,
          },
        ]);
      }
    }

    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [announcements]);

  if (closed || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <aside
      aria-label="Urgent Broadcast"
      className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white border-b border-blue-900/40 relative z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black tracking-wider uppercase text-[10px] shrink-0 animate-pulse">
            <Megaphone className="w-3 h-3" />
            Alert
          </span>
          <div className="truncate font-medium flex items-center gap-2">
            <strong className="font-bold text-white shrink-0">{current.title}:</strong>
            <span className="text-blue-100 truncate">{current.content}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {current.link_url && (
            <Link
              href={current.link_url}
              className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 underline text-xs transition"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setClosed(true)}
            aria-label="Dismiss banner"
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}