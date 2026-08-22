'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

export default function ImageLightbox({ isOpen, imageUrl, altText, onClose }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-3 text-white">
        <p className="text-xs sm:text-sm font-semibold truncate max-w-md">{altText}</p>
        <div className="flex items-center gap-3">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download
          </a>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-600 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="relative w-full max-w-4xl h-[75vh] flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={altText}
          fill
          className="object-contain rounded-2xl select-none"
          sizes="(max-width: 1024px) 100vw, 80vw"
          priority
        />
      </div>
    </div>
  );
}