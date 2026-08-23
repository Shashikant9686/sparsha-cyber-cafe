'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ImageUploader from '@/components/admin/ImageUploader';
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CategoryOption {
  id: string;
  name: string;
}

interface RequiredDocItem {
  id?: string;
  document_name: string;
  description?: string;
  is_mandatory?: boolean;
  display_order: number;
}

interface ServiceFormProps {
  initialData?: {
    id?: string;
    category_id: string | null;
    name: string;
    slug: string;
    short_description: string | null;
    full_description: string | null;
    fee: number | null;
    service_charge: number | null;
    submission_method: string;
    start_date: string | null;
    last_date: string | null;
    official_link: string | null;
    status: string;
    featured: boolean;
    display_order: number;
    disclaimer: string | null;
    image_url?: string | null;
  };
  initialDocs?: RequiredDocItem[];
  isEditing?: boolean;
}

export default function ServiceForm({
  initialData,
  initialDocs = [],
  isEditing = false,
}: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State matching the database schema
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [fullDescription, setFullDescription] = useState(initialData?.full_description || '');
  const [fee, setFee] = useState<number | ''>(initialData?.fee ?? '');
  const [serviceCharge, setServiceCharge] = useState<number | ''>(initialData?.service_charge ?? '');
  const [submissionMethod, setSubmissionMethod] = useState(initialData?.submission_method || 'Online');
  const [startDate, setStartDate] = useState(initialData?.start_date || '');
  const [lastDate, setLastDate] = useState(initialData?.last_date || '');
  const [officialLink, setOfficialLink] = useState(initialData?.official_link || '');
  const [status, setStatus] = useState(initialData?.status || 'Active');
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.display_order ?? 0);
  const [disclaimer, setDisclaimer] = useState(initialData?.disclaimer || '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');

  // Documents state for the child table
  const [documents, setDocuments] = useState<RequiredDocItem[]>(
    initialDocs.length > 0
      ? initialDocs
      : [{ document_name: '', description: '', is_mandatory: true, display_order: 1 }]
  );

  // Fetch real categories from Supabase
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error: catError } = await supabase
          .from('categories')
          .select('id, name')
          .order('display_order', { ascending: true });

        if (catError) throw catError;
        setCategories(data || []);
        if (!categoryId && data && data.length > 0) {
          setCategoryId(data[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err.message);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, [supabase]);

  // Auto-generate slug from name if not editing
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
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

  const addDocField = () => {
    setDocuments((prev) => [
      ...prev,
      { document_name: '', description: '', is_mandatory: true, display_order: prev.length + 1 },
    ]);
  };

  const updateDocField = (index: number, field: keyof RequiredDocItem, value: any) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeDocField = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError('Service name and slug are mandatory.');
      setSaving(false);
      return;
    }

    try {
      // 1. Strict schema payload for `services`
      const servicePayload = {
        category_id: categoryId || null,
        name: name.trim(),
        slug: slug.trim(),
        short_description: shortDescription.trim() || null,
        full_description: fullDescription.trim() || null,
        fee: fee === '' ? null : Number(fee),
        service_charge: serviceCharge === '' ? null : Number(serviceCharge),
        submission_method: submissionMethod,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        last_date: lastDate ? new Date(lastDate).toISOString() : null,
        official_link: officialLink.trim() || null,
        status,
        featured,
        display_order: Number(displayOrder) || 0,
        disclaimer: disclaimer.trim() || null,
      };

      let targetServiceId = initialData?.id;

      if (isEditing && targetServiceId) {
        const { error: updateError } = await supabase
          .from('services')
          .update(servicePayload)
          .eq('id', targetServiceId);

        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('services')
          .insert([servicePayload])
          .select('id')
          .single();

        if (insertError) throw insertError;
        targetServiceId = inserted.id;
      }

      // 2. Persist service poster image if present in service_images child table
      if (imageUrl && targetServiceId) {
        await supabase
          .from('service_images')
          .delete()
          .eq('service_id', targetServiceId);

        await supabase.from('service_images').insert([
          {
            service_id: targetServiceId,
            image_url: imageUrl,
            caption: name.trim(),
            display_order: 1,
          },
        ]);
      }

      // 3. Synchronize Required Documents table
      if (targetServiceId) {
        await supabase
          .from('required_documents')
          .delete()
          .eq('service_id', targetServiceId);

        const validDocs = documents
          .filter((d) => d.document_name.trim().length > 0)
          .map((d, index) => ({
            service_id: targetServiceId,
            document_name: d.document_name.trim(),
            description: d.description?.trim() || null,
            is_mandatory: d.is_mandatory ?? true,
            display_order: index + 1,
          }));

        if (validDocs.length > 0) {
          const { error: docError } = await supabase
            .from('required_documents')
            .insert(validDocs);

          if (docError) throw docError;
        }
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {isEditing ? 'Edit Service' : 'Add New Service'}
            </h1>
            <p className="text-xs text-slate-500">Configure catalog information, charges, and required papers.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Service'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Basic Metadata */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">General Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Service Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. 371(J) Eligibility Certificate"
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
              placeholder="371j-eligibility-certificate"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loadingCategories}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
          <label className="text-xs font-bold text-slate-700">Short Summary</label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief 1-line description for service cards"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Full Description</label>
          <textarea
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed application procedure, requirements, and eligibility overview..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Fees, Timeline & Links */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Fees & Schedule</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Govt Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Cyber Cafe Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="50"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Submission Mode</label>
            <select
              value={submissionMethod}
              onChange={(e) => setSubmissionMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="Online">Online Portal</option>
              <option value="Offline">Offline / Physical Submission</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Start Date</label>
            <input
              type="date"
              value={startDate ? startDate.split('T')[0] : ''}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Last Date</label>
            <input
              type="date"
              value={lastDate ? lastDate.split('T')[0] : ''}
              onChange={(e) => setLastDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Official Portal URL</label>
          <input
            type="url"
            value={officialLink}
            onChange={(e) => setOfficialLink(e.target.value)}
            placeholder="https://sevasindhu.karnataka.gov.in"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
            />
            <span className="text-xs font-bold text-slate-800">Feature on Homepage</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Order:</span>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-20 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Required Document Checklist Table Sync */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Required Documents Checklist
            </h2>
            <p className="text-xs text-slate-500">
              Students and citizens will see these exact documents for WhatsApp verification.
            </p>
          </div>
          <button
            type="button"
            onClick={addDocField}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Document</span>
          </button>
        </div>

        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-400 mt-2">{idx + 1}.</span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Document Name (e.g. 1st to 10th Study Certificate)"
                  value={doc.document_name}
                  onChange={(e) => updateDocField(idx, 'document_name', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Instruction/Note (e.g. Signed by BEO)"
                  value={doc.description || ''}
                  onChange={(e) => updateDocField(idx, 'description', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => removeDocField(idx)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition mt-0.5"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Poster Upload */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Service Poster / Banner</h2>
        <ImageUploader
          bucketName="service-images"
          currentImageUrl={imageUrl}
          onUploadComplete={(url) => setImageUrl(url)}
        />
      </div>

      {/* Disclaimer / Notes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Service Disclaimer</h2>
        <textarea
          rows={2}
          value={disclaimer}
          onChange={(e) => setDisclaimer(e.target.value)}
          placeholder="e.g. Applicants must ensure their phone numbers are linked with their records."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
        />
      </div>
    </form>
  );
}