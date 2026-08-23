'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MilestoneDateItem {
  id?: string;
  milestone_title: string;
  milestone_date: string;
  display_order: number;
}

interface CounsellingFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    authority_name: string;
    academic_year: string;
    round_name: string | null;
    status: string;
    official_portal_url: string | null;
    description: string | null;
  };
  initialMilestones?: MilestoneDateItem[];
  isEditing?: boolean;
}

export default function CounsellingForm({
  initialData,
  initialMilestones = [],
  isEditing = false,
}: CounsellingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [authorityName, setAuthorityName] = useState(initialData?.authority_name || 'KEA');
  const [academicYear, setAcademicYear] = useState(initialData?.academic_year || '2026-2027');
  const [roundName, setRoundName] = useState(initialData?.round_name || 'Round 1');
  const [status, setStatus] = useState(initialData?.status || 'Active');
  const [officialPortalUrl, setOfficialPortalUrl] = useState(initialData?.official_portal_url || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const [milestones, setMilestones] = useState<MilestoneDateItem[]>(
    initialMilestones.length > 0
      ? initialMilestones
      : [{ milestone_title: 'Option Entry Starts', milestone_date: '', display_order: 1 }]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .trim()
      );
    }
  };

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { milestone_title: '', milestone_date: '', display_order: prev.length + 1 },
    ]);
  };

  const updateMilestone = (index: number, field: keyof MilestoneDateItem, value: any) => {
    setMilestones((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required.');
      setSaving(false);
      return;
    }

    try {
      const eventPayload = {
        title: title.trim(),
        slug: slug.trim(),
        authority_name: authorityName.trim(),
        academic_year: academicYear.trim(),
        round_name: roundName.trim() || null,
        status,
        official_portal_url: officialPortalUrl.trim() || null,
        description: description.trim() || null,
      };

      let targetEventId = initialData?.id;

      if (isEditing && targetEventId) {
        const { error: updateErr } = await supabase
          .from('counselling_events')
          .update(eventPayload)
          .eq('id', targetEventId);

        if (updateErr) throw updateErr;
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('counselling_events')
          .insert([eventPayload])
          .select('id')
          .single();

        if (insertErr) throw insertErr;
        targetEventId = inserted.id;
      }

      if (targetEventId) {
        await supabase.from('event_dates').delete().eq('event_id', targetEventId);

        const validMilestones = milestones
          .filter((m) => m.milestone_title.trim().length > 0 && m.milestone_date)
          .map((m, idx) => ({
            event_id: targetEventId,
            milestone_title: m.milestone_title.trim(),
            milestone_date: new Date(m.milestone_date).toISOString(),
            display_order: idx + 1,
          }));

        if (validMilestones.length > 0) {
          const { error: dateErr } = await supabase.from('event_dates').insert(validMilestones);
          if (dateErr) throw dateErr;
        }
      }

      router.push('/admin/counselling');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save counselling event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/counselling"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {isEditing ? 'Edit Counselling Event' : 'New Counselling Schedule'}
            </h1>
            <p className="text-xs text-slate-500">Track KEA, KCET, NEET, and Diploma admission dates.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. KCET Engineering Option Entry 2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="kcet-engineering-option-entry-2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Authority</label>
            <input
              type="text"
              value={authorityName}
              onChange={(e) => setAuthorityName(e.target.value)}
              placeholder="KEA / MCC / COMEDK"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-2027"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Round</label>
            <input
              type="text"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="Mock Round / Round 1 / Mop-up"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Official Portal Link</label>
          <input
            type="url"
            value={officialPortalUrl}
            onChange={(e) => setOfficialPortalUrl(e.target.value)}
            placeholder="https://cetonline.karnataka.gov.in/kea"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Description / Instructions</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Step-by-step guidance for students entering options..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Important Dates / Milestones */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Schedule & Deadlines</h2>
            <p className="text-xs text-slate-500">Key milestone dates displayed chronologically.</p>
          </div>
          <button
            type="button"
            onClick={addMilestone}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Date</span>
          </button>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
              <input
                type="text"
                placeholder="Milestone (e.g. Choice Selection Closes)"
                value={m.milestone_title}
                onChange={(e) => updateMilestone(idx, 'milestone_title', e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <input
                type="date"
                value={m.milestone_date ? m.milestone_date.split('T')[0] : ''}
                onChange={(e) => updateMilestone(idx, 'milestone_date', e.target.value)}
                className="w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => removeMilestone(idx)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}