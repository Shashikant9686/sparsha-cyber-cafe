'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Phone, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import WhatsAppChecklistModal from '@/components/WhatsAppChecklistModal';
import { BUSINESS_INFO } from '@/lib/constants';

interface ServiceDetailProps {
  params: { slug: string };
}

export default function ServiceDetailPage({ params }: ServiceDetailProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Mock service details or replace with dynamic Supabase fetch
  const service = {
    title: 'Karnataka 371(J) Regional Reservation Certificate / 371(ಜ) ಪ್ರಮಾಣ ಪತ್ರ',
    category: 'Government & Certificate Services',
    description: 'Hyderabad-Karnataka (Kalyana-Karnataka) regional reservation eligibility certificate for educational admissions (KCET/NEET) and government job quotas under Article 371(J).',
    govtFee: '₹40 (Nadakacheri / Seva Sindhu Government Fee)',
    processingTime: '7 to 15 Working Days',
    documents: [
      'Aadhaar Card (Applicant & Parent)',
      '1st to 10th Cumulative Study Certificate (countersigned by BEO)',
      'Ration Card / Voter ID copy',
      'Residential / Domicile Certificate or 10 years Residence Proof in HK Region',
      'Passport size photograph',
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Services</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
          {service.category}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {service.title}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {service.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Processing Time</span>
              <span className="text-xs font-bold text-slate-800">{service.processingTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Official Fee</span>
              <span className="text-xs font-bold text-slate-800">{service.govtFee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Mandatory Documents Checklist</h2>
        </div>

        <ul className="space-y-3">
          {service.documents.map((doc, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-800">{doc}</span>
            </li>
          ))}
        </ul>

        {/* WhatsApp Fast Action Box */}
        <div className="p-6 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-emerald-900 block">Need documents checked before applying?</span>
            <p className="text-[11px] text-emerald-700">
              Send your soft copies directly to the Sparsha operator desk for rapid review.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Checklist on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Modal Instance */}
      <WhatsAppChecklistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceTitle={service.title}
        defaultDocuments={service.documents}
      />
    </div>
  );
}