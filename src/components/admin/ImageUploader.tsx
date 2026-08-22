'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud, Trash2, Loader2, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export interface UploadedImage {
  id?: string;
  image_url: string;
  image_type?: string;
  alt_text?: string;
  display_order?: number;
}

export interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  bucketName?: 'service-images' | 'service-posters';
}

export default function ImageUploader({
  images,
  onChange,
  bucketName = 'service-images',
}: ImageUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        setError(`"${file.name}" has an unsupported format. Only JPG, PNG, and WEBP files are allowed.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`"${file.name}" exceeds the 5 MB size limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
        return;
      }

      validFiles.push(file);
    }

    try {
      setUploading(true);
      const uploadedList: UploadedImage[] = [...images];

      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${Date.now()}_${safeName}.${fileExt}`;
        const filePath = `posters/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        uploadedList.push({
          image_url: publicUrlData.publicUrl,
          image_type: 'poster',
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
          display_order: uploadedList.length + 1,
        });
      }

      onChange(uploadedList);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'An error occurred during upload.';
      setError(errMessage);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const copy = images.filter((_, i) => i !== index);
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
          Official Notification Posters & Circulars
        </label>
        <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 5 MB)</span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-50">
              <Image
                src={img.image_url || ''}
                alt={img.alt_text || 'Poster preview'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Validating and uploading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Click to upload notification flyers or drag files here</span>
          </div>
        )}
      </label>
    </div>
  );
}