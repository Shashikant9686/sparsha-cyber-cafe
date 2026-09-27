import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BroadcastBanner from '@/components/BroadcastBanner';
import StickyWhatsAppButton from '@/components/StickyWhatsAppButton';
import ScrollProgressBar from '@/components/ui/ScrollProgressBar';
import CommandPalette from '@/components/ui/CommandPalette';
import BackToTop from '@/components/ui/BackToTop';
import MobileBottomSheet from '@/components/ui/MobileBottomSheet';
import { BUSINESS_INFO } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Display/editorial serif for the new design system's H1/H2 headings.
// Loaded as a CSS variable only (via `fraunces.variable`) — not yet applied
// to any heading. Later phases will use it via the `font-display` utility.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-fraunces',
});

export const metadata: Metadata = {
  title: `${BUSINESS_INFO.name} | ${BUSINESS_INFO.tagline} | Aland`,
  description:
    'Sparsha Online Center in Aland, Kalaburagi — a one-stop digital service center for government applications, land services (371(J) quota certificates, Bhoomi RTC extracts), Nadakacheri certificates, KCET/JEE/NEET counselling, exam and college applications, document services, and printing.',
  keywords: [
    'Sparsha Online Center',
    'Aland',
    'Kalaburagi',
    'Gulbarga',
    'Cyber Cafe Aland',
    'Online Application Center',
    '371(J) Certificate',
    'Bhoomi RTC',
    'Nadakacheri',
    'KCET Counselling',
    'NEET Counselling',
  ],
  authors: [{ name: BUSINESS_INFO.name }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://sparsha-cyber-cafe.vercel.app'
  ),
  openGraph: {
    title: `${BUSINESS_INFO.name} | ${BUSINESS_INFO.tagline}`,
    description:
      'One-stop digital service center in Aland for government applications, student counselling, document services, and certificates.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${fraunces.variable}`}>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white`}
      >
        {/* Interactive Background & Modern UI Layer */}
        <ScrollProgressBar />
        <CommandPalette />

        {/* Core Layout Structure */}
        <BroadcastBanner />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />

        {/* Global Floating Action Controls */}
        <BackToTop />
        <StickyWhatsAppButton />
        <MobileBottomSheet />
      </body>
    </html>
  );
}