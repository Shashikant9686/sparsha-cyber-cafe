'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Share2, 
  CheckSquare, 
  FileText, 
  Layers, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { ServiceDetailData, RequiredDocument } from '@/lib/types';
import { BUSINESS_INFO } from '@/lib/constants';
import ShareButton from '@/components/ShareButton';

interface ServiceDetailProps {
  service: ServiceDetailData;
}

export default function ServiceDetailClient({ service }: ServiceDetailProps) {

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h1 className="text-xl font-bold text-slate-900">Service Not Available</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Unable to load the requested service details.</p>
        <Link 
          href="/services" 
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition"
        >
          Browse All Services
        </Link>
      </div>
    );
  }

  const docs = Array.isArray(service.required_documents) ? service.required_documents : [];
  const related = Array.isArray(service.relatedServices) ? service.relatedServices : [];

  let faqs: Array<{ question: string; answer: string }> = [];
  if (Array.isArray(service.faq)) {
    faqs = service.faq as Array<{ question: string; answer: string }>;
  } else if (typeof service.faq === 'string') {
    try {
      faqs = JSON.parse(service.faq);
    } catch {
      faqs = [];
    }
  }

  const stepsList = typeof service.steps === 'string'
    ? service.steps.split('\n').filter((s: string) => s.trim().length > 0)
    : [];

  const totalFee = (Number(service.fee) || 0) + (Number(service.service_charge) || 0);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </Link>

          <div className="flex items-center gap-2">
            {service.categories?.name && (
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                {service.categories.name}
              </span>
            )}
            <ShareButton title={service.name} />
          </div>
        </div>

        {/* Header Hero */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {service.name}
            </h1>
            {service.submission_method && (
              <p className="text-xs font-medium text-slate-500">
                Channel: <span className="text-slate-800 font-bold">{service.submission_method}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3.5">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Processing Time</p>
                <p className="text-sm font-extrabold text-slate-800">
                  {service.processing_time || '7 - 15 Days'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3.5">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Charges</p>
                <p className="text-sm font-extrabold text-slate-800">
                  {totalFee > 0 ? `₹${totalFee}` : 'Free / Direct Govt Fee'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3.5">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Documents Required</p>
                <p className="text-sm font-extrabold text-slate-800">
                  {docs.length} Items Listed
                </p>
              </div>
            </div>
          </div>

          {(service.fee != null || service.service_charge != null) && (
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-700 font-medium">
                {service.fee != null && (
                  <span>Government Official Fee: <strong className="text-slate-900">₹{service.fee}</strong></span>
                )}
                {service.fee != null && service.service_charge != null && (
                  <span>•</span>
                )}
                {service.service_charge != null && (
                  <span>Center Service Fee: <strong className="text-slate-900">₹{service.service_charge}</strong></span>
                )}
              </div>
            </div>
          )}

          <div className="pt-2">
          <a href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(`Hello, I need more information about: ${service.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition shadow-sm cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Contact / WhatsApp for More Information</span>
            </a>
          </div>
        </div>
        {/* Required Documents Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg">Required Documents Checklist</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {docs.map((doc: RequiredDocument, index: number) => (
              <div key={doc.id || index} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {doc.document_name || 'Document'}
                    </p>
                    {doc.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                  doc.is_mandatory !== false ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-600'
                }`}>
                  {doc.is_mandatory !== false ? 'Mandatory' : 'Optional'}
                </span>
              </div>
            ))}

            {docs.length === 0 && (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Standard ID & address proof required. Visit our Sparsha Online Center desk for direct assistance.
              </p>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        {service.prerequisites && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg">Eligibility & Prerequisites</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {service.prerequisites}
            </p>
          </div>
        )}

        {/* Sample Images / Posters */}
        {Array.isArray(service.service_images) && service.service_images.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Sample Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {service.service_images.map((img) => (
                <div key={img.id} className="rounded-xl overflow-hidden border border-slate-200 aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.alt_text || service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Procedure Steps */}
        {stepsList.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Application Procedure</h2>
            <div className="space-y-3">
              {stepsList.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-700">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed pt-0.5">{step.replace(/^\d+\.\s*/, '')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-3.5 space-y-1">
                  <p className="text-xs font-bold text-slate-800">{faq.question}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Services */}
        {related.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-slate-800">Related Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/services/${rel.slug}`}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xs transition flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{rel.name}</span>
                  {rel.fee != null && (
                    <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-2">
                      ₹{rel.fee}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}