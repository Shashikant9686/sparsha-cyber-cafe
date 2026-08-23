'use client';

import React, { useState } from 'react';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import WhatsAppChecklistModal from '@/components/WhatsAppChecklistModal';
import type { RequiredDocument } from '@/lib/types';

interface ServiceChecklistSectionProps {
  serviceName: string;
  documents: RequiredDocument[];
}

export default function ServiceChecklistSection({
  serviceName,
  documents,
}: ServiceChecklistSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sortedDocs = [...documents].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Required Documents Checklist</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep originals and photocopies ready before visiting our cafe.
          </p>
        </div>

        {sortedDocs.length > 0 && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send to WhatsApp</span>
          </button>
        )}
      </div>

      {sortedDocs.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
          No specific documents listed for this service. Visit our counter for assistance.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {sortedDocs.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">{doc.document_name}</div>
                {doc.description && (
                  <p className="text-[11px] text-slate-500 leading-normal">{doc.description}</p>
                )}
                {doc.is_mandatory && (
                  <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md mt-1">
                    Mandatory
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <WhatsAppChecklistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceName={serviceName}
        documents={sortedDocs}
      />
    </div>
  );
}