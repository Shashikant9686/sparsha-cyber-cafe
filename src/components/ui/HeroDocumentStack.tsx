'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FileText, CheckCircle2, ShieldCheck, BadgeCheck } from 'lucide-react';

/**
 * HeroDocumentStack — Phase 2c
 *
 * A layered stack of four document-shaped panels rendered with CSS 3D
 * transforms (perspective + translateZ/rotate), representing the real
 * service flow: Application -> Document Check -> Verification -> Submission.
 *
 * Deliberately pure CSS/DOM (no WebGL/Three.js) — see the Phase 2 design
 * doc for the comparison; flat document panels are exactly the case CSS 3D
 * handles well and cheaply.
 *
 * - Respects prefers-reduced-motion: renders the final resting composition
 *   immediately, no stagger/parallax/tilt.
 * - Hover-tilt is mouse-only (skipped for touch/coarse pointers).
 */

interface Panel {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'stone' | 'saffron' | 'green';
}

const PANELS: Panel[] = [
  { key: 'application', label: 'Application', icon: FileText, accent: 'stone' },
  { key: 'check', label: 'Document Check', icon: CheckCircle2, accent: 'stone' },
  { key: 'verification', label: 'Verification', icon: ShieldCheck, accent: 'saffron' },
  { key: 'submission', label: 'Submission', icon: BadgeCheck, accent: 'green' },
];

// Resting transform per panel — increasing depth + slight rotation so the
// stack reads as receding away from the viewer, front (submission) closest.
const REST_TRANSFORMS = [
  'translateZ(-60px) translateY(-36px) translateX(18px) rotateX(8deg) rotateY(-6deg)',
  'translateZ(-20px) translateY(-12px) translateX(6px) rotateX(6deg) rotateY(-4deg)',
  'translateZ(20px) translateY(12px) translateX(-6px) rotateX(4deg) rotateY(-2deg)',
  'translateZ(60px) translateY(36px) translateX(-18px) rotateX(2deg) rotateY(0deg)',
];

const INITIAL_TRANSFORM = 'translateZ(-160px) translateY(24px) scale(0.92)';

export default function HeroDocumentStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Lazy initializer reads the media query directly (client-only guard) so
  // the effect below only needs to *subscribe* to changes, not set state
  // synchronously on mount.
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', onChange);

    // Small delay so the stagger-in transition actually plays on mount
    // rather than the browser coalescing it with the initial paint.
    const t = setTimeout(() => setMounted(true), 60);

    return () => {
      media.removeEventListener('change', onChange);
      clearTimeout(t);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType !== 'mouse') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -6, y: px * 8 });
  };

  const handlePointerLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full h-64 sm:h-80 md:h-[26rem] select-none"
      style={{ perspective: '1200px' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: reducedMotion ? undefined : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {PANELS.map((panel, i) => {
          const Icon = panel.icon;
          const accentClass =
            panel.accent === 'saffron'
              ? 'border-saffron/40 text-saffron'
              : panel.accent === 'green'
              ? 'border-green/40 text-green'
              : 'border-stone-200 text-stone-500';

          return (
            <div
              key={panel.key}
              className={`absolute w-48 sm:w-56 md:w-64 rounded-panel bg-surface border ${accentClass} shadow-panel-hover p-4 sm:p-5`}
              style={{
                transformStyle: 'preserve-3d',
                transform: mounted || reducedMotion ? REST_TRANSFORMS[i] : INITIAL_TRANSFORM,
                opacity: mounted || reducedMotion ? 1 : 0,
                transition: reducedMotion
                  ? 'none'
                  : `transform 700ms ease-out ${i * 90}ms, opacity 700ms ease-out ${i * 90}ms`,
                zIndex: i,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  0{i + 1} — {panel.label}
                </span>
              </div>

              {/* Line silhouette — reads as a document without depicting real content */}
              <div className="space-y-1.5">
                <div className="h-1.5 rounded-full bg-stone-200 w-3/4" />
                <div className="h-1.5 rounded-full bg-stone-200 w-full" />
                <div className="h-1.5 rounded-full bg-stone-200 w-5/6" />

                {panel.key === 'check' && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3 h-3 text-green" />
                    <div className="h-1.5 rounded-full bg-green-soft w-1/2" />
                  </div>
                )}
                {panel.key === 'verification' && (
                  <div className="flex justify-end pt-1">
                    <div className="w-8 h-8 rounded-full border-2 border-saffron flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-saffron" />
                    </div>
                  </div>
                )}
                {panel.key === 'submission' && (
                  <div className="flex items-center gap-1.5 pt-1 text-green">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">Done</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}