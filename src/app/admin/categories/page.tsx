'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Layers
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export default function AdminCategoriesPage() {
  const supabase = createClient();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Layers',
    display_order: 1
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to load categories.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    if (!editingId) {
      const slugVal = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, name: val, slug: slugVal }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'Layers',
      display_order: cat.display_order || 1
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Layers',
      display_order: categories.length + 1
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setMessage({ type: 'error', text: 'Category name and slug are required.' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        setMessage({ type: 'success', text: `Category "${formData.name}" updated successfully.` });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);

        if (error) throw error;
        setMessage({ type: 'success', text: `Category "${formData.name}" created successfully.` });
      }

      resetForm();
      fetchCategories();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      // Check if any services are currently attached to this category
      const { count, error: countErr } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', id);

      if (countErr) throw countErr;

      if (count && count > 0) {
        alert(`Cannot delete "${name}". There are ${count} active service(s) assigned to this category. Please reassign or delete those services first.`);
        return;
      }

      if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      setMessage({ type: 'success', text: `Category "${name}" removed.` });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) resetForm();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(`Failed to delete category: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update display order, and organize service catalog groups.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Link>
      </div>

      {/* Notification */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Editor & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <FolderTree className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Government & Certificate Services"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                placeholder="government-certificate-services"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description / Subtitle
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of services contained under this heading..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Icon Name
                </label>
                <input
                  type="text"
                  placeholder="Layers"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Save Changes' : 'Create Category'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Configured Categories ({categories.length})</h2>
              <span className="text-[11px] text-slate-400">Ordered by Priority</span>
            </div>

            {loading ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                <p className="text-xs font-semibold text-slate-500">Loading categories...</p>
              </div>
            ) : categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Category Name</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                          #{cat.display_order}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{cat.name}</p>
                          {cat.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{cat.description}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {cat.slug}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(cat)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition"
                              title="Edit Category"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No categories found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the form on the left to add your first category.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}