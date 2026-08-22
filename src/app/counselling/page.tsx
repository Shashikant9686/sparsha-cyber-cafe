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
    .neq('status', 'Hidden')
    .order('created_at', { ascending: false });

  const counsellingList: CounsellingEvent[] = (events as unknown as CounsellingEvent[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Admission Counselling Desk
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          KCET, NEET, JEE, and DCET document verification and option entry schedule in Aland.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {counsellingList.map((event) => (
          <div
            key={event.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg">
                {event.exam_type} ({event.academic_year})
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                {event.status}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{event.title}</h2>
            {event.description && (
              <p className="text-xs text-slate-600">{event.description}</p>
            )}

            {event.event_dates && event.event_dates.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400">Important Dates</span>
                <ul className="space-y-1.5">
                  {event.event_dates.map((d) => (
                    <li key={d.id} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2 rounded-lg">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {d.title}
                      </span>
                      <span className="font-bold text-slate-900">{d.date_text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.official_portal_url && (
              <a
                href={event.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-2"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}