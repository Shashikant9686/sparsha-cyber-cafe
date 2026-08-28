'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export default function WhatsAppPulseBadge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white p-3 shadow-xl animate-fade-in-up-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <MessageCircle className="h-4 w-4" />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-slate-800">Need instant help?</p>
        <p className="text-[11px] text-slate-500">Ask on WhatsApp for 371(J) / RTC</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="ml-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Close message"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}