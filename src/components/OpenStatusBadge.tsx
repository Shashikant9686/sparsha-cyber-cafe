'use client';

import React, { useState, useEffect } from 'react';

const OPEN_HOUR = 8;  // 8:00 AM IST
const CLOSE_HOUR = 20; // 8:00 PM IST
const BUSINESS_TIMEZONE = 'Asia/Kolkata';

function getCurrentHourInBusinessTimezone(): number {
  const hourString = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).format(new Date());
  // Some environments format midnight as "24" instead of "0" — normalize it.
  return Number(hourString) % 24;
}

export default function OpenStatusBadge() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const hour = getCurrentHourInBusinessTimezone();
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
      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 motion-safe:animate-pulse' : 'bg-slate-400'}`} />
      {isOpen ? 'Open Now' : 'Closed Now'}
    </span>
  );
}