import React from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Calendar, ExternalLink } from 'lucide-react';
import { CounsellingEvent } from '@/lib/types';

export const metadata: Metadata = {
  title: 'KCET, NEET, JEE & DCET Counselling Assistance Aland',
  description:
    'Expert admission counselling assistance in Aland for KCET, NEET, JEE, and DCET. Option entry guidance, document verification dates, and seat allotment support.',
};

export default async function CounsellingPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('counselling_events')
    .select('*, event_dates(*)')
    .ilike('status', 'active')
    .order('created_at', { ascending: false });

  const counsellingList: CounsellingEvent[] = events || [];

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">
            Admission Counselling Desk
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            KCET, NEET, JEE, and DCET document verification and option entry schedule in Aland.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {counsellingList.map((event) => (
            <div
              key={event.id}
              className="bg-surface p-6 rounded-panel border border-stone-200 shadow-panel space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide text-saffron">
                  {event.exam_name} ({event.year})
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-green">
                  {event.status}
                </span>
              </div>

              <h2 className="font-display text-lg font-semibold text-ink">{event.counselling_name}</h2>
              {event.description && (
                <p className="text-xs text-stone-500 leading-relaxed">{event.description}</p>
              )}

              {event.event_dates && event.event_dates.length > 0 && (
                <div className="space-y-1 pt-3 border-t border-stone-200">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Important Dates</span>
                  <ul className="divide-y divide-stone-200">
                    {event.event_dates.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3 text-xs text-ink py-2">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-saffron" />
                          {d.title}
                        </span>
                        <span className="font-bold text-ink shrink-0">
                          {d.start_date
                            ? new Date(d.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Date to be announced'}
                          {d.end_date && ` – ${new Date(d.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.official_link && (
                <a
                  href={event.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron hover:opacity-80 pt-2"
                >
                  <span>Visit Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}