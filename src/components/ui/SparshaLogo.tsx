import React from 'react';

interface SparshaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function SparshaLogo({
  className = '',
  size = 'md',
  showText = true,
}: SparshaLogoProps) {
  const sizeMap = {
    sm: { icon: 34, text: 'text-sm' },
    md: { icon: 44, text: 'text-base' },
    lg: { icon: 56, text: 'text-xl' },
    xl: { icon: 72, text: 'text-2xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`group inline-flex items-center gap-3 select-none ${className}`}>
      {/* 3D Glossy Globe with Saffron-Green Orbital Arcs */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <defs>
            {/* 3D Spherical Globe Shading */}
            <radialGradient
              id="globeShading"
              cx="35%"
              cy="30%"
              r="65%"
              fx="30%"
              fy="25%"
            >
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="40%" stopColor="#2563eb" />
              <stop offset="85%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            {/* Saffron Arc Gradient */}
            <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7700" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>

            {/* Green Arc Gradient */}
            <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            {/* Gloss Highlight Overlay */}
            <linearGradient id="glossHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer Orange/Saffron Orbital Arc */}
          <path
            d="M 100 12 A 88 88 0 0 1 188 100 A 88 88 0 0 1 100 188"
            stroke="url(#saffronGrad)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Inner Green Orbital Arc */}
          <path
            d="M 100 28 A 72 72 0 0 1 172 100 A 72 72 0 0 1 100 172"
            stroke="url(#greenGrad)"
            strokeWidth="13"
            strokeLinecap="round"
          />

          {/* Blue Globe Base */}
          <circle cx="95" cy="105" r="54" fill="url(#globeShading)" />

          {/* Stylized Continents / Grid Lines */}
          <g fill="#ffffff" fillOpacity="0.9">
            {/* North America approximation */}
            <path d="M 72 72 Q 85 65 92 78 Q 88 95 78 98 Q 65 90 72 72 Z" />
            {/* South America approximation */}
            <path d="M 82 105 Q 98 108 94 128 Q 88 145 80 138 Q 76 118 82 105 Z" />
            {/* Eurasia / Coast highlights */}
            <path d="M 110 75 Q 125 78 132 90 Q 120 100 112 92 Z" />
          </g>

          {/* Spherical Latitude & Longitude Subtle Grids */}
          <ellipse
            cx="95"
            cy="105"
            rx="54"
            ry="24"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.3"
            fill="none"
          />
          <ellipse
            cx="95"
            cy="105"
            rx="24"
            ry="54"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.3"
            fill="none"
          />

          {/* Glass / Top Reflection */}
          <ellipse
            cx="86"
            cy="82"
            rx="32"
            ry="18"
            fill="url(#glossHighlight)"
            transform="rotate(-25 86 82)"
          />
        </svg>
      </div>

      {/* Typography: SPARSHA (Bold Italic) + ONLINE CENTER (Bicolor) */}
      {showText && (
        <div className="flex flex-col tracking-tight">
          <span className="font-black italic tracking-wider text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
            <span className="text-[1.25em] uppercase font-extrabold tracking-widest font-sans">
              SPARSHA
            </span>
          </span>
          <div className="mt-1 flex items-center gap-1.5 font-bold tracking-widest uppercase leading-none text-[0.65em]">
            <span className="text-blue-700">ONLINE</span>
            <span className="text-orange-500">CENTER</span>
          </div>
        </div>
      )}
    </div>
  );
}