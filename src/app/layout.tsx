import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BroadcastBanner from '@/components/BroadcastBanner';
import { BUSINESS_INFO } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: `${BUSINESS_INFO.name} | ${BUSINESS_INFO.tagline} | Aland`,
  description:
    'Sparsha Online Center in Aland, Kalaburagi — a one-stop digital service center for government applications, land services (371(J) quota certificates, Bhoomi RTC extracts), Nadakacheri certificates, KCET/JEE/NEET counselling, exam and college applications, document services, and printing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        <BroadcastBanner />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}