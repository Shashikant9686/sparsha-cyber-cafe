'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2 } from 'lucide-react';

interface UploadedImageItem {
  url: string;
  path?: string;
  name?: string;
}

interface ImageUploaderProps {
  bucketName?: string;
  folderPath?: string;
  onUploadSuccess: (uploaded: UploadedImageItem) => void;
  onRemove?: (url: string) => void;
  existingImages?: string[];
}

export default function ImageUploader({
  bucketName = 'service-images',
  folderPath = 'uploads',
  onUploadSuccess,
  onRemove,
  existingImages = []
}: ImageUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches the Storage bucket's own limit

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file: File = files[0];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('Only JPEG, PNG, or WebP images are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 5MB.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onUploadSuccess({
        url: publicUrlData.publicUrl,
        path: filePath,
        name: file.name
      });
    } catch (err: unknown) {
      console.error('Image upload failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{uploading ? 'Uploading...' : 'Choose Image'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {errorMessage && (
        <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
      )}

      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {existingImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`Upload preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(imgUrl)}
                  className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}