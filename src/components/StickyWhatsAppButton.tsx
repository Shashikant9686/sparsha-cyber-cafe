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
    
      <a href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Sparsha%20Online%20Center,%20I%20have%20an%20application%20inquiry.`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-transform active:scale-95 sm:hidden"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}