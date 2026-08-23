'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2 } from 'lucide-react';

export interface UploadedImage {
  id?: string;
  image_url: string;
  caption?: string;
  display_order?: number;
}

interface ImageUploaderProps {
  images?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
  onUploadComplete?: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
}

export default function ImageUploader({
  images = [],
  onChange,
  onUploadComplete,
  currentImageUrl,
  bucketName = 'service-images',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [singlePreview, setSinglePreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const isMultiMode = !!onChange;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `posters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const uploadedUrl = publicUrlData.publicUrl;

      if (isMultiMode && onChange) {
        const newImage: UploadedImage = {
          image_url: uploadedUrl,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          display_order: (images.length || 0) + 1,
        };
        onChange([...images, newImage]);
      } else {
        setSinglePreview(uploadedUrl);
        if (onUploadComplete) onUploadComplete(uploadedUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveSingle = () => {
    setSinglePreview(null);
    if (onUploadComplete) onUploadComplete('');
  };

  const handleRemoveMulti = (index: number) => {
    if (!onChange) return;
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Multi-Image Mode */}
      {isMultiMode ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-xs group bg-slate-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.caption || 'Service Image'}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMulti(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-md opacity-90 hover:opacity-100"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition p-3 text-center">
              <div className="flex flex-col items-center justify-center">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-1" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                )}
                <span className="text-[11px] font-bold text-slate-700">
                  {uploading ? 'Uploading...' : 'Add Image'}
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      ) : (
        /* Single-Image Mode */
        <div>
          {singlePreview ? (
            <div className="relative w-full max-w-sm h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={singlePreview}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveSingle}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-sm h-40 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition p-4 text-center">
              <div className="flex flex-col items-center justify-center">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-600" />
                )}
                <p className="text-xs font-bold text-slate-700">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}