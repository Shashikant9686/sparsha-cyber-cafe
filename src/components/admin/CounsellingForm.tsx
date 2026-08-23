'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  GripVertical, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export interface EventDateItem {
  id?: string;
  title: string;
  date_text: string;
  description: string;
  display_order: number;
}

export interface CounsellingEventFormData {
  id?: string;
  service_id?: string | null;
  exam_type: string;
  title: string;
  academic_year: string;
  description?: string | null;
  official_portal_url?: string | null;
  status: string;
  event_dates?: EventDateItem[];
}

interface CounsellingFormProps {
  initialData?: CounsellingEventFormData | null;
  eventId?: string;
}

const COMMON_EXAM_TYPES = [
  'KCET',
  'JEE Main',
  'JEE Advanced',
  'JoSAA',
  'CSAB',
  'NEET UG',
  'MCC',
  'COMEDK',
  'PGCET',
  'DCET',
  'Scholarships'
];

export default function CounsellingForm({ initialData, eventId }: CounsellingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Canonical counselling_events fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [examType, setExamType] = useState(initialData?.exam_type || 'KCET');
  const [academicYear, setAcademicYear] = useState(initialData?.academic_year || '2026-27');
  const [description, setDescription] = useState(initialData?.description || '');
  const [officialPortalUrl, setOfficialPortalUrl] = useState(initialData?.official_portal_url || '');
  const [status, setStatus] = useState(initialData?.status || 'Active');

  // Dynamic event_dates list
  const [dates, setDates] = useState<EventDateItem[]>(
    initialData?.event_dates && initialData.event_dates.length > 0
      ? initialData.event_dates.map((d, index) => ({
          id: d.id,
          title: d.title || '',
          date_text: d.date_text || '',
          description: d.description || '',
          display_order: d.display_order ?? index + 1
        }))
      : []
  );

  const addDateItem = () => {
    setDates((prev) => [
      ...prev,
      {
        title: '',
        date_text: '',
        description: '',
        display_order: prev.length + 1
      }
    ]);
  };

  const updateDateItem = (index: number, field: keyof EventDateItem, value: unknown) => {
    setDates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeDateItem = (index: number) => {
    setDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Event title is required');
      return;
    }
    if (!examType.trim()) {
      setErrorMsg('Exam type is required');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const eventPayload = {
        title: title.trim(),
        exam_type: examType.trim(),
        academic_year: academicYear.trim() || '2026-27',
        description: description.trim() || null,
        official_portal_url: officialPortalUrl.trim() || null,
        status,
        updated_at: new Date().toISOString()
      };

      let activeEventId = eventId;

      if (activeEventId) {
        const { error } = await supabase
          .from('counselling_events')
          .update(eventPayload)
          .eq('id', activeEventId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('counselling_events')
          .insert([eventPayload])
          .select()
          .single();

        if (error) throw error;
        activeEventId = data.id;
      }

      if (activeEventId) {
        // Sync event_dates: delete old ones then re-insert current list
        await supabase
          .from('event_dates')
          .delete()
          .eq('counselling_event_id', activeEventId);

        if (dates.length > 0) {
          const datePayload = dates
            .filter((d) => d.title.trim() !== '' || d.date_text.trim() !== '')
            .map((d, index) => ({
              counselling_event_id: activeEventId,
              title: d.title.trim(),
              date_text: d.date_text.trim(),
              description: d.description?.trim() || null,
              display_order: index + 1
            }));

          if (datePayload.length > 0) {
            const { error: dateError } = await supabase
              .from('event_dates')
              .insert(datePayload);

            if (dateError) console.error('Error inserting event dates:', dateError);
          }
        }
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
              Configure admissions tracking, timeline schedules, and official portals
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. KCET 2026 Engineering Option Entry & Verification"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Exam / Category Type *</label>
            <input
              type="text"
              required
              list="exam-types-list"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="Type or select exam (e.g. KCET, NEET UG)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
            <datalist id="exam-types-list">
              {COMMON_EXAM_TYPES.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026-27"
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
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Deadline Approaching">Deadline Approaching</option>
              <option value="Expired">Expired</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Official Portal URL</label>
            <input
              type="url"
              value={officialPortalUrl}
              onChange={(e) => setOfficialPortalUrl(e.target.value)}
              placeholder="https://cetonline.karnataka.gov.in/kea/"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Overview / Instructions</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full procedural instructions, rank cutoff summaries, or eligibility notes..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Important Dates Schedule */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Important Dates & Timeline
            </h2>
            <p className="text-xs text-slate-500">
              Add flexible timeline dates (e.g. &quot;15 June - 20 June&quot;, &quot;Expected in July 2026&quot;)
            </p>
          </div>
          <button
            type="button"
            onClick={addDateItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Date</span>
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {dates.map((dateItem, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl"
            >
              <GripVertical className="w-4 h-4 text-slate-400 mt-2.5 shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Event Phase (e.g. Document Verification)"
                  value={dateItem.title}
                  onChange={(e) => updateDateItem(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Date / Range (e.g. 10 Aug to 18 Aug 2026)"
                  value={dateItem.date_text}
                  onChange={(e) => updateDateItem(idx, 'date_text', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Notes (Optional, e.g. Rank 1 to 5000)"
                  value={dateItem.description}
                  onChange={(e) => updateDateItem(idx, 'description', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => removeDateItem(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {dates.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2 text-center">
              No timeline dates added yet. Click &quot;Add Date&quot; to define milestones.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}