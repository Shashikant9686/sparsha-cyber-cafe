'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DynamicDocumentList from '@/components/DynamicDocumentList';
import { Save, ArrowLeft, Loader2, IndianRupee } from 'lucide-react';
import Link from 'next/link';

interface ServiceFormProps {
  initialServiceId?: string;
  initialData?: {
    id?: string;
    title: string;
    slug?: string;
    category?: string;
    short_description?: string;
    full_description?: string;
    official_fee?: string;
    service_charge?: string;
    processing_time?: string;
    required_documents?: string[];
    is_featured?: boolean;
  };
  isEditing?: boolean;
}

export default function ServiceForm({
  initialServiceId,
  initialData,
  isEditing = false,
}: ServiceFormProps) {
  const router = useRouter();
  const [loadingInitial, setLoadingInitial] = useState(Boolean(initialServiceId && !initialData));
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states with blank defaults for optional fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'Government & Certificate Services');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [fullDescription, setFullDescription] = useState(initialData?.full_description || '');
  const [officialFee, setOfficialFee] = useState(initialData?.official_fee || '');
  const [serviceCharge, setServiceCharge] = useState(initialData?.service_charge || '');
  const [processingTime, setProcessingTime] = useState(initialData?.processing_time || '');
  const [documents, setDocuments] = useState<string[]>(initialData?.required_documents || []);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? true);

  useEffect(() => {
    async function loadExistingService() {
      if (!initialServiceId) return;
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', initialServiceId)
          .single();

        if (error) throw error;
        if (data) {
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setCategory(data.category || 'Government & Certificate Services');
          setShortDescription(data.short_description || '');
          setFullDescription(data.full_description || '');
          setOfficialFee(data.official_fee || '');
          setServiceCharge(data.service_charge || '');
          setProcessingTime(data.processing_time || '');
          setDocuments(data.required_documents || []);
          setIsFeatured(data.is_featured ?? true);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Could not fetch service details');
      } finally {
        setLoadingInitial(false);
      }
    }

    if (initialServiceId && !initialData) {
      loadExistingService();
    }
  }, [initialServiceId, initialData]);

  const handleAutoSlug = (text: string) => {
    setTitle(text);
    if (!isEditing && !initialServiceId) {
      setSlug(
        text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const targetId = initialServiceId || initialData?.id;

    const payload: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category: category || 'Government & Certificate Services',
      short_description: shortDescription.trim() || null,
      full_description: fullDescription.trim() || null,
      official_fee: officialFee.trim() || null,
      service_charge: serviceCharge.trim() || null,
      processing_time: processingTime.trim() || null,
      required_documents: documents && documents.length > 0 ? documents : [],
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      let res;
      if (targetId) {
        res = await supabase.from('services').update(payload).eq('id', targetId);
      } else {
        res = await supabase.from('services').insert([payload]);
      }

      if (res.error) {
        console.error('Supabase Error:', res.error);
        setErrorMsg(res.error.message || 'Database error occurred.');
        return;
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err: unknown) {
      console.error('Submit Catch Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save service configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading service details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services Catalog</span>
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{initialServiceId || isEditing ? 'Save Changes' : 'Create & Publish Service'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Core Service Info */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Service Core Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Service Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleAutoSlug(e.target.value)}
              placeholder="e.g. Passport Application / Ration Card Correction"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. passport-application (Auto-generated if blank)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Government & Certificate Services">Government & Certificate Services</option>
              <option value="Admission & Examination Portals">Admission & Examination Portals</option>
              <option value="Land & Revenue Services (Bhoomi)">Land & Revenue Services (Bhoomi)</option>
              <option value="Recruitment & Job Applications">Recruitment & Job Applications</option>
              <option value="Direct Printing & Xerox Solutions">Direct Printing & Xerox Solutions</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Estimated Processing Time <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              value={processingTime}
              onChange={(e) => setProcessingTime(e.target.value)}
              placeholder="Leave blank or enter (e.g. 7-15 Days)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Short Tagline / Overview <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Leave blank or enter brief overview..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Detailed Guidelines & Rules <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
          </label>
          <textarea
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Leave blank or enter eligibility rules..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Pricing Details */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          Pricing Details <span className="text-slate-400 font-normal text-xs">(Optional — can leave blank)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Official Government Fee
            </label>
            <input
              type="text"
              value={officialFee}
              onChange={(e) => setOfficialFee(e.target.value)}
              placeholder="Leave blank or enter (e.g. ₹40)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Cafe Operator Service Fee
            </label>
            <input
              type="text"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              placeholder="Leave blank or enter (e.g. ₹50)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Document Checklist Builder */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Document Checklist Builder</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add requirements or leave empty if no documents are required.
          </p>
        </div>

        <DynamicDocumentList documents={documents} onChange={setDocuments} />
      </div>
    </form>
  );
}