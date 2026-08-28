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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: '10px 24px',
            borderRadius: '9999px',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '1px',
          }}
        >
          📍 Aland, Kalaburagi District
        </div>

        {/* Center Main Titles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '-1px',
            }}
          >
            {BUSINESS_INFO.name}
          </h1>
          <p
            style={{
              fontSize: 28,
              color: '#93c5fd',
              margin: 0,
              maxWidth: 900,
            }}
          >
            371(J) Certificates • Bhoomi RTC • Nadakacheri • Student Counselling & Admissions
          </p>
        </div>

        {/* Bottom Contact Footer */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: '24px',
            fontSize: 24,
            fontWeight: 600,
            color: '#e2e8f0',
          }}
        >
          <span>🌐 sparsha-cyber-cafe.vercel.app</span>
          <span>📞 WhatsApp: +91 {BUSINESS_INFO.phone}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}