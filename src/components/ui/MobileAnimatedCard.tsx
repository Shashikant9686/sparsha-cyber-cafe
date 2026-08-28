'use client';

import React from 'react';
import { useInViewAnimation } from '@/hooks/useInViewAnimation';

interface MobileAnimatedCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileAnimatedCard({ children, className = '' }: MobileAnimatedCardProps) {
  const { ref, isInView } = useInViewAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out active:scale-[0.98] ${
        isInView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8 pointer-events-none'
      } ${className}`}
    >
      {children}
    </div>
  );
}