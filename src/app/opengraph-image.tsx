import { ImageResponse } from 'next/og';
import { BUSINESS_INFO } from '@/lib/constants';

export const runtime = 'edge';
export const alt = `${BUSINESS_INFO.name} - Digital Seva Center in Aland`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'radial-gradient(circle at 80% 20%, #1e3a8a 0%, #0f172a 60%, #020617 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '50px 70px',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Top Header Row: Location Badge & Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.5px',
              color: '#93c5fd',
            }}
          >
            📍 Aland, Kalaburagi District, Karnataka
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: 16,
              fontWeight: 700,
              color: '#34d399',
            }}
          >
            ● Open Daily: 8:00 AM – 8:00 PM
          </div>
        </div>

        {/* Center Main Section: Branded Logo + Title & Highlights */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            margin: '20px 0',
          }}
        >
          {/* Sparsha Logo Icon (High-Res SVG Render) */}
          <svg
            width="170"
            height="170"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="globeShading" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="40%" stopColor="#2563eb" />
                <stop offset="85%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
              <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7700" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>

            {/* Saffron Orbital Arc */}
            <path
              d="M 100 12 A 88 88 0 0 1 188 100 A 88 88 0 0 1 100 188"
              stroke="url(#saffronGrad)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Green Orbital Arc */}
            <path
              d="M 100 28 A 72 72 0 0 1 172 100 A 72 72 0 0 1 100 172"
              stroke="url(#greenGrad)"
              strokeWidth="13"
              strokeLinecap="round"
            />
            {/* Blue 3D Globe */}
            <circle cx="95" cy="105" r="54" fill="url(#globeShading)" />
            {/* Continents */}
            <g fill="#ffffff" fillOpacity="0.88">
              <path d="M 72 72 Q 85 65 92 78 Q 88 95 78 98 Q 65 90 72 72 Z" />
              <path d="M 82 105 Q 98 108 94 128 Q 88 145 80 138 Q 76 118 82 105 Z" />
              <path d="M 110 75 Q 125 78 132 90 Q 120 100 112 92 Z" />
            </g>
            {/* Grids */}
            <ellipse cx="95" cy="105" rx="54" ry="24" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.3" fill="none" />
            <ellipse cx="95" cy="105" rx="24" ry="54" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.3" fill="none" />
          </svg>

          {/* Business Titles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '14px',
              }}
            >
              <span
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  fontStyle: 'italic',
                  letterSpacing: '2px',
                  color: '#ffffff',
                }}
              >
                SPARSHA
              </span>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  letterSpacing: '4px',
                  color: '#60a5fa',
                }}
              >
                ONLINE
              </span>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  letterSpacing: '4px',
                  color: '#fb923c',
                }}
              >
                CENTER
              </span>
            </div>

            <p
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#cbd5e1',
                margin: 0,
                lineHeight: 1.3,
                maxWidth: 780,
              }}
            >
              371(J) Quota Certificates • Bhoomi RTC Pahani • Nadakacheri • KCET / NEET Option Entry & Admissions
            </p>
          </div>
        </div>

        {/* Bottom Footer Info: Portal & Contact */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '20px',
            fontSize: 22,
            fontWeight: 700,
            color: '#e2e8f0',
          }}
        >
          <span style={{ color: '#93c5fd' }}>🌐 sparsha-cyber-cafe.vercel.app</span>
          <span style={{ color: '#34d399' }}>💬 WhatsApp: +91 {BUSINESS_INFO.whatsappNumber}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}