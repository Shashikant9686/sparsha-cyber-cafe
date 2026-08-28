'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface QuickCopyShareProps {
  title: string;
  urlPath?: string;
}

export default function QuickCopyShare({ title, urlPath = '' }: QuickCopyShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}${urlPath}`;
    try {
      await navigator.clipboard.writeText(`${title} - Check details: ${fullUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
      title="Copy link to share"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-600">Copied Link!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}