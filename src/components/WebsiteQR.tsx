'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download } from 'lucide-react';

export default function WebsiteQR() {
  const siteUrl = 'https://sparsha-cyber-cafe.vercel.app';

  const downloadQR = () => {
    const svg = document.getElementById('sparsha-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'sparsha-portal-qr.png';
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-xs mx-auto">
      <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-sm">
        <QrCode className="w-5 h-5 text-blue-600" />
        <span>Scan Sparsha Seva Portal</span>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl inline-block border border-slate-100">
        <QRCodeSVG
          id="sparsha-qr-svg"
          value={siteUrl}
          size={180}
          level="H"
          includeMargin={true}
        />
      </div>

      <p className="text-[11px] text-slate-500">
        Scan to view application checklists, fee lists, and WhatsApp pre-verification.
      </p>

      <button
        onClick={downloadQR}
        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span>Download QR for Counter Print</span>
      </button>
    </div>
  );
}