import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { 
  ArrowLeft, 
  Clock, 
  IndianRupee, 
  FileText, 
  ExternalLink, 
  AlertTriangle,
  MessageCircle,
  Check
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

// Helper to check for valid UUID format
function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export default async function ServiceDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);

  const supabase = await createClient();

  // 1. Fetch service by slug first
  let { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('slug', decodedSlug)
    .maybeSingle();

  // If not found by slug and param is a valid UUID, search by ID
  if (!service && isUUID(decodedSlug)) {
    const { data: serviceById, error: idError } = await supabase
      .from('services')
      .select('*')
      .eq('id', decodedSlug)
      .maybeSingle();

    if (!idError && serviceById) {
      service = serviceById;
      serviceError = null;
    }
  }

  if (serviceError) {
    console.error('Error loading service by slug:', {
      message: serviceError.message,
      details: serviceError.details,
      hint: serviceError.hint,
      code: serviceError.code,
    });
  }

  if (!service) {
    notFound();
  }

  // 2. Fetch required documents
  const { data: docs } = await supabase
    .from('required_documents')
    .select('*')
    .eq('service_id', service.id)
    .order('display_order', { ascending: true });

  // 3. Fetch images/posters
  const { data: images } = await supabase
    .from('service_images')
    .select('*')
    .eq('service_id', service.id)
    .order('display_order', { ascending: true });

  const displayName = service.name || service.title || 'Service Details';
  const displayFee = service.official_fee != null ? service.official_fee : service.fee;
  const displayDocs = docs || [];
  const displayImages = images || [];

  // Build WhatsApp share link
  const docChecklistText = displayDocs.length > 0
    ? '\n\n*Required Documents:*\n' + displayDocs.map((d: { document_name: string }, i: number) => `${i + 1}. ${d.document_name}`).join('\n')
    : '';

  const waMessage = encodeURIComponent(
    `Hello Sparsha Cyber Cafe, I would like to apply for *${displayName}*.\nCould you please guide me on the next steps?${docChecklistText}`
  );
  const waUrl = `https://wa.me/919980649686?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all services</span>
        </Link>

        {/* Main Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {service.category && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
                {service.category}
              </span>
            )}
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full capitalize">
              {service.submission_method || 'Online'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {displayName}
          </h1>

          {(service.short_description || service.description) && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {service.short_description || service.description}
            </p>
          )}

          {/* Pricing & Time Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3.5 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Govt Fee</span>
              </div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {displayFee != null ? `₹${displayFee}` : 'Free / Nil'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Cafe Service Fee</span>
              </div>
              <div className="text-base font-black text-blue-600 mt-0.5">
                {service.service_charge != null ? `₹${service.service_charge}` : 'Nominal'}
              </div>
            </div>

            {service.processing_time && (
              <div className="p-3.5 bg-slate-50 rounded-2xl col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timeline</span>
                </div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {service.processing_time}
                </div>
              </div>
            )}
          </div>

          {/* Actions: WhatsApp + Portal */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-xs transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Apply via WhatsApp Help</span>
            </a>

            {service.official_link && (
              <a
                href={service.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Custom Disclaimer Alert */}
        {(service.custom_disclaimer || service.disclaimer) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold">Important Notice:</span>
              <p className="text-amber-800 leading-relaxed">
                {service.custom_disclaimer || service.disclaimer}
              </p>
            </div>
          </div>
        )}

        {/* Required Documents Section */}
        {displayDocs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900">
                Required Documents Checklist
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {displayDocs.map((doc: { id?: string; document_name: string; is_mandatory?: boolean; description?: string }, idx: number) => (
                <div key={idx} className="py-3 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{doc.document_name}</span>
                      {doc.is_mandatory && (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 font-semibold rounded-md">
                          Mandatory
                        </span>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{doc.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Details & Instructions */}
        {service.full_description && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-base font-black text-slate-900">
              Application Details & Eligibility
            </h2>
            <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed font-medium">
              {service.full_description}
            </div>
          </div>
        )}

        {/* Uploaded Posters */}
        {displayImages.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-base font-black text-slate-900">
              Official Posters & Guidelines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayImages.map((img: { id?: string; image_url: string; alt_text?: string }, idx: number) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.alt_text || displayName}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}