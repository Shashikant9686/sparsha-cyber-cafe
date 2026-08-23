'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, Search, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface CounsellingEventRow {
  id: string;
  title: string;
  slug: string;
  authority_name: string;
  academic_year: string;
  round_name: string | null;
  status: string;
  official_portal_url: string | null;
  description: string | null;
  created_at: string;
}

export default function AdminCounsellingPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<CounsellingEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const { data, error: err } = await supabase
        .from('counselling_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setEvents((data as CounsellingEventRow[]) || []);
    } catch (err: unknown) {
      console.error('Error fetching counselling events:', err);
      setFetchError(err instanceof Error ? err.message : 'Failed to load counselling events');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error: delError } = await supabase
        .from('counselling_events')
        .delete()
        .eq('id', id);

      if (delError) throw delError;
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting event:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.authority_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Counselling & Option Entry</h1>
          <p className="text-xs text-slate-500">Manage KEA, KCET, NEET, and admission schedules.</p>
        </div>
        <Link
          href="/admin/counselling/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Counselling Event</span>
        </Link>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Failed to load counselling events: </span>
            {fetchError}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by title or authority..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-xs">Loading counselling events...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center text-rose-600 text-xs">
            An error occurred while loading events.
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {searchQuery ? 'No counselling events match your search.' : 'No counselling events found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Authority</th>
                  <th className="py-3 px-4">Academic Year</th>
                  <th className="py-3 px-4">Round</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{evt.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{evt.authority_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{evt.academic_year}</td>
                    <td className="py-3.5 px-4 text-slate-600">{evt.round_name || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        evt.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/counselling/${evt.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="View Live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/counselling/${evt.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(evt.id, evt.title)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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