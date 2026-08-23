'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Loader2, AlertCircle, Megaphone, Calendar } from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const { data, error: err } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setAnnouncements((data as AnnouncementItem[]) || []);
    } catch (err: unknown) {
      console.error('Error fetching announcements:', err);
      setFetchError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error: insertError } = await supabase
        .from('announcements')
        .insert({
          title,
          message,
          is_active: isActive,
          starts_at: startsAt || null,
          expires_at: expiresAt || null,
        });

      if (insertError) throw insertError;

      setTitle('');
      setMessage('');
      setIsActive(true);
      setStartsAt('');
      setExpiresAt('');
      await fetchAnnouncements();
    } catch (err: unknown) {
      console.error('Error creating announcement:', err);
      alert(err instanceof Error ? err.message : 'Failed to create announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error: toggleError } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (toggleError) throw toggleError;
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !currentStatus } : a))
      );
    } catch (err: unknown) {
      console.error('Error toggling status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update announcement status');
    }
  };

  const handleDelete = async (id: string, annTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${annTitle}"?`)) return;

    try {
      const { error: delError } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (delError) throw delError;
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      console.error('Error deleting announcement:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Broadcast Announcements</h1>
        <p className="text-xs text-slate-500">Publish flash news banners and urgent deadline alerts.</p>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Failed to load announcements: </span>
            {fetchError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcement Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-600" />
            <span>Create Flash Alert</span>
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Headline / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. KCET Option Entry Round 2 Live"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Message / Instructions</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Brief summary displayed to visitors..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Start Date</label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Expires Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
                Publish Immediately
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish Alert</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Announcements List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <span className="text-xs">Loading announcements...</span>
            </div>
          ) : fetchError ? (
            <div className="p-12 text-center text-rose-600 text-xs">
              An error occurred while loading announcements.
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No active or archived announcements found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Title & Message</th>
                    <th className="py-3 px-4">Valid Period</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {announcements.map((ann) => (
                    <tr key={ann.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ann.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{ann.message}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {ann.starts_at ? new Date(ann.starts_at).toLocaleDateString() : 'Now'} –{' '}
                          {ann.expires_at ? new Date(ann.expires_at).toLocaleDateString() : 'Forever'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(ann.id, ann.is_active)}
                          className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition ${
                            ann.is_active
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {ann.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(ann.id, ann.title)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}