'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Edit3, Loader2, AlertCircle, Layers } from 'lucide-react';
import { CATEGORY_ICONS, CATEGORY_ICON_NAMES} from '@/lib/category-icons';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  display_order: number;
}

export default function AdminCategoriesPage() {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        if (isMounted) {
          setCategories((data as Category[]) || []);
        }
      } catch (err: unknown) {
        console.error('Failed to load categories:', err);
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Could not fetch categories');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        icon: icon.trim() || null,
        display_order: Number(displayOrder) || 1,
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;

        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c))
        );
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCategories((prev) => [...prev, data as Category]);
        }
      }

      handleCancel();
    } catch (err: unknown) {
      console.error('Failed to save category:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setIcon(category.icon || '');
    setDisplayOrder(category.display_order);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setIcon('');
    setDisplayOrder(1);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${catName}"?`)) return;

    try {
      setDeletingId(id);
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) handleCancel();
    } catch (err: unknown) {
      console.error('Failed to delete category:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Service Categories</h1>
        <p className="text-xs text-slate-500">
          Manage categorization taxonomies, slugs, and display sorting orders
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          {editingId ? 'Edit Category' : 'Create New Category'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Student Certificates"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>
          <div className="space-y-1">
  <label className="text-xs font-bold text-slate-700">Icon</label>
  <div className="grid grid-cols-6 gap-2">
    {CATEGORY_ICON_NAMES.map((name) => {
      const IconComp = CATEGORY_ICONS[name];
      return (
        <button
          key={name}
          type="button"
          onClick={() => setIcon(name)}
          className={`p-3 rounded-xl border flex items-center justify-center transition ${
            icon === name ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
          }`}
        >
          <IconComp className="w-4 h-4" />
        </button>
      );
    })}
  </div>
</div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">URL Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="student-certificates"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>{editingId ? 'Update Category' : 'Save Category'}</span>
          </button>
        </div>
      </form>

      {/* Categories Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">
            No categories found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{cat.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">slug: {cat.slug}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deletingId === cat.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === cat.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}