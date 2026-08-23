'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download } from 'lucide-react';

export default function WebsiteQR() {
  const siteUrl = 'https://sparsha-cyber-cafe.vercel.app';

  const downloadQR = () => {
    const svg = document.getElementById('sparsha-qr-svg') as SVGElement | null;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 20, 20, 360, 360);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'sparsha-portal-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3 w-64">
      <div className="flex items-center justify-center gap-1.5 text-slate-800 font-bold text-xs">
        <QrCode className="w-4 h-4 text-blue-600" />
        <span>Counter QR Code</span>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl inline-block border border-slate-100">
        <QRCodeSVG
          id="sparsha-qr-svg"
          value={siteUrl}
          size={160}
          level="H"
          includeMargin={false}
        />
      </div>

      <p className="text-[10px] text-slate-400">
        Scan opens live customer portal directly.
      </p>

      <button
        type="button"
        onClick={downloadQR}
        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download Standee</span>
      </button>
    </div>
  );
}