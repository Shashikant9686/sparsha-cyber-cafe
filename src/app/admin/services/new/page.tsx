'use client';

import React from 'react';
import ServiceForm from '@/components/admin/ServiceForm';

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Seva / Application Service</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure fees, timelines, and the automated WhatsApp document checklist.
        </p>
      </div>
      <ServiceForm />
    </div>
  );
}