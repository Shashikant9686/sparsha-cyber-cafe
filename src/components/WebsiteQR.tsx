'use client';

import React from 'react';
import { QrCode, Download } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export default function WebsiteQR() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sparsha-cyber-cafe.vercel.app';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(siteUrl)}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'sparsha-counter-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center space-y-3 w-60 shadow-xl mx-auto md:mx-0">
      <div className="flex items-center justify-center gap-2 text-slate-100 font-bold text-xs">
        <QrCode className="w-4 h-4 text-blue-400" />
        <span>Scan {BUSINESS_INFO.shortName}</span>
      </div>

      <div className="bg-white p-2.5 rounded-2xl inline-block shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImageUrl}
          alt={`${BUSINESS_INFO.name} QR Code`}
          width={150}
          height={150}
          className="rounded-lg block"
        />
      </div>

      <p className="text-[11px] text-slate-400 leading-tight">
        Scan with your mobile camera to access online seva & checklists.
      </p>

      <button
        type="button"
        onClick={handleDownload}
        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download QR Card</span>
      </button>
    </div>
  );
}