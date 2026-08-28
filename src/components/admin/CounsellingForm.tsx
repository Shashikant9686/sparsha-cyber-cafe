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
  start_date: string;
  end_date: string;
  description: string;
  display_order: number;
}

export interface CounsellingEventFormData {
  id?: string;
  service_id?: string | null;
  exam_name: string;
  counselling_name: string;
  year: number;
  description?: string | null;
  official_link?: string | null;
  status: string;
  event_dates?: EventDateItem[];
}

interface CounsellingFormProps {
  initialData?: CounsellingEventFormData | null;
  eventId?: string;
}

const COMMON_EXAM_NAMES = [
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

const CURRENT_YEAR = new Date().getFullYear();

export default function CounsellingForm({ initialData, eventId }: CounsellingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Canonical counselling_events fields (matching the verified live schema)
  const [counsellingName, setCounsellingName] = useState(initialData?.counselling_name || '');
  const [examName, setExamName] = useState(initialData?.exam_name || 'KCET');
  const [year, setYear] = useState(initialData?.year ? String(initialData.year) : String(CURRENT_YEAR));
  const [description, setDescription] = useState(initialData?.description || '');
  const [officialLink, setOfficialLink] = useState(initialData?.official_link || '');
  const [status, setStatus] = useState(initialData?.status || 'Active');

  // Dynamic event_dates list (unchanged — event_dates.title is a real, correctly-named column)
  const [dates, setDates] = useState<EventDateItem[]>(
    initialData?.event_dates && initialData.event_dates.length > 0
      ? initialData.event_dates.map((d, index) => ({
          id: d.id,
          title: d.title || '',
          start_date: d.start_date ? d.start_date.slice(0, 10) : '',
          end_date: d.end_date ? d.end_date.slice(0, 10) : '',
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
        start_date: '',
        end_date: '',
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
    if (!counsellingName.trim()) {
      setErrorMsg('Counselling name is required');
      return;
    }
    if (!examName.trim()) {
      setErrorMsg('Exam name is required');
      return;
    }
    const yearNumber = parseInt(year, 10);
    if (!Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
      setErrorMsg('Please enter a valid 4-digit year (e.g. 2026)');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const eventPayload = {
        counselling_name: counsellingName.trim(),
        exam_name: examName.trim(),
        year: yearNumber,
        description: description.trim() || null,
        official_link: officialLink.trim() || null,
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
            .filter((d) => d.title.trim() !== '' || d.start_date.trim() !== '')
            .map((d, index) => ({
              counselling_event_id: activeEventId,
              title: d.title.trim(),
              start_date: d.start_date || null,
              end_date: d.end_date || null,
              description: d.description?.trim() || null,
              display_order: index + 1
            }));

          if (datePayload.length > 0) {
            const { error: dateError } = await supabase
              .from('event_dates')
              .insert(datePayload);

            if (dateError) {
              console.error('Error inserting event dates:', dateError);
              setErrorMsg(`Event saved, but timeline dates failed to save: ${dateError.message}`);
            }
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
            <label className="text-xs font-bold text-slate-700">Counselling Name *</label>
            <input
              type="text"
              required
              value={counsellingName}
              onChange={(e) => setCounsellingName(e.target.value)}
              placeholder="e.g. Engineering Option Entry & Verification"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Exam Name *</label>
            <input
              type="text"
              required
              list="exam-names-list"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Type or select exam (e.g. KCET, NEET UG)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
            <datalist id="exam-names-list">
              {COMMON_EXAM_NAMES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Year *</label>
            <input
              type="number"
              required
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={String(CURRENT_YEAR)}
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
            <label className="text-xs font-bold text-slate-700">Official Link</label>
            <input
              type="url"
              value={officialLink}
              onChange={(e) => setOfficialLink(e.target.value)}
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
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Event Phase (e.g. Document Verification)"
                  value={dateItem.title}
                  onChange={(e) => updateDateItem(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateItem.start_date}
                    onChange={(e) => updateDateItem(idx, 'start_date', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                  <input
                    type="date"
                    value={dateItem.end_date}
                    onChange={(e) => updateDateItem(idx, 'end_date', e.target.value)}
                    placeholder="End (optional)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
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