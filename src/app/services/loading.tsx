import { Loader2 } from 'lucide-react';

export default function ServicesLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-700">Loading Services Catalog...</p>
      <p className="text-[11px] text-slate-400 mt-0.5">Fetching government portals and forms</p>
    </div>
  );
}