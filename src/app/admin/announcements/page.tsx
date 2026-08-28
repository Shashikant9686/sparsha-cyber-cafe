'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Edit3, Loader2, AlertCircle, Bell, ExternalLink } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

interface Announcement {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  start_date: string | null;
  last_date: string | null;
  official_link: string | null;
  status: string;
  featured: boolean;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminAnnouncementsPage() {
  const supabase = createClient();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [officialLink, setOfficialLink] = useState('');
  const [status, setStatus] = useState('active');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<{ id?: string; image_url: string; alt_text: string }[]>([]);
  const [startDate, setStartDate] = useState('');
  const [lastDate, setLastDate] = useState('');
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
          .order('created_at', { ascending: false });

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
    if (!title.trim()) {
      setErrorMsg('Title is required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: title.trim(),
        slug: (slug.trim() || slugify(title)),
        description: description.trim() || null,
        category: category.trim() || null,
        image_url: imageUrl.trim() || null,
        official_link: officialLink.trim() || null,
        status,
        featured,
        start_date: startDate || null,
        last_date: lastDate || null,
        updated_at: new Date().toISOString()
      };

      let activeId = editingId;

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
          activeId = data.id;
          setAnnouncements((prev) => [data as Announcement, ...prev]);
        }
      }

      if (activeId) {
        await supabase.from('announcement_images').delete().eq('announcement_id', activeId);
        if (images.length > 0) {
          const imagePayload = images.map((img, index) => ({
            announcement_id: activeId,
            image_url: img.image_url,
            alt_text: img.alt_text || null,
            display_order: index + 1,
          }));
          const { error: imgError } = await supabase.from('announcement_images').insert(imagePayload);
          if (imgError) {
            console.error('Error saving announcement images:', imgError);
            setErrorMsg(`Announcement saved, but images failed to save: ${imgError.message}`);
          }
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

  const handleEdit = async (announcement: Announcement) => {
    setEditingId(announcement.id);
    const { data: existingImages } = await supabase
      .from('announcement_images')
      .select('id, image_url, alt_text')
      .eq('announcement_id', announcement.id)
      .order('display_order', { ascending: true });
    setImages(existingImages || []);
    setTitle(announcement.title);
    setSlug(announcement.slug);
    setDescription(announcement.description || '');
    setCategory(announcement.category || '');
    setImageUrl(announcement.image_url || '');
    setOfficialLink(announcement.official_link || '');
    setStatus(announcement.status);
    setFeatured(announcement.featured);
    setStartDate(announcement.start_date || '');
    setLastDate(announcement.last_date || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setImages([]);
    setTitle('');
    setSlug('');
    setDescription('');
    setCategory('');
    setImageUrl('');
    setOfficialLink('');
    setStatus('active');
    setFeatured(false);
    setStartDate('');
    setLastDate('');
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
            <label className="text-xs font-bold text-slate-700">Official Link (Optional)</label>
            <input
              type="url"
              value={officialLink}
              onChange={(e) => setOfficialLink(e.target.value)}
              placeholder="https://... or /services/slug"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full ticker notice displayed on the top banner..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <input
              type="text"
              list="update-category-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Exam Application, Scholarship, KCET"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
            <datalist id="update-category-list">
              <option value="Exam Application" />
              <option value="Government Application" />
              <option value="Scholarship" />
              <option value="KCET" />
              <option value="JEE" />
              <option value="NEET" />
              <option value="Counselling" />
              <option value="Job Update" />
              <option value="Admission" />
              <option value="Land Service" />
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Poster / Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Start Date (Optional)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Last Date (Optional)</label>
            <input
              type="date"
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-700">Images / Posters (Optional, multiple allowed)</label>
            <ImageUploader
              bucketName="service-images"
              folderPath="announcements"
              onUploadSuccess={(uploaded) => {
                setImages((prev) => [...prev, { image_url: uploaded.url, alt_text: '' }]);
              }}
            />
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.image_url} alt="" className="w-full h-20 object-cover rounded-lg border border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 sm:col-span-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300"
              />
              <span>Featured</span>
            </label>
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
                          item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                    )}
                    {item.official_link && (
                        <a
                      
                        href={item.official_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline mt-1.5"
                      >
                        <span>{item.official_link}</span>
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