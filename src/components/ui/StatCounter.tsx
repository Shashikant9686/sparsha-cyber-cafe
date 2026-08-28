'use client';

import { useEffect, useState } from 'react';

interface StatCounterProps {
  end: number;
  suffix?: string;
  label: string;
}

export default function StatCounter({ end, suffix = '+', label }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const incrementTime = 20;
    const step = Math.ceil(end / (duration / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/70 p-4 text-center shadow-xs backdrop-blur-md">
      <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
        {count}
        {suffix}
      </span>
      <span className="mt-1 text-xs font-semibold text-slate-500">{label}</span>
    </div>
  );
}