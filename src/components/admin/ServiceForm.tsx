'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Save, 
  Loader2, 
  Trash2, 
  Plus, 
  Upload, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';
import type { Category, RequiredDocument, ServiceImage } from '@/lib/types';

interface ExtendedServiceData {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
  category_id?: string | null;
  category?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  description?: string | null;
  fee?: number | string | null;
  official_fee?: number | string | null;
  service_charge?: number | string | null;
  status?: string;
  featured?: boolean;
  is_featured?: boolean;
  submission_method?: string;
  official_link?: string | null;
  custom_disclaimer?: string | null;
  disclaimer?: string | null;
  start_date?: string | null;
  last_date?: string | null;
  required_documents?: RequiredDocument[];
  service_images?: ServiceImage[];
}

interface ServiceFormProps {
  initialData?: ExtendedServiceData;
}

function extractErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error occurred';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  
  if (typeof err === 'object') {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string') return record.message;
    if (typeof record.error_description === 'string') return record.error_description;
    if (typeof record.details === 'string') return record.details;
    if (typeof record.hint === 'string') return record.hint;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Failed with database error object';
    }
  }
  return String(err);
}

function normalizeSubmissionMethod(val?: string | null): string {
  if (!val) return 'online';
  const low = val.toLowerCase();
  if (low === 'offline' || low === 'offline counter' || low === 'offline_counter') return 'offline';
  if (low === 'both' || low === 'hybrid') return 'both';
  return 'online';
}

export default function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = Boolean(initialData?.id);

  // Form Fields mapped to database columns
  const [name, setName] = useState(initialData?.name || initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [shortDescription, setShortDescription] = useState(
    initialData?.short_description || initialData?.description || ''
  );
  const [fullDescription, setFullDescription] = useState(
    initialData?.full_description || initialData?.description || ''
  );
  const [fee, setFee] = useState<string>(
    initialData?.fee != null 
      ? String(initialData.fee) 
      : initialData?.official_fee != null 
      ? String(initialData.official_fee) 
      : ''
  );
  const [serviceCharge, setServiceCharge] = useState<string>(
    initialData?.service_charge != null ? String(initialData.service_charge) : ''
  );
  const [status, setStatus] = useState<string>(initialData?.status || 'Active');
  const [featured, setFeatured] = useState<boolean>(
    initialData?.featured ?? initialData?.is_featured ?? false
  );
  const [submissionMethod, setSubmissionMethod] = useState<string>(
    normalizeSubmissionMethod(initialData?.submission_method)
  );
  const [officialLink, setOfficialLink] = useState(initialData?.official_link || '');
  const [customDisclaimer, setCustomDisclaimer] = useState(
    initialData?.custom_disclaimer || initialData?.disclaimer || ''
  );
  const [startDate, setStartDate] = useState(
    initialData?.start_date ? initialData.start_date.split('T')[0] : ''
  );
  const [lastDate, setLastDate] = useState(
    initialData?.last_date ? initialData.last_date.split('T')[0] : ''
  );

  // Documents & Images Sub-items
  const [documents, setDocuments] = useState<Array<{ id?: string; document_name: string; is_mandatory: boolean; description?: string }>>(
    initialData?.required_documents || []
  );
  const [images, setImages] = useState<Array<{ id?: string; image_url: string; alt_text?: string }>>(
    initialData?.service_images || []
  );

  // Status & Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    }
    loadCategories();
  }, [supabase]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleAddDocument = () => {
    setDocuments((prev) => [
      ...prev,
      { document_name: '', is_mandatory: true, description: '' },
    ]);
  };

  const handleRemoveDocument = (idx: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDocumentChange = (idx: number, field: string, value: unknown) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === idx ? { ...doc, [field]: value } : doc))
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath);

      setImages((prev) => [
        ...prev,
        { image_url: publicUrlData.publicUrl, alt_text: name || 'Service poster' },
      ]);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      console.error('Image upload failed:', msg);
      setErrorMessage(msg);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDeleteService = async () => {
    if (!initialData?.id) return;
    if (!confirm(`Are you sure you want to delete "${name || initialData.name}"?`)) return;

    setDeleting(true);
    setErrorMessage(null);

    try {
      try {
        await supabase.from('required_documents').delete().eq('service_id', initialData.id);
        await supabase.from('service_images').delete().eq('service_id', initialData.id);
      } catch (cleanupErr) {
        console.warn('Subtable cleanup warning:', cleanupErr);
      }

      const { error: delError } = await supabase
        .from('services')
        .delete()
        .eq('id', initialData.id);

      if (delError) throw delError;

      router.push('/admin/services');
      router.refresh();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      console.error('Delete service error:', msg);
      setErrorMessage(msg);
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      const parsedFee = fee === '' ? null : parseFloat(fee);
      const parsedServiceCharge = serviceCharge === '' ? null : parseFloat(serviceCharge);

      const servicePayload = {
        name: name.trim(),
        title: name.trim(),
        slug: slug.trim(),
        category_id: categoryId || null,
        category: selectedCat?.name || null,
        short_description: shortDescription.trim() || null,
        description: shortDescription.trim() || fullDescription.trim() || null,
        full_description: fullDescription.trim() || null,
        fee: parsedFee,
        official_fee: parsedFee,
        service_charge: parsedServiceCharge,
        status,
        featured,
        is_featured: featured,
        submission_method: submissionMethod.toLowerCase(),
        official_link: officialLink.trim() || null,
        custom_disclaimer: customDisclaimer.trim() || null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        last_date: lastDate ? new Date(lastDate).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let serviceId = initialData?.id;

      if (isEditing && serviceId) {
        const { error: updateError } = await supabase
          .from('services')
          .update(servicePayload)
          .eq('id', serviceId);

        if (updateError) throw updateError;
      } else {
        const { data: newService, error: insertError } = await supabase
          .from('services')
          .insert(servicePayload)
          .select('id')
          .single();

        if (insertError) throw insertError;
        serviceId = newService.id;
      }

      // Sync Documents safely
      try {
        await supabase.from('required_documents').delete().eq('service_id', serviceId);
        if (documents.length > 0) {
          const docsPayload = documents
            .filter((d) => d.document_name.trim() !== '')
            .map((d, index) => ({
              service_id: serviceId,
              document_name: d.document_name.trim(),
              is_mandatory: d.is_mandatory,
              description: d.description?.trim() || null,
              display_order: index + 1,
            }));

          if (docsPayload.length > 0) {
            await supabase.from('required_documents').insert(docsPayload);
          }
        }
      } catch (docErr) {
        console.warn('Non-fatal required_documents sync notice:', docErr);
      }

      // Sync Images safely
      try {
        await supabase.from('service_images').delete().eq('service_id', serviceId);
        if (images.length > 0) {
          const imagesPayload = images.map((img, index) => ({
            service_id: serviceId,
            image_url: img.image_url,
            alt_text: img.alt_text || null,
            display_order: index + 1,
          }));

          await supabase.from('service_images').insert(imagesPayload);
        }
      } catch (imgErr) {
        console.warn('Non-fatal service_images sync notice:', imgErr);
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      console.error('Save service detailed error:', msg);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {isEditing ? `Edit: ${name || initialData?.name}` : 'Create New Service'}
            </h1>
            <p className="text-xs text-slate-500">Configure catalog details, pricing, documents, and banners.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              disabled={deleting || loading}
              onClick={handleDeleteService}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Delete Service</span>
            </button>
          )}

          <button
            type="submit"
            disabled={loading || deleting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Save Changes' : 'Create Service'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* General Information */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">General Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Service Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Caste & Income Certificate"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="caste-income-certificate"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Submission Method</label>
            <select
              value={submissionMethod}
              onChange={(e) => setSubmissionMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="online">Online</option>
              <option value="offline">Offline Counter</option>
              <option value="both">Hybrid (Online & Counter)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Short Summary</label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief overview visible on search cards..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Full Details & Instructions</label>
          <textarea
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed eligibility criteria, step-by-step instructions..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Pricing & Deadlines */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Fees & Schedule</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Government Fee (₹)</label>
            <input
              type="number"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="Leave blank if not applicable"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Cafe Operator Fee (₹)</label>
            <input
              type="number"
              step="0.01"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              placeholder="Leave blank if not applicable"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Application Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Deadline / Last Date</label>
            <input
              type="date"
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Official Portal URL</label>
            <input
              type="url"
              value={officialLink}
              onChange={(e) => setOfficialLink(e.target.value)}
              placeholder="https://sevasindhu.karnataka.gov.in"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
              Pin to Featured Section on Homepage
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Custom Disclaimer / Caution Notice</label>
          <textarea
            rows={2}
            value={customDisclaimer}
            onChange={(e) => setCustomDisclaimer(e.target.value)}
            placeholder="e.g. Ensure Aadhaar is linked to active mobile number before applying."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Required Documents Checklist
            </h2>
            <p className="text-xs text-slate-500">Items synced to visitor WhatsApp notifications.</p>
          </div>
          <button
            type="button"
            onClick={handleAddDocument}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl"
            >
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  required
                  value={doc.document_name}
                  onChange={(e) => handleDocumentChange(idx, 'document_name', e.target.value)}
                  placeholder="Document Name (e.g. 10th Marks Card)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  value={doc.description || ''}
                  onChange={(e) => handleDocumentChange(idx, 'description', e.target.value)}
                  placeholder="Note (e.g. Original + 2 Photocopies)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doc.is_mandatory}
                    onChange={(e) => handleDocumentChange(idx, 'is_mandatory', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Mandatory</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleRemoveDocument(idx)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              No documents added yet. Click &quot;Add Item&quot; to build the checklist.
            </div>
          )}
        </div>
      </div>

      {/* Service Images */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Official Posters & Notifications
            </h2>
            <p className="text-xs text-slate-500">Upload guidelines, sample formats, or scheme flyers.</p>
          </div>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition cursor-pointer">
            {uploadingImage ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Poster</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingImage}
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt={img.alt_text || 'Poster'}
                className="w-full aspect-video object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Bottom */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        {isEditing ? (
          <button
            type="button"
            disabled={deleting || loading}
            onClick={handleDeleteService}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Delete Service</span>
          </button>
        ) : <div />}

        <button
          type="submit"
          disabled={loading || deleting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isEditing ? 'Save Changes' : 'Create Service'}</span>
        </button>
      </div>
    </form>
  );
}