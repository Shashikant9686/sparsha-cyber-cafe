'use client';
import React, { useState } from 'react';
import { Calendar, ExternalLink, MessageCircle, Megaphone, Star } from 'lucide-react';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { BUSINESS_INFO } from '@/lib/constants';
import { getUpdateUrgency, getUrgencyBadgeClasses } from '@/lib/date-utils';
import ShareButton from '@/components/ShareButton';

interface AnnouncementImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

interface UpdateDetailClientProps {
  update: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    category: string | null;
    featured: boolean;
    start_date: string | null;
    last_date: string | null;
    official_link: string | null;
    created_at: string;
  };
  images: AnnouncementImage[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function UpdateDetailClient({ update, images }: UpdateDetailClientProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const urgency = update.last_date ? getUpdateUrgency(update.last_date) : null;

  const allImages = [
    ...(update.image_url ? [{ id: 'cover', image_url: update.image_url, alt_text: update.title }] : []),
    ...images,
  ];

  const whatsappHref = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(
    `Hello, I need more information about: ${update.title}`
  )}`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {update.featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                <Star className="w-3 h-3" />
                Featured
              </span>
            )}
            {update.category && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                {update.category}
              </span>
            )}
          </div>
          <ShareButton title={update.title} />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {update.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Published: {formatDate(update.created_at)}
          </span>
          {urgency && (
            <span className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md ${getUrgencyBadgeClasses(urgency.state)}`}>
              <Calendar className="w-3.5 h-3.5" />
              {urgency.label}
            </span>
          )}

        </div>
      </div>

      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allImages.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightboxUrl(img.image_url)}
              className="rounded-xl overflow-hidden border border-slate-200 aspect-square cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_url}
                alt={img.alt_text || update.title}
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            </button>
          ))}
        </div>
      )}

      {update.description && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-600" />
            Details
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {update.description}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {update.official_link && (
          
            <a href={update.official_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Official Link</span>
          </a>
        )}
        
          <a href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Contact / WhatsApp for More Information</span>
        </a>
      </div>

      <ImageLightbox
        isOpen={lightboxUrl !== null}
        imageUrl={lightboxUrl || ''}
        altText={update.title}
        onClose={() => setLightboxUrl(null)}
      />
    </div>
  );
}