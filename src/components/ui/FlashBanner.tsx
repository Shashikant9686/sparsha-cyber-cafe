'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

export default function FlashBanner() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    async function loadFlashUpdates() {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('featured', true)
          .neq('status', 'hidden')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          setAnnouncements(data);
        }
      } catch (err) {
        // Silently continue if announcements fail
      }
    }

    loadFlashUpdates();
  }, []);

  if (closed || announcements.length === 0) return null;

  const current = announcements[0];

  return (
    <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white px-4 py-2 text-xs font-medium relative shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 truncate">
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Bell className="w-3 h-3 animate-bounce" /> FLASH ALERT
          </span>
          <span className="truncate font-semibold">{current.title}</span>
          {current.last_date && (
            <span className="hidden sm:inline-block opacity-90">
              (Last Date: {new Date(current.last_date).toLocaleDateString()})
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {current.official_link ? (
            <a
              href={current.official_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 transition text-[11px]"
            >
              Details / Apply <ArrowRight className="w-3 h-3" />
            </a>
          ) : (
            <Link
              href="/services"
              className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 transition text-[11px]"
            >
              Check Requirements <ArrowRight className="w-3 h-3" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setClosed(true)}
            className="p-1 hover:bg-white/20 rounded transition"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}