import { Loader2 } from 'lucide-react';

export default function CounsellingLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-xs font-bold text-slate-700">Loading Counselling Desk...</p>
      <p className="text-[11px] text-slate-400 mt-0.5">Fetching KCET, NEET & admission schedules</p>
    </div>
  );
}