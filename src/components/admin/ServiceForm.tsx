'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DynamicDocumentList from '@/components/DynamicDocumentList';
import { Save, ArrowLeft, Loader2, IndianRupee, Tag } from 'lucide-react';
import Link from 'next/link';

interface ServiceFormProps {
  initialServiceId?: string;
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    category: string;
    short_description: string;
    full_description: string;
    official_fee: string;
    service_charge: string;
    processing_time: string;
    required_documents: string[];
    is_featured: boolean;
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

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'Government & Certificate Services');
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '');
  const [fullDescription, setFullDescription] = useState(initialData?.full_description || '');
  const [officialFee, setOfficialFee] = useState(initialData?.official_fee || '₹40');
  const [serviceCharge, setServiceCharge] = useState(initialData?.service_charge || '₹50');
  const [processingTime, setProcessingTime] = useState(initialData?.processing_time || '3 to 7 Working Days');
  const [documents, setDocuments] = useState<string[]>(
    initialData?.required_documents || [
      'Aadhaar Card (Applicant & Parent)',
      'Active Mobile Number for OTP',
      'Passport Size Photo',
    ]
  );
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
          setOfficialFee(data.official_fee || '₹40');
          setServiceCharge(data.service_charge || '₹50');
          setProcessingTime(data.processing_time || '3 to 7 Working Days');
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
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const targetId = initialServiceId || initialData?.id;

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-'),
      category,
      short_description: shortDescription,
      full_description: fullDescription,
      official_fee: officialFee,
      service_charge: serviceCharge,
      processing_time: processingTime,
      required_documents: documents,
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      if (targetId) {
        const { error } = await supabase.from('services').update(payload).eq('id', targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert([payload]);
        if (error) throw error;
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err: unknown) {
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

      {/* Main Info Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-900">Service Core Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Service Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleAutoSlug(e.target.value)}
              placeholder="e.g. Karnataka 371(J) Regional Quota Certificate"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">URL Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. 371j-regional-certificate"
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Estimated Processing Time</label>
            <input
              type="text"
              value={processingTime}
              onChange={(e) => setProcessingTime(e.target.value)}
              placeholder="e.g. Instant / 3 to 7 Working Days"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Short Tagline / Overview</label>
          <input
            type="text"
            required
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief 1-sentence description..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Detailed Guidelines & Rules</label>
          <textarea
            rows={4}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Full explanation of eligibility rules..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Fee Breakdown Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          Transparent Pricing Structure
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Official Government Fee</label>
            <input
              type="text"
              value={officialFee}
              onChange={(e) => setOfficialFee(e.target.value)}
              placeholder="e.g. ₹40 or ₹0 (Free Portal)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Cafe Operator Service Fee</label>
            <input
              type="text"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              placeholder="e.g. ₹50 (Scanning & Online Submission)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Documents Checklist Builder */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Mandatory Document Checklist Builder</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            These documents will appear on the public seva page and directly generate the customer's WhatsApp checklist.
          </p>
        </div>

        <DynamicDocumentList documents={documents} onChange={setDocuments} />
      </div>
    </form>
  );
}