import React from 'react';
import { Navigation, MapPin } from 'lucide-react';

export default function MapDirectionsCard() {
  const mapUrl = 'https://www.google.com/maps/search/?api=1&query=Sparsha+Online+Center+Aland';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs active:border-blue-300 transition">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Visiting from nearby villages?</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Near Lingayat Bhavan, Sagri Complex, Razvi Road, Aland
          </p>
        </div>
      </div>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95 shadow-sm"
      >
        <Navigation className="h-3.5 w-3.5" />
        <span>Get GPS Directions</span>
      </a>
    </div>
  );
}