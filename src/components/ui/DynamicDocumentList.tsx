'use client';

import React from 'react';
import { Plus, Trash2, GripVertical, CheckCircle2 } from 'lucide-react';

export interface DocumentItem {
  id?: string;
  document_name: string;
  description?: string;
  is_mandatory: boolean;
  display_order?: number;
}

interface DynamicDocumentListProps {
  documents: DocumentItem[];
  onChange: (docs: DocumentItem[]) => void;
}

export default function DynamicDocumentList({
  documents,
  onChange,
}: DynamicDocumentListProps) {
  const addDocument = () => {
    onChange([
      ...documents,
      {
        document_name: '',
        description: '',
        is_mandatory: true,
        display_order: documents.length + 1,
      },
    ]);
  };

  const removeDocument = (index: number) => {
    const updated = documents.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateDocument = (
    index: number,
    field: keyof DocumentItem,
    value: any
  ) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Required Documents Checklist
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Specify mandatory certificates and proofs needed from the citizen.
          </p>
        </div>

        <button
          type="button"
          onClick={addDocument}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Document
        </button>
      </div>

      <div className="space-y-2.5">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
          >
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 text-xs font-mono font-bold w-5 text-center">
                #{idx + 1}
              </span>
              <input
                type="text"
                placeholder="Document Title (e.g. SSLC Marks Card)"
                value={doc.document_name}
                onChange={(e) =>
                  updateDocument(idx, 'document_name', e.target.value)
                }
                className="flex-1 sm:w-64 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <input
              type="text"
              placeholder="Requirement details / Note (optional)"
              value={doc.description || ''}
              onChange={(e) =>
                updateDocument(idx, 'description', e.target.value)
              }
              className="flex-1 w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-600"
            />

            <div className="flex items-center justify-between w-full sm:w-auto gap-2 shrink-0">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={doc.is_mandatory}
                  onChange={(e) =>
                    updateDocument(idx, 'is_mandatory', e.target.checked)
                  }
                  className="rounded text-blue-600"
                />
                Mandatory
              </label>

              <button
                type="button"
                onClick={() => removeDocument(idx)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                title="Remove Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}