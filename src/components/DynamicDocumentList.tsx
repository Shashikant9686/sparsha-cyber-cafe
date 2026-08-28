'use client';

import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface DynamicDocumentListProps {
  documents: string[];
  onChange: (docs: string[]) => void;
}

export default function DynamicDocumentList({ documents, onChange }: DynamicDocumentListProps) {
  const [newDoc, setNewDoc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.trim()) return;
    onChange([...documents, newDoc.trim()]);
    setNewDoc('');
  };

  const handleRemove = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  const handleQuickAddPreset = (presetText: string) => {
    if (!documents.includes(presetText)) {
      onChange([...documents, presetText]);
    }
  };

  const presets = [
    'Aadhaar Card (Applicant & Parent)',
    '1st to 10th Cumulative Study Certificate',
    'BHOOMI RTC Pahani Copy',
    'Caste & Income Certificate (RD Number)',
    'Passport Size Photo & Signature',
    'Ration Card / Family Tree Affidavit',
    'Active Mobile Number for OTP Verification',
  ];

  return (
    <div className="space-y-4">
      {/* Existing List */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center text-xs text-slate-400">
            No mandatory documents configured yet. Add them below or pick from quick presets.
          </div>
        ) : (
          documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">{doc}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                title="Remove requirement"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Manual Document Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newDoc}
          onChange={(e) => setNewDoc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd(e);
            }
          }}
          placeholder="e.g. 10th Marks Card, BEO Counter-signature certificate..."
          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Requirement</span>
        </button>
      </div>

      {/* Quick Regional Presets */}
      <div className="space-y-1.5 pt-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
          Quick Add Regional Presets:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleQuickAddPreset(preset)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200 transition text-left"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}