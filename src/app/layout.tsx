import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BroadcastBanner from '@/components/BroadcastBanner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SPARSHA CYBER CAFE & ONLINE SEVA KENDRA | Aland',
  description:
    'Authorised Online Seva Kendra near Lingasayat Bhavan, M.K Sagri Complex, Aland, Kalaburagi. 371(J) quota certificates, Bhoomi RTC extracts, Nadakacheri certificates, KCET/NEET Counselling, and recruitment forms.',
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