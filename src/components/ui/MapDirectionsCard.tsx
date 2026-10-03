import React from 'react';
import { Navigation, MapPin } from 'lucide-react';

export default function MapDirectionsCard() {
  const mapUrl = 'https://www.google.com/maps/search/?api=1&query=Sparsha+Online+Center+Aland';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-panel border border-stone-200 bg-surface p-6 shadow-panel active:border-saffron/40 transition">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-control bg-saffron-soft text-saffron shrink-0">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-ink">Visiting from nearby villages?</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Near Lingayat Bhavan, Sagri Complex, Razvi Road, Aland
          </p>
        </div>
      </div>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-control bg-saffron px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 shadow-panel"
      >
        <Navigation className="h-3.5 w-3.5" />
        <span>Get GPS Directions</span>
      </a>
    </div>
  );
}