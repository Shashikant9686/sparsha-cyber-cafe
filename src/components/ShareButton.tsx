'use client';

import React, { useState } from 'react';
import { Share2, Check, Link2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  className?: string;
}

type NavigatorWithShare = Navigator & {
  share?: (data: { title?: string; url?: string }) => Promise<void>;
};

export default function ShareButton({ title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  React.useEffect(() => {
    // Client-only feature detection: navigator.share doesn't exist during SSR,
    // so this must run after mount.
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithShare) : undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(Boolean(nav?.share));
  }, []);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithShare) : undefined;

    if (nav?.share) {
      try {
        await nav.share({ title, url });
      } catch {
        // user cancelled the share sheet — no action needed
      }
      return;
    }

    if (nav?.clipboard) {
      try {
        await nav.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard write blocked — silently ignore
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ||
        'inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-blue-500 text-slate-600 hover:text-blue-600 rounded-xl text-xs font-bold transition shadow-xs'
      }
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Link Copied</span>
        </>
      ) : (
        <>
          {canNativeShare ? <Share2 className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          <span>Share</span>
        </>
      )}
    </button>
  );
}