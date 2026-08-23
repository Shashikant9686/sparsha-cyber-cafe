'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Edit3, Loader2, AlertCircle, Bell, ExternalLink } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  link_url?: string | null;
  is_active: boolean;
  priority: number;
}

export default function AdminAnnouncementsPage() {
  const supabase = createClient();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAnnouncements() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('priority', { ascending: false });

        if (error) throw error;
        if (isMounted) {
          setAnnouncements((data as Announcement[]) || []);
        }
      } catch (err: unknown) {
        console.error('Failed to load announcements:', err);
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Could not fetch announcements');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAnnouncements();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Title and message are required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        link_url: linkUrl.trim() || null,
        is_active: isActive,
        priority: Number(priority) || 1,
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;

        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...payload } : a))
        );
      } else {
        const { data, error } = await supabase
          .from('announcements')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setAnnouncements((prev) => [data as Announcement, ...prev]);
        }
      }

      handleCancel();
    } catch (err: unknown) {
      console.error('Failed to save announcement:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setLinkUrl(announcement.link_url || '');
    setIsActive(announcement.is_active);
    setPriority(announcement.priority);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setLinkUrl('');
    setIsActive(true);
    setPriority(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      setDeletingId(id);
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) handleCancel();
    } catch (err: unknown) {
      console.error('Failed to delete announcement:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete alert');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Broadcast Alerts & Banners</h1>
        <p className="text-xs text-slate-500">
          Create top notification alerts for new application deadlines, holidays, and admissions
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Create / Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          {editingId ? 'Edit Announcement' : 'Publish New Banner Alert'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Headline Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. KCET 2026 Verification Extended"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Action Link URL (Optional)</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://... or /services/slug"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Message Summary *</label>
            <textarea
              rows={2}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Full ticker notice displayed on the top banner..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="flex items-center gap-6 sm:col-span-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300"
              />
              <span>Banner Active</span>
            </label>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Priority:</span>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{editingId ? 'Update Alert' : 'Publish Alert'}</span>
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">
            No announcements created yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {announcements.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold capitalize ${
                          item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                    {item.link_url && (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline mt-1.5"
                      >
                        <span>{item.link_url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}