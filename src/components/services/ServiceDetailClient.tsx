'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Service } from '@/lib/types';
import { BUSINESS_INFO } from '@/lib/constants';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  PhoneCall, 
  FileText, 
  Sparkles,
  ZoomIn
} from 'lucide-react';

export default function ServiceDetailClient({ service }: { service: Service }) {
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  const mandatoryDocs = (service.required_documents || [])
    .filter((d) => d.is_mandatory)
    .sort((a, b) => a.display_order - b.display_order);

  const optionalDocs = (service.required_documents || [])
    .filter((d) => !d.is_mandatory)
    .sort((a, b) => a.display_order - b.display_order);

  const handleWhatsAppInquiry = () => {
    const docList = mandatoryDocs.map((d, i) => `${i + 1}. ${d.document_name}`).join('\n');
    const text = `*Sparsha Cyber Cafe - Document Pre-Verification*\n\n` +
      `📋 *Service:* ${service.name}\n` +
      `📍 *Branch:* Aland Center\n\n` +
      `*Required Checklist:*\n${docList || '• Standard verification documents'}\n\n` +
      `Hello, I am sending photos of my documents for preliminary eligibility check before coming to the cafe.`;

    window.open(`https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Services
          </Link>
          <span className="text-xs font-extrabold uppercase tracking-wide text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {service.categories?.name?.split('/')[0] || 'Government Scheme'}
          </span>
        </div>

        {/* Title Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {service.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {service.full_description || service.short_description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleWhatsAppInquiry}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Send Docs on WhatsApp
            </button>
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-slate-600" /> Desk Helpline
            </a>
          </div>
        </div>

        {/* Posters & Flyers Gallery */}
        {service.service_images && service.service_images.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Official Notification Posters & Flyers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {service.service_images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setActiveLightboxImage(img.image_url)}
                  className="group relative h-56 rounded-2xl overflow-hidden border border-slate-200 bg-white cursor-pointer shadow-sm hover:shadow-md transition"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <ZoomIn className="w-5 h-5" /> Click to View Circular
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mandatory Documents */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Mandatory Documents ({mandatoryDocs.length})
              </h3>
            </div>

            {mandatoryDocs.length > 0 ? (
              <ul className="space-y-3">
                {mandatoryDocs.map((doc, idx) => (
                  <li key={doc.id} className="flex items-start gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-slate-800">{doc.document_name}</p>
                      {doc.description && (
                        <p className="text-slate-500 text-[11px] mt-0.5">{doc.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Basic identification documents required.</p>
            )}
          </div>

          {/* Optional / Quota Documents */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Reservation & Optional Documents ({optionalDocs.length})
              </h3>
            </div>

            {optionalDocs.length > 0 ? (
              <ul className="space-y-3">
                {optionalDocs.map((doc, idx) => (
                  <li key={doc.id} className="flex items-start gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-slate-800">{doc.document_name}</p>
                      {doc.description && (
                        <p className="text-slate-500 text-[11px] mt-0.5">{doc.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500">
                No extra reservation certificates required for standard submission.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <ImageLightbox
          isOpen={!!activeLightboxImage}
          imageUrl={activeLightboxImage}
          altText={service.name}
          onClose={() => setActiveLightboxImage(null)}
        />
      )}
    </div>
  );
}