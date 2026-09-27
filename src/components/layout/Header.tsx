'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Layers, Calendar, Info, Megaphone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import SparshaLogo from '@/components/ui/SparshaLogo';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services & Seva', icon: Layers },
  { href: '/updates', label: 'Latest Updates', icon: Megaphone },
  { href: '/counselling', label: 'Admission Desk', icon: Calendar },
  { href: '/contact', label: 'Contact & Location', icon: Info },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Solid-on-scroll: header starts transparent and picks up an ivory,
  // blurred background + border/shadow once the page has scrolled past a
  // small threshold. (True edge-to-edge overlay atop the hero completes in
  // a later phase once the hero itself is rebuilt to sit behind the header;
  // this establishes the scroll-aware behavior/tokens now.)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || isOpen
          ? 'bg-ivory/95 backdrop-blur-md border-b border-stone-200 shadow-panel'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with Tricolor Orbital Arcs & 3D Globe */}
        <Link href="/" className="flex items-center gap-2">
          <SparshaLogo size="sm" showText={false} />
          <div>
            <span className="font-display font-semibold text-sm sm:text-base text-ink tracking-tight block leading-none">
              {BUSINESS_INFO.name}
            </span>
            <span className="text-[10px] text-stone-500 font-semibold tracking-wide">
              Aland, Kalaburagi
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-control text-xs font-bold transition ${
                  isActive
                    ? 'bg-saffron-soft text-saffron'
                    : 'text-stone-700 hover:text-ink hover:bg-stone-200/50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* WhatsApp Action */}
        <div className="flex items-center gap-2">
          <a
          
            href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello%20Sparsha%20Online%20Center,%20I%20have%20an%20application%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-whatsapp hover:opacity-90 text-white rounded-control text-xs font-bold shadow-sm transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp Help</span>
          </a>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-stone-700 hover:bg-stone-200/50 rounded-control transition"
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-200 bg-surface px-4 py-4 space-y-2 shadow-panel-hover animate-in fade-in">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-3 rounded-control text-sm font-bold transition ${
                  isActive ? 'bg-saffron-soft text-saffron' : 'text-stone-700 hover:bg-stone-200/40'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-stone-200">
            <a
            
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 p-3 bg-whatsapp text-white font-bold rounded-control text-xs shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Chat on WhatsApp (+91 {BUSINESS_INFO.whatsappNumber})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}