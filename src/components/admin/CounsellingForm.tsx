'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export interface CounsellingEventData {
  id?: string;
  title: string;
  category: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  official_link?: string | null;
  status?: string;
  important_notes?: string | null;
}

interface CounsellingFormProps {
  initialData?: CounsellingEventData | null;
  eventId?: string;
}

export default function CounsellingForm({ initialData, eventId }: CounsellingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'KCET');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDate, setStartDate] = useState(
    initialData?.start_date ? initialData.start_date.substring(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.end_date ? initialData.end_date.substring(0, 10) : ''
  );
  const [officialLink, setOfficialLink] = useState(initialData?.official_link || '');
  const [status, setStatus] = useState(initialData?.status || 'active');
  const [importantNotes, setImportantNotes] = useState(initialData?.important_notes || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Event title is required');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim() || null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        official_link: officialLink.trim() || null,
        status,
        important_notes: importantNotes.trim() || null,
        updated_at: new Date().toISOString()
      };

      if (eventId) {
        const { error } = await supabase
          .from('counselling_events')
          .update(payload)
          .eq('id', eventId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('counselling_events').insert([payload]);
        if (error) throw error;
      }

      router.push('/admin/counselling');
      router.refresh();
    } catch (err: unknown) {
      console.error('Failed to save counselling event:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/counselling"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {eventId ? 'Edit Counselling Event' : 'Add Counselling Event'}
            </h1>
            <p className="text-xs text-slate-500">
              Publish admission alerts, option entry schedules, and rank guidelines
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{eventId ? 'Save Changes' : 'Publish Event'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Info Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Event Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g. KCET 2026 Round 1 Option Entry & Document Verification"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="KCET">KCET (Engineering / Pharma)</option>
              <option value="NEET">NEET (Medical / Dental)</option>
              <option value="DCET">DCET (Diploma Lateral Entry)</option>
              <option value="PGCET">PGCET (MBA / MCA / M.Tech)</option>
              <option value="OTHER">Other Admissions</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition capitalize"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Official Portal Link</label>
            <input
              type="url"
              value={officialLink}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOfficialLink(e.target.value)}
              placeholder="https://cetonline.karnataka.gov.in/kea/"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Overview / Instructions</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Brief summary of eligibility and seat matrix announcements..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Important Advisory Notes</label>
            <textarea
              rows={3}
              value={importantNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportantNotes(e.target.value)}
              placeholder="Important notes, verification center documents, or caution points for candidates..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>
        </div>
      </div>
    </form>
  );
}