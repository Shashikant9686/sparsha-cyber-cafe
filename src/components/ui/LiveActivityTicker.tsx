'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const activities = [
  '⚡ 371(J) quota applications open for 2026',
  '📄 Bhoomi RTC extracts delivered in 5 mins',
  '🎓 KCET & NEET option entry assistance active',
  '💳 PAN & Aadhaar link updates available',
];

export default function LiveActivityTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur-xs shadow-2xs">
      <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
      <span className="transition-all duration-500 ease-in-out">
        {activities[index]}
      </span>
    </div>
  );
}