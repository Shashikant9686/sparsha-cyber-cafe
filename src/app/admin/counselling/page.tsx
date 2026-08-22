'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Calendar,
  ExternalLink 
} from 'lucide-react';

interface DateEntry {
  id?: string;
  title: string;
  date_text: string;
}

interface CounsellingRecord {
  id: string;
  exam_type: string;
  title: string;
  academic_year: string;
  description: string | null;
  official_portal_url: string | null;
  status: string;
  event_dates?: DateEntry[];
}

export default function AdminCounsellingManager() {
  const supabase = createClient();

  const [events, setEvents] = useState<CounsellingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    exam_type: 'KCET',
    title: '',
    academic_year: '2026-27',
    description: '',
    official_portal_url: '',
    status: 'Active',
  });

  // Dynamic Event Dates
  const [dates, setDates] = useState<DateEntry[]>([
    { title: 'Document Verification', date_text: 'Open Now' },
    { title: 'Option Entry Window', date_text: 'Expected Shortly' },
  ]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('counselling_events')
        .select(`*, event_dates (*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching counselling records:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to fetch events.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addDateRow = () => {
    setDates((prev) => [...prev, { title: '', date_text: '' }]);
  };

  const removeDateRow = (index: number) => {
    setDates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDate = (index: number, field: 'title' | 'date_text', value: string) => {
    setDates((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const startEdit = (record: CounsellingRecord) => {
    setEditingId(record.id);
    setFormData({
      exam_type: record.exam_type || 'KCET',
      title: record.title || '',
      academic_year: record.academic_year || '2026-27',
      description: record.description || '',
      official_portal_url: record.official_portal_url || '',
      status: record.status || 'Active',
    });

    if (record.event_dates && record.event_dates.length > 0) {
      setDates(record.event_dates.map((d) => ({ title: d.title, date_text: d.date_text })));
    } else {
      setDates([{ title: 'Option Entry Window', date_text: 'Active' }]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      exam_type: 'KCET',
      title: '',
      academic_year: '2026-27',
      description: '',
      official_portal_url: '',
      status: 'Active',
    });
    setDates([
      { title: 'Document Verification', date_text: 'Open Now' },
      { title: 'Option Entry Window', date_text: 'Expected Shortly' },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setMessage({ type: 'error', text: 'Program/Event title is required.' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      let eventId = editingId;

      const payload = {
        exam_type: formData.exam_type,
        title: formData.title,
        academic_year: formData.academic_year,
        description: formData.description || null,
        official_portal_url: formData.official_portal_url || null,
        status: formData.status,
      };

      if (editingId) {
        const { error: updErr } = await supabase
          .from('counselling_events')
          .update(payload)
          .eq('id', editingId);

        if (updErr) throw updErr;

        await supabase.from('event_dates').delete().eq('counselling_event_id', editingId);
      } else {
        const { data: newEvt, error: insErr } = await supabase
          .from('counselling_events')
          .insert([payload])
          .select()
          .single();

        if (insErr) throw insErr;
        eventId = newEvt.id;
      }

      const validDates = dates
        .filter((d) => d.title.trim() !== '' && d.date_text.trim() !== '')
        .map((d, index) => ({
          counselling_event_id: eventId,
          title: d.title.trim(),
          date_text: d.date_text.trim(),
          display_order: index + 1,
        }));

      if (validDates.length > 0) {
        const { error: datesErr } = await supabase.from('event_dates').insert(validDates);
        if (datesErr) throw datesErr;
      }

      setMessage({
        type: 'success',
        text: editingId ? 'Counselling program updated!' : 'Counselling program published!',
      });

      resetForm();
      fetchEvents();
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save record.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete counselling schedule for "${title}"?`)) return;

    try {
      const { error } = await supabase.from('counselling_events').delete().eq('id', id);
      if (error) throw error;

      setMessage({ type: 'success', text: `Event "${title}" removed.` });
      setEvents((prev) => prev.filter((e) => e.id !== id));
      if (editingId === id) resetForm();
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Counselling & Admission Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage KCET, NEET, JEE, and DCET admission schedules, cutoff links, and option entry dates.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {editingId ? 'Edit Admission Program' : 'New Admission Program'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Exam Type *
                </label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition"
                >
                  <option value="KCET">KCET (Engineering / Farm / Pharma)</option>
                  <option value="NEET">NEET (Medical / Dental / AYUSH)</option>
                  <option value="DCET">DCET (Diploma Lateral Entry)</option>
                  <option value="JEE">JEE / JoSAA Counselling</option>
                  <option value="Other">Other Admission Scheme</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Event / Program Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KCET Option Entry & HK 371(J) Verification"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Portal Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition"
                >
                  <option value="Active">Active (Visible)</option>
                  <option value="Round 1 Active">Round 1 Active</option>
                  <option value="Round 2 Active">Round 2 Active</option>
                  <option value="Mop-up Round">Mop-up Round</option>
                  <option value="Hidden">Hidden (Draft)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Official Portal Link
                </label>
                <input
                  type="url"
                  placeholder="https://cetonline.karnataka.gov.in"
                  value={formData.official_portal_url}
                  onChange={(e) => setFormData({ ...formData, official_portal_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description / Guidance Notes
              </label>
              <textarea
                rows={2}
                placeholder="Details on document verification, study certificate countersigning, or cutoff ranks..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Key Schedule Dates
                </span>
                <button
                  type="button"
                  onClick={addDateRow}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Date
                </button>
              </div>

              <div className="space-y-2">
                {dates.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Stage (e.g. Choice Entry)"
                      value={d.title}
                      onChange={(e) => updateDate(idx, 'title', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Date (e.g. Aug 25 - 30)"
                      value={d.date_text}
                      onChange={(e) => updateDate(idx, 'date_text', e.target.value)}
                      className="w-32 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => removeDateRow(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Save Program Changes' : 'Publish to Counselling Desk'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Configured Counselling Events ({events.length})</h2>
              <span className="text-[11px] text-slate-400">Public Guidance Desk</span>
            </div>

            {loading ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                <p className="text-xs font-semibold text-slate-500">Loading counselling records...</p>
              </div>
            ) : events.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Program & Exam</th>
                      <th className="py-3 px-4">Academic Year</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded">
                              {evt.exam_type}
                            </span>
                            {evt.title}
                          </p>
                          {evt.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">{evt.description}</p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                          {evt.academic_year}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            evt.status === 'Active' || evt.status.includes('Active')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {evt.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {evt.official_portal_url && (
                              <a
                                href={evt.official_portal_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                                title="Open Official Portal"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => startEdit(evt)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                              title="Edit Event"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(evt.id, evt.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No counselling programs found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the form to schedule admission windows.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}