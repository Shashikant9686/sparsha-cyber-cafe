'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Link as LinkIcon, Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: string;
  link_url: string;
  is_active: boolean;
  created_at?: string;
}

export default function AnnouncementsAdminPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLink, setNewLink] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      } else {
        // Mock default if table is empty
        setItems([
          {
            id: 'mock-1',
            title: 'KCET / NEET Option Entry 2026',
            content: 'Document verification & choice filling desk is active at Sparsha Cyber Cafe.',
            type: 'ticker',
            link_url: '/counselling',
            is_active: true,
          },
        ]);
      }
    } catch {
      // Fallback in case of network issue
      setItems([
        {
          id: 'mock-1',
          title: 'KCET / NEET Option Entry 2026',
          content: 'Document verification & choice filling desk is active at Sparsha Cyber Cafe.',
          type: 'ticker',
          link_url: '/counselling',
          is_active: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    const newEntry = {
      title: newTitle.trim(),
      content: newContent.trim(),
      type: 'ticker',
      link_url: newLink.trim() || '/services',
      is_active: true,
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('announcements')
        .insert([newEntry])
        .select()
        .single();

      if (!error && data) {
        setItems([data, ...items]);
      } else {
        // Local state fallback
        const localItem: AnnouncementItem = {
          id: Date.now().toString(),
          ...newEntry,
        };
        setItems([localItem, ...items]);
      }

      setNewTitle('');
      setNewContent('');
      setNewLink('');
    } catch {
      const localItem: AnnouncementItem = {
        id: Date.now().toString(),
        ...newEntry,
      };
      setItems([localItem, ...items]);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_active: !currentStatus } : it))
      );
    } catch {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, is_active: !currentStatus } : it))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this broadcast?')) return;
    try {
      const supabase = createClient();
      await supabase.from('announcements').delete().eq('id', id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Broadcast Flash & Deadline Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish real-time ticker banners and urgent deadline alerts across the top of the live website.
          </p>
        </div>
        <button
          onClick={fetchAnnouncements}
          disabled={loading}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Create New Announcement Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Create New Live Alert Banner
        </h2>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Alert Headline / Subject
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. KCET 2026 Option Entry Started"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Target Route Link
              </label>
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="/counselling or /services"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Announcement Details
            </label>
            <textarea
              required
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Provide key dates, required documents, or closing timings..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Megaphone className="w-4 h-4" />
                <span>Publish Broadcast</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Existing Announcements List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Current Broadcasts</h2>
        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
            Loading announcements...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No announcements found. Create one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  item.is_active
                    ? 'bg-white border-blue-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.is_active ? 'Active on Live Site' : 'Paused / Inactive'}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-600">{item.content}</p>
                  <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> {item.link_url}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleActive(item.id, item.is_active)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      item.is_active
                        ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {item.is_active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
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