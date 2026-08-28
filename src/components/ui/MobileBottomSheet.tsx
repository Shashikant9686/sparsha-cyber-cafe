'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, X, FileText, Landmark, GraduationCap, MapPin, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export default function MobileBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button (Mobile Only) */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="fixed bottom-6 left-6 z-40 md:hidden flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl active:scale-95 transition-transform"
        aria-label="Open quick navigation"
      >
        <Layers className="h-4 w-4" />
        <span>Quick Menu</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-6 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Direct Services Access</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Link
            href="/services"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 active:bg-blue-50 active:text-blue-600 transition"
          >
            <FileText className="h-4 w-4 text-blue-600 shrink-0" />
            <span>371(J) Quota</span>
          </Link>

          <Link
            href="/services"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 active:bg-blue-50 active:text-blue-600 transition"
          >
            <Landmark className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Bhoomi RTC</span>
          </Link>

          <Link
            href="/counselling"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 active:bg-blue-50 active:text-blue-600 transition"
          >
            <GraduationCap className="h-4 w-4 text-purple-600 shrink-0" />
            <span>KCET / NEET</span>
          </Link>

          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 active:bg-blue-50 active:text-blue-600 transition"
          >
            <MapPin className="h-4 w-4 text-rose-600 shrink-0" />
            <span>Center Location</span>
          </Link>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100">
          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Sparsha%20Online%20Center,%20I%20need%20quick%20help.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm active:scale-98 transition"
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp Direct Helpline</span>
          </a>
        </div>
      </div>
    </>
  );
}