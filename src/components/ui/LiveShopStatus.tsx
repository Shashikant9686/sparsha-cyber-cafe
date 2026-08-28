'use client';

import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';

export default function LiveShopStatus() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOpenStatus = () => {
      // Indian Standard Time (UTC + 5:30)
      const now = new Date();
      const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const day = istTime.getDay(); // 0 = Sunday, 1 = Monday, ...
      const hour = istTime.getHours();

      // Open Mon - Sat: 9:00 AM to 8:30 PM (Sunday: 10:00 AM to 2:00 PM)
      if (day === 0) {
        setIsOpen(hour >= 10 && hour < 14);
      } else {
        setIsOpen(hour >= 9 && hour < 20);
      }
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isOpen === null) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-xs">
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
            isOpen ? 'bg-emerald-400' : 'bg-rose-400'
          }`}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            isOpen ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </span>
      <span>{isOpen ? 'Center Open Now in Aland' : 'Center Closed (Opens at 9 AM)'}</span>
    </div>
  );
}