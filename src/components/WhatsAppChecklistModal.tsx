'use client';

import React, { useState } from 'react';
import { X, MessageSquare, CheckSquare, Loader2 } from 'lucide-react';
import type { RequiredDocument } from '@/lib/types';

interface WhatsAppChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  documents: RequiredDocument[];
}

export default function WhatsAppChecklistModal({
  isOpen,
  onClose,
  serviceName,
  documents,
}: WhatsAppChecklistModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      const docBullets = documents
        .map((d, i) => `${i + 1}. *${d.document_name}*${d.description ? ` (${d.description})` : ''}`)
        .join('\n');

      const message = `*Sparsha Cyber Cafe Document Checklist*\n\n*Service:* ${serviceName}\n\n*Required Documents:*\n${docBullets}\n\n📍 Visit our cyber cafe counter with these original documents for quick verification.`;

      const encodedMsg = encodeURIComponent(message);
      const waUrl = cleanPhone
        ? `https://wa.me/91${cleanPhone}?text=${encodedMsg}`
        : `https://wa.me/?text=${encodedMsg}`;

      window.open(waUrl, '_blank');
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not generate WhatsApp checklist');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-emerald-600">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-black text-sm text-slate-900">WhatsApp Checklist</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-800">
            Receive the required papers checklist for:
          </p>
          <p className="text-xs text-blue-600 font-semibold bg-blue-50 p-2.5 rounded-xl">
            {serviceName}
          </p>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            Included Documents ({documents.length})
          </span>
          {documents.map((doc, idx) => (
            <div key={doc.id || idx} className="flex items-center gap-2 text-xs text-slate-600">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{doc.document_name}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">WhatsApp Number (Optional)</label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl border border-slate-200">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-400">Leave blank to pick recipient in WhatsApp app.</p>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Send to WhatsApp</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}