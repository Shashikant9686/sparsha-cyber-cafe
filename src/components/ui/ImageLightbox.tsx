'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

export default function ImageLightbox({
  isOpen,
  imageUrl,
  altText = 'Poster preview',
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image preview"
        className="absolute top-4 right-4 p-2.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={altText}
        className="max-h-[90vh] max-w-[95vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl transition select-none"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}