'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { extractStoragePath } from '@/lib/storage-utils';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  GripVertical, 
  AlertCircle,
  FileText,
  DollarSign,
  ListOrdered,
  HelpCircle,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import ImageUploader from './ImageUploader';

interface CategoryOption {
  id: string;
  name: string;
}

export interface DocumentItem {
  id?: string;
  document_name: string;
  is_mandatory: boolean;
  notes?: string;
  display_order: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceImageItem {
  id?: string;
  image_url: string;
  caption?: string;
  display_order: number;
}

export interface ServiceFormData {
  id?: string;
  name: string;
  slug: string;
  category_id?: string | null;
  submission_method?: string | null;
  fee?: number | null;
  service_charge?: number | null;
  processing_time?: string | null;
  prerequisites?: string | null;
  steps?: string | null;
  faq?: FAQItem[] | null;
  status: 'active' | 'inactive' | 'draft' | string;
  required_documents?: DocumentItem[];
  service_images?: ServiceImageItem[];
}

interface ServiceFormProps {
  initialData?: ServiceFormData | null;
  serviceId?: string;
}

export default function ServiceForm({ initialData, serviceId }: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'docs' | 'steps' | 'faq' | 'images'>('basic');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Basic Information State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [submissionMethod, setSubmissionMethod] = useState(initialData?.submission_method || 'Online Application / Seva Sindhu');
  const [estimatedDays, setEstimatedDays] = useState(initialData?.processing_time || '7 to 15 working days');
  const [status, setStatus] = useState(initialData?.status?.toLowerCase() || 'active');

  // 2. Pricing State
  const [fee, setFee] = useState<string | number>(initialData?.fee ?? '');
  const [serviceCharge, setServiceCharge] = useState<string | number>(initialData?.service_charge ?? '');

  // 3. Prerequisites & Steps
  const [prerequisites, setPrerequisites] = useState(initialData?.prerequisites || '');
  const [steps, setSteps] = useState(initialData?.steps || '');

  // 4. Dynamic Required Documents List
  const [docs, setDocs] = useState<DocumentItem[]>(
    initialData?.required_documents && initialData.required_documents.length > 0
      ? initialData.required_documents.map((d, index) => ({
          id: d.id,
          document_name: d.document_name || '',
          is_mandatory: d.is_mandatory ?? true,
          notes: d.notes || '',
          display_order: d.display_order ?? index + 1
        }))
      : [
          { document_name: 'Aadhaar Card', is_mandatory: true, notes: 'Original or clear Xerox', display_order: 1 },
          { document_name: 'Ration Card / Address Proof', is_mandatory: true, notes: '', display_order: 2 }
        ]
  );

  // 5. Dynamic FAQs List
  const [faqs, setFaqs] = useState<FAQItem[]>(
    Array.isArray(initialData?.faq) && initialData.faq.length > 0
      ? initialData.faq
      : [
          { question: 'What is the standard processing time?', answer: 'Applications typically take 7 to 15 working days depending on tahsil office clearance.' }
        ]
  );

  // 6. Dynamic Images Gallery List
  const [images, setImages] = useState<ServiceImageItem[]>(
    initialData?.service_images && initialData.service_images.length > 0
      ? initialData.service_images
      : []
  );

  // Load Categories Dropdown
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('display_order', { ascending: true });
      if (data) setCategories(data);
    }
    loadCategories();
  }, [supabase]);

  // Automatic Slug Generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!serviceId && (!slug || slug === '')) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  // Checklist Helpers
  const addDocItem = () => {
    setDocs((prev) => [
      ...prev,
      {
        document_name: '',
        is_mandatory: true,
        notes: '',
        display_order: prev.length + 1
      }
    ]);
  };

  const updateDocItem = (index: number, field: keyof DocumentItem, value: unknown) => {
    setDocs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeDocItem = (index: number) => {
    setDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // FAQ Helpers
  const addFaqItem = () => {
    setFaqs((prev) => [...prev, { question: '', answer: '' }]);
  };

  const updateFaqItem = (index: number, field: keyof FAQItem, value: string) => {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeFaqItem = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  // Image Helpers


  const updateImageItem = (index: number, field: keyof ServiceImageItem, value: unknown) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeImageItem = async (index: number) => {
    const target = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));

    if (target?.image_url) {
      const path = extractStoragePath(target.image_url, 'service-images');
      if (path) {
        const { error } = await supabase.storage.from('service-images').remove([path]);
        if (error) {
          console.error('Failed to remove storage file (non-blocking):', error);
        }
      }
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Service name is required');
      setActiveTab('basic');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('URL slug is required');
      setActiveTab('basic');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const cleanFaqs = faqs.filter((f) => f.question.trim() !== '' && f.answer.trim() !== '');

      const servicePayload = {
        name: name.trim(),
        slug: slug.trim(),
        category_id: categoryId || null,
        submission_method: submissionMethod.trim() || null,
        fee: fee === '' ? null : Number(fee),
        service_charge: serviceCharge === '' ? null : Number(serviceCharge),
        processing_time: estimatedDays.trim() || null,
        prerequisites: prerequisites.trim() || null,
        steps: steps.trim() || null,
        faq: cleanFaqs.length > 0 ? cleanFaqs : null,
        status: status.toLowerCase(),
        updated_at: new Date().toISOString()
      };

      let activeServiceId = serviceId;

      if (activeServiceId) {
        const { error } = await supabase
          .from('services')
          .update(servicePayload)
          .eq('id', activeServiceId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert([servicePayload])
          .select()
          .single();

        if (error) throw error;
        activeServiceId = data.id;
      }

      if (activeServiceId) {
        // 1. Sync required_documents table
        await supabase
          .from('required_documents')
          .delete()
          .eq('service_id', activeServiceId);

        const validDocs = docs
          .filter((d) => d.document_name.trim() !== '')
          .map((d, index) => ({
            service_id: activeServiceId,
            document_name: d.document_name.trim(),
            is_mandatory: Boolean(d.is_mandatory),
            description: d.notes?.trim() || null,
            display_order: index + 1
          }));

        if (validDocs.length > 0) {
          const { error: docError } = await supabase
            .from('required_documents')
            .insert(validDocs);

          if (docError) console.error('Error inserting documents:', docError);
        }

        // 2. Sync service_images table
        await supabase
          .from('service_images')
          .delete()
          .eq('service_id', activeServiceId);

        const validImages = images
          .filter((img) => img.image_url.trim() !== '')
          .map((img, index) => ({
            service_id: activeServiceId,
            image_url: img.image_url.trim(),
            alt_text: img.caption?.trim() || null,
            image_type: 'service',
            display_order: index + 1
          }));

        if (validImages.length > 0) {
          const { error: imgError } = await supabase
            .from('service_images')
            .insert(validImages);

          if (imgError) console.error('Error inserting images:', imgError);
        }
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err: unknown) {
      console.error('Failed to save service:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {serviceId ? 'Edit Service' : 'Add New Service'}
            </h1>
            <p className="text-xs text-slate-500">
              Configure pricing, WhatsApp checklist documents, steps, and FAQs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/services"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{serviceId ? 'Save Changes' : 'Publish Service'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'basic' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. General Info</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'pricing' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>2. Pricing & Timelines</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'docs' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Required Documents ({docs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'steps' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>4. Eligibility & Steps</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'faq' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>5. FAQs ({faqs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'images' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>6. Images ({images.length})</span>
        </button>
      </div>

      {/* Tab 1: General Info */}
      {activeTab === 'basic' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">General Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Service Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Karnataka 371(J) Regional Reservation Certificate"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. karnataka-371-j-regional-reservation-certificate"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Submission Method / Channel</label>
              <input
                type="text"
                value={submissionMethod}
                onChange={(e) => setSubmissionMethod(e.target.value)}
                placeholder="e.g. Seva Sindhu Portal / Tahsildar Verification"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              >
                <option value="active">Active (Visible to public)</option>
                <option value="inactive">Inactive (Hidden)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing & Timelines */}
      {activeTab === 'pricing' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pricing & Time Estimates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Govt Official Fee (₹)</label>
              <input
                type="number"
                step="any"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
              <p className="text-[10px] text-slate-400">Direct statutory government portal fee</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Cyber Cafe Service Fee (₹)</label>
              <input
                type="number"
                step="any"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
              <p className="text-[10px] text-slate-400">Application filing and scanning charges</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Estimated Processing Time</label>
              <input
                type="text"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="e.g. 7 to 15 working days"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
              <p className="text-[10px] text-slate-400">Expected turnaround time</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Required Documents Checklist */}
      {activeTab === 'docs' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Required Documents Checklist
              </h2>
              <p className="text-xs text-slate-500">
                These documents will populate the instant WhatsApp shareable checklist for customers
              </p>
            </div>
            <button
              type="button"
              onClick={addDocItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {docs.map((docItem, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl"
              >
                <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Document Name (e.g. 1st to 10th Study Certificate)"
                    value={docItem.document_name}
                    onChange={(e) => updateDocItem(idx, 'document_name', e.target.value)}
                    className="sm:col-span-6 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Notes (e.g. BEO Counter-signed original)"
                    value={docItem.notes || ''}
                    onChange={(e) => updateDocItem(idx, 'notes', e.target.value)}
                    className="sm:col-span-4 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                  <label className="sm:col-span-2 flex items-center gap-1.5 text-xs text-slate-700 font-bold px-2 py-1">
                    <input
                      type="checkbox"
                      checked={docItem.is_mandatory}
                      onChange={(e) => updateDocItem(idx, 'is_mandatory', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span>Mandatory</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocItem(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {docs.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No documents added yet. Click &quot;Add Document&quot; above.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Eligibility & Steps */}
      {activeTab === 'steps' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Eligibility & Procedures</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Prerequisites / Eligibility Criteria</label>
              <textarea
                rows={4}
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="Detail who qualifies for this service (e.g. 10 years continuous schooling in Hyderabad-Karnataka region)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Step-by-Step Procedure</label>
              <textarea
                rows={4}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="1. Document verification at Sparsha Cyber Cafe.&#10;2. Online application submission on Seva Sindhu.&#10;3. Field verification by Revenue Inspector.&#10;4. Certificate issuance."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Dynamic FAQs */}
      {activeTab === 'faq' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Frequently Asked Questions</h2>
              <p className="text-xs text-slate-500">Provide direct answers to common customer inquiries</p>
            </div>
            <button
              type="button"
              onClick={addFaqItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Question #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeFaqItem(idx)}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Can I apply if I lost my original marks card?"
                  value={faq.question}
                  onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
                <textarea
                  rows={2}
                  placeholder="Answer..."
                  value={faq.answer}
                  onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            ))}

            {faqs.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No FAQs defined. Click &quot;Add FAQ&quot; to provide helpful tips.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Images Gallery */}
      {activeTab === 'images' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Attached Images & Samples</h2>
              <p className="text-xs text-slate-500">Provide sample certificate formats or illustrative screenshots</p>
            </div>
          </div>

          <ImageUploader
            bucketName="service-images"
            folderPath="services"
            onUploadSuccess={(uploaded) => {
              setImages((prev) => [...prev, { image_url: uploaded.url, caption: '', display_order: prev.length + 1 }]);
            }}
          />

          <div className="space-y-3 pt-2">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    placeholder="Image URL (e.g. Supabase Storage URL)"
                    value={img.image_url}
                    onChange={(e) => updateImageItem(idx, 'image_url', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Caption / Description (Optional)"
                    value={img.caption || ''}
                    onChange={(e) => updateImageItem(idx, 'caption', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImageItem(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {images.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No images attached. Click &quot;Add Image&quot; to upload samples.
              </p>
            )}
          </div>
        </div>
      )}
    </form>
  );
}