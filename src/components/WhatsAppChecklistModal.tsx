'use client';

import React, { useState } from 'react';
import { X, Send, FileCheck, Phone, CheckCircle2, User, MapPin } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

interface WhatsAppChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle?: string;
  defaultDocuments?: string[];
}

export default function WhatsAppChecklistModal({
  isOpen,
  onClose,
  serviceTitle = 'Online Application / Seva',
  defaultDocuments = [
    'Aadhaar Card copy',
    'Passport Size Photograph',
    'Active Mobile Number for OTP',
    'Marks Card / Previous Certificate',
  ],
}: WhatsAppChecklistModalProps) {
  const [applicantName, setApplicantName] = useState('');
  const [applicantVillage, setApplicantVillage] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>(defaultDocuments);

  if (!isOpen) return null;

  const toggleDoc = (doc: string) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDocsList = selectedDocs.map((d, idx) => `${idx + 1}. ${d}`).join('\n');
    
    const message = 
`*SPARSHA CYBER CAFE - ONLINE APPLICATION INQUIRY*
---------------------------------------
*Service:* ${serviceTitle}
*Applicant Name:* ${applicantName || 'Not specified'}
*Village/Town:* ${applicantVillage || 'Aland Taluk'}

*Documents Ready for Verification:*
${formattedDocsList}

---------------------------------------
_Sir, please verify these documents and let me know the processing time and fees._`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">WhatsApp Document Assistant</h3>
              <p className="text-[11px] text-emerald-100 font-medium">Fast pre-verification by Sparsha operator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSendWhatsApp} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800">
              <span className="font-bold block">Selected Service:</span>
              <p className="text-[11px] font-semibold text-emerald-900 mt-0.5">{serviceTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Your Name</span>
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Village / City</span>
              </label>
              <input
                type="text"
                value={applicantVillage}
                onChange={(e) => setApplicantVillage(e.target.value)}
                placeholder="e.g. Aland / Madan Hipparga"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Checklist Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              Required Documents Checklist
            </label>
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 max-h-48 overflow-y-auto">
              {defaultDocuments.map((doc) => {
                const isChecked = selectedDocs.includes(doc);
                return (
                  <label
                    key={doc}
                    className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDoc(doc)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className={isChecked ? 'font-medium text-slate-900' : 'text-slate-500 line-through'}>
                      {doc}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Uncheck any document you don't have yet so our operator can advise you on alternatives.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Checklist via WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}