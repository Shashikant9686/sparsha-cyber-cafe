'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
}

export default function ImageUploader({
  onUploadComplete,
  currentImageUrl,
  bucketName = 'service-images',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return;
    }

    // Validate mime type
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

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setPreview(publicUrlData.publicUrl);
      onUploadComplete(publicUrlData.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative w-full max-w-sm h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded poster preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-md"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-sm h-40 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition p-4 text-center">
          <div className="flex flex-col items-center justify-center pt-2 pb-3">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-600" />
            )}
            <p className="text-xs font-bold text-slate-700">
              {uploading ? 'Uploading image...' : 'Click or drag image to upload'}
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

      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}