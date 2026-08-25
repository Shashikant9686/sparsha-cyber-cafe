'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, Trash2, Edit3, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface CounsellingEventItem {
  id: string;
  counselling_name: string;
  exam_name: string;
  year: number;
  official_link: string | null;
  status: string;
}

export default function AdminCounsellingPage() {
  const supabase = createClient();

  const [events, setEvents] = useState<CounsellingEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase
          .from('counselling_events')
          .select('id, counselling_name, exam_name, year, official_link, status')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) {
          setEvents((data as CounsellingEventItem[]) || []);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch counselling events:', err);
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Could not fetch counselling events');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleDelete = async (id: string, counsellingName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${counsellingName}"?`)) return;

    try {
      setDeletingId(id);

      await supabase.from('event_dates').delete().eq('counselling_event_id', id);

      const { error } = await supabase.from('counselling_events').delete().eq('id', id);
      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      console.error('Failed to delete counselling event:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete counselling event');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = events.filter((e) =>
    e.counselling_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(e.year).includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Counselling & Admissions</h1>
          <p className="text-xs text-slate-500">
            Manage KCET, NEET, and DCET admission schedules and intake alerts
          </p>
        </div>

        <Link
          href="/admin/counselling/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by counselling name, exam name (KCET, NEET), or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden transition"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading counselling records...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">
            No counselling events found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Event Title</th>
                  <th className="py-3.5 px-4">Exam Type</th>
                  <th className="py-3.5 px-4">Academic Year</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{event.counselling_name}</span>
                        {event.official_link && (
                          <a
                            href={event.official_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition"
                            title="Official Portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                        {event.exam_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {event.year || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                          event.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : event.status === 'Upcoming'
                            ? 'bg-blue-50 text-blue-700'
                            : event.status === 'Deadline Approaching'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/counselling/${event.id}`}
                        className="inline-flex p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit event"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id, event.counselling_name)}
                        disabled={deletingId === event.id}
                        className="inline-flex p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                        title="Delete event"
                      >
                        {deletingId === event.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}