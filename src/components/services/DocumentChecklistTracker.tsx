'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

interface DocumentChecklistTrackerProps {
  documents: { id: string; document_name: string; is_mandatory: boolean }[];
  serviceTitle: string;
}

export default function DocumentChecklistTracker({
  documents,
  serviceTitle,
}: DocumentChecklistTrackerProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  if (!documents || documents.length === 0) return null;

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const progress = Math.round((checkedIds.length / documents.length) * 100);
  const isComplete = progress === 100;

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50/50 via-white to-indigo-50/30 p-6 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" /> Interactive Checklist
          </span>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Check Your Document Readiness
          </h3>
          <p className="text-xs text-slate-500">
            Check off the documents you have ready for {serviceTitle}.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-blue-600">{progress}%</span>
          <p className="text-[11px] font-medium text-slate-400">
            {checkedIds.length}/{documents.length} ready
          </p>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isComplete
              ? 'bg-linear-to-r from-emerald-500 to-teal-400'
              : 'bg-linear-to-r from-blue-600 to-indigo-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="mt-5 space-y-2">
        {documents.map((doc) => {
          const isChecked = checkedIds.includes(doc.id);
          return (
            <button
              key={doc.id}
              onClick={() => toggleCheck(doc.id)}
              type="button"
              className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs transition-all ${
                isChecked
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900 font-medium'
                  : 'border-slate-200/80 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {isChecked ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                )}
                <span>{doc.document_name}</span>
              </div>
              {doc.is_mandatory && (
                <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                  Required
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isComplete && (
        <div className="mt-4 rounded-xl bg-emerald-500 p-3 text-center text-xs font-semibold text-white shadow-xs animate-fade-in-up-1">
          🎉 All required documents are ready! Bring them along or send them via WhatsApp.
        </div>
      )}
    </div>
  );
}