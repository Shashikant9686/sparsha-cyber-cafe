import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      <p className="text-xs font-bold text-slate-500">Loading updates...</p>
    </div>
  );
}