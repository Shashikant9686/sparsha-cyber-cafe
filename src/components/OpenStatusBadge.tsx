'use client';

import React, { useState, useEffect } from 'react';

const OPEN_HOUR = 8;  // 8:00 AM
const CLOSE_HOUR = 20; // 8:00 PM

export default function OpenStatusBadge() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const hour = new Date().getHours();
      setIsOpen(hour >= OPEN_HOUR && hour < CLOSE_HOUR);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isOpen === null) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
        isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
      {isOpen ? 'Open Now' : 'Closed Now'}
    </span>
  );
}