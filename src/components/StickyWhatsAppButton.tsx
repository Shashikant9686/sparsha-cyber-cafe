'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export default function StickyWhatsAppButton() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:hidden">
      {/* Subtle Orbital Pulse Glow Layer */}
      <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 blur-sm animate-pulse-glow" />

      {/* Main Floating Button */}
      <a
        href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Sparsha%20Online%20Center,%20I%20have%20an%20application%20inquiry.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 hover:bg-emerald-700"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}