'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Announcement {
  id: string;
  title: string;
  description: string | null;
  official_link: string | null;
  status: string;
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
          .select('id, title, description, official_link, status')
          .eq('status', 'active')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to load announcements:', error);
          setAnnouncements([]);
          return;
        }

        setAnnouncements(data || []);
      } catch (err) {
        console.error('Failed to load announcements:', err);
        setAnnouncements([]);
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
            {current.description && (
              <span className="text-blue-100 truncate">{current.description}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {current.official_link && (
            <Link
              href={current.official_link}
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