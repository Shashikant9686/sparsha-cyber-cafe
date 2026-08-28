'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface DeadlineCountdownBadgeProps {
  lastDate: string; // ISO format: YYYY-MM-DD
}

export default function DeadlineCountdownBadge({ lastDate }: DeadlineCountdownBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const target = new Date(`${lastDate}T23:59:59+05:30`).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes, isExpired: false });
    };

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [lastDate]);

  if (!timeLeft) return null;

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
        Applications Closed
      </span>
    );
  }

  const isUrgent = timeLeft.days <= 3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors ${
        isUrgent
          ? 'bg-rose-500 text-white animate-pulse'
          : 'bg-amber-100 text-amber-900 border border-amber-200'
      }`}
    >
      {isUrgent ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {timeLeft.days > 0
        ? `${timeLeft.days}d ${timeLeft.hours}h left`
        : `${timeLeft.hours}h ${timeLeft.minutes}m left (Closing Today)`}
    </span>
  );
}