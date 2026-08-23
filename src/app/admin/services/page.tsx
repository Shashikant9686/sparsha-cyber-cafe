'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, Search, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface ServiceListItem {
  id: string;
  name?: string | null;
  title?: string | null;
  slug: string;
  category?: string | null;
  category_id?: string | null;
  fee?: number | string | null;
  official_fee?: number | string | null;
  service_charge?: number | string | null;
  status?: string | null;
  display_order?: number | null;
}

export default function AdminServicesPage() {
  const supabase = createClient();
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const { data, error: err } = await supabase
        .from('services')
        .select('*')
        .order('id', { ascending: false });

      if (err) throw err;
      setServices((data as ServiceListItem[]) || []);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; details?: string; hint?: string; code?: string };
      console.error('Error fetching services:', {
        message: err instanceof Error ? err.message : errorObj?.message || String(err),
        details: errorObj?.details,
        hint: errorObj?.hint,
        code: errorObj?.code,
      });
      setFetchError(errorObj?.message || (err instanceof Error ? err.message : 'Failed to load services list'));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (id: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete "${displayName}"?`)) return;

    try {
      // 1. Delete linked required documents
      await supabase.from('required_documents').delete().eq('service_id', id);
      
      // 2. Delete linked service images
      await supabase.from('service_images').delete().eq('service_id', id);

      // 3. Delete the service
      const { error: delError } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (delError) throw delError;

      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      const errorObj = err as { message?: string; details?: string; hint?: string; code?: string };
      console.error('Error deleting service:', {
        message: err instanceof Error ? err.message : errorObj?.message || String(err),
        details: errorObj?.details,
        hint: errorObj?.hint,
        code: errorObj?.code,
      });
      alert(errorObj?.message || (err instanceof Error ? err.message : 'Failed to delete service'));
    }
  };

  const filteredServices = services.filter((s) => {
    const sName = (s.name || s.title || '').toLowerCase();
    const sCat = (s.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return sName.includes(query) || sCat.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900">Services Manager</h1>
          <p className="text-xs text-slate-500">Manage catalog entries, requirements, and charges.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </Link>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Failed to load services: </span>
            {fetchError}
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-xs">Loading services...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {searchQuery ? 'No services match your search filter.' : 'No services found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Govt Fee</th>
                  <th className="py-3 px-4">Cafe Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredServices.map((svc) => {
                  const displayName = svc.name || svc.title || 'Untitled Service';
                  const displayFee = svc.official_fee != null ? svc.official_fee : svc.fee;
                  return (
                    <tr key={svc.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{displayName}</div>
                        <div className="text-[11px] text-slate-400">{svc.slug}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {svc.category || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {displayFee != null ? `₹${displayFee}` : 'Free'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {svc.service_charge != null ? `₹${svc.service_charge}` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          svc.status === 'Active' || !svc.status
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {svc.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            href={`/services/${svc.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="View Live"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/services/${svc.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(svc.id, displayName)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}