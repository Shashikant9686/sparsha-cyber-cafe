'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  GripVertical,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface RequiredDocument {
  id?: string;
  document_name: string;
  is_mandatory: boolean;
  description: string;
  display_order: number;
}

interface ServiceImage {
  id?: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

interface ServiceData {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  short_description?: string | null;
  full_description?: string | null;
  fee?: number | null;
  service_charge?: number | null;
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  submission_method?: string | null;
  official_link?: string | null;
  custom_disclaimer?: string | null;
  start_date?: string | null;
  last_date?: string | null;
  processing_time?: string | null;
}

interface ServiceFormProps {
  initialData?: ServiceData | null;
  serviceId?: string;
}

export default function ServiceForm({ initialData, serviceId }: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Canonical form states
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || '');
  const [fullDesc, setFullDesc] = useState(initialData?.full_description || '');
  const [fee, setFee] = useState<string>(initialData?.fee != null ? String(initialData.fee) : '');
  const [serviceCharge, setServiceCharge] = useState<string>(initialData?.service_charge != null ? String(initialData.service_charge) : '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>(initialData?.status || 'active');
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);
  const [submissionMethod, setSubmissionMethod] = useState<string>(initialData?.submission_method || 'Online');
  const [officialLink, setOfficialLink] = useState(initialData?.official_link || '');
  const [customDisclaimer, setCustomDisclaimer] = useState(initialData?.custom_disclaimer || '');
  const [startDate, setStartDate] = useState(initialData?.start_date ? initialData.start_date.substring(0, 10) : '');
  const [lastDate, setLastDate] = useState(initialData?.last_date ? initialData.last_date.substring(0, 10) : '');
  const [processingTime, setProcessingTime] = useState(initialData?.processing_time || '');

  // Sub-entity states
  const [documents, setDocuments] = useState<RequiredDocument[]>([]);
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    async function loadFormDependencies() {
      setFetchingCategories(true);
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
        
        if (!catError && catData) {
          setCategories(catData);
          if (!categoryId && catData.length > 0 && !initialData) {
            setCategoryId(catData[0].id);
          }
        }

        if (serviceId) {
          const { data: docData } = await supabase
            .from('required_documents')
            .select('*')
            .eq('service_id', serviceId)
            .order('display_order', { ascending: true });

          if (docData) {
            setDocuments(docData.map((d) => ({
              id: d.id,
              document_name: d.document_name,
              is_mandatory: d.is_mandatory ?? true,
              description: d.description || '',
              display_order: d.display_order || 0
            })));
          }

          const { data: imgData } = await supabase
            .from('service_images')
            .select('*')
            .eq('service_id', serviceId)
            .order('display_order', { ascending: true });

          if (imgData) {
            setImages(imgData);
          }
        }
      } catch (err: unknown) {
        console.error('Error loading form dependencies:', err);
      } finally {
        setFetchingCategories(false);
      }
    }

    loadFormDependencies();
  }, [serviceId, initialData, supabase, categoryId]);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!serviceId) {
      setSlug(generateSlug(val));
    }
  };

  const addDocument = () => {
    setDocuments((prev) => [
      ...prev,
      {
        document_name: '',
        is_mandatory: true,
        description: '',
        display_order: prev.length + 1
      }
    ]);
  };

  const updateDocument = (index: number, field: keyof RequiredDocument, value: unknown) => {
    setDocuments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
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
        {
          image_url: publicUrlData.publicUrl,
          alt_text: name || 'Service poster',
          display_order: prev.length + 1
        }
      ]);
    } catch (err: unknown) {
      console.error('Image upload failed:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Service name is required');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const canonicalPayload = {
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        category_id: categoryId || null,
        short_description: shortDesc.trim() || null,
        full_description: fullDesc.trim() || null,
        fee: fee === '' ? null : parseFloat(fee),
        service_charge: serviceCharge === '' ? null : parseFloat(serviceCharge),
        status,
        featured,
        submission_method: submissionMethod,
        official_link: officialLink.trim() || null,
        custom_disclaimer: customDisclaimer.trim() || null,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        last_date: lastDate ? new Date(lastDate).toISOString() : null,
        processing_time: processingTime.trim() || null,
        updated_at: new Date().toISOString()
      };

      let activeServiceId = serviceId;

      if (activeServiceId) {
        const { error: updateError } = await supabase
          .from('services')
          .update(canonicalPayload)
          .eq('id', activeServiceId);

        if (updateError) throw updateError;
      } else {
        const { data: newService, error: insertError } = await supabase
          .from('services')
          .insert([canonicalPayload])
          .select()
          .single();

        if (insertError) throw insertError;
        activeServiceId = newService.id;
      }

      if (activeServiceId) {
        // Sync required documents
        await supabase.from('required_documents').delete().eq('service_id', activeServiceId);
        if (documents.length > 0) {
          const docPayload = documents
            .filter((d) => d.document_name.trim() !== '')
            .map((d, index) => ({
              service_id: activeServiceId,
              document_name: d.document_name.trim(),
              is_mandatory: d.is_mandatory,
              description: d.description?.trim() || null,
              display_order: index + 1
            }));

          if (docPayload.length > 0) {
            const { error: docError } = await supabase
              .from('required_documents')
              .insert(docPayload);
            if (docError) console.error('Error inserting documents:', docError);
          }
        }

        // Sync service images
        await supabase.from('service_images').delete().eq('service_id', activeServiceId);
        if (images.length > 0) {
          const imgPayload = images.map((img, index) => ({
            service_id: activeServiceId,
            image_url: img.image_url,
            alt_text: img.alt_text || name,
            display_order: index + 1
          }));

          const { error: imgError } = await supabase
            .from('service_images')
            .insert(imgPayload);
          if (imgError) console.error('Error inserting images:', imgError);
        }
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err: unknown) {
      console.error('Error saving service:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save service');
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
            href="/admin/services"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {serviceId ? 'Edit Service' : 'Add New Service'}
            </h1>
            <p className="text-xs text-slate-500">
              Configure canonical metadata, requirements, and official fees
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{serviceId ? 'Save Changes' : 'Publish Service'}</span>
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
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">General Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Service Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Karnataka 371(J) Eligibility Certificate"
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
              placeholder="karnataka-371j-certificate"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={fetchingCategories}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Estimated Processing Time (OPTIONAL)</label>
            <input
              type="text"
              value={processingTime}
              onChange={(e) => setProcessingTime(e.target.value)}
              placeholder="e.g. 7 to 15 working days"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition capitalize"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Short Summary</label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Brief 1-sentence overview displayed on card listings"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Full Description & Details</label>
            <textarea
              rows={4}
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="Full procedural instructions and eligibility specifications..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Logistics */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Fees & Dates</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Government Fee (₹)</label>
            <input
              type="number"
              step="any"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0 or empty"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Cafe Service Charge (₹)</label>
            <input
              type="number"
              step="any"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              placeholder="0 or empty"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Submission Mode</label>
            <select
              value={submissionMethod}
              onChange={(e) => setSubmissionMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Both">Both (Online / In-Person)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Last Date</label>
            <input
              type="date"
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Official Portal Link</label>
            <input
              type="url"
              value={officialLink}
              onChange={(e) => setOfficialLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-bold text-slate-700">Important Disclaimer / Notice</label>
            <textarea
              rows={2}
              value={customDisclaimer}
              onChange={(e) => setCustomDisclaimer(e.target.value)}
              placeholder="Custom disclaimer notes, eligibility conditions, or warning banners..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 sm:col-span-2">
            <input
              type="checkbox"
              id="featured_checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="featured_checkbox" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
              Mark as Featured Service (Highlighted on Home & Top Categories)
            </label>
          </div>
        </div>
      </div>

      {/* Required Documents Checklist */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Required Documents</h2>
            <p className="text-xs text-slate-500">Add documents customers must bring for this application</p>
          </div>
          <button
            type="button"
            onClick={addDocument}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <GripVertical className="w-4 h-4 text-slate-400 mt-2.5 shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Document Name (e.g. 10 Years Study Certificate)"
                  value={doc.document_name}
                  onChange={(e) => updateDocument(idx, 'document_name', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Specifications / Instructions (Optional)"
                  value={doc.description}
                  onChange={(e) => updateDocument(idx, 'description', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:outline-hidden sm:col-span-2"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0 pt-2">
                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doc.is_mandatory}
                    onChange={(e) => updateDocument(idx, 'is_mandatory', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded-sm border-slate-300"
                  />
                  <span>Mandatory</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeDocument(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2 text-center">No required documents added yet.</p>
          )}
        </div>
      </div>

      {/* Posters & Flyers */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Flyers & Posters</h2>
            <p className="text-xs text-slate-500">Upload official notification brochures or poster previews</p>
          </div>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload Poster</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video sm:aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-rose-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}