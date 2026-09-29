'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import SparshaLogo from '@/components/ui/SparshaLogo';

/**
 * Premium public header — Phase: Header redesign.
 * Always a dark glass "chrome" bar (not light-on-scroll like before), so
 * it reads as one consistent brand element across every public page
 * regardless of what's beneath it. Active nav state is a thin gold
 * underline rather than a filled pill, per the approved editorial
 * direction. Nav items, routes, and the WhatsApp link are unchanged from
 * before — only the visual treatment changed.
 */

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services & Seva' },
  { href: '/updates', label: 'Latest Updates' },
  { href: '/counselling', label: 'Admission Desk' },
  { href: '/contact', label: 'Contact & Location' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/[0.06] backdrop-blur-xl transition-colors duration-300 ${
        scrolled || isOpen ? 'bg-ink/95' : 'bg-ink/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <SparshaLogo size="sm" showText={false} />
          <div>
            <span className="font-display font-semibold text-sm sm:text-base text-ivory tracking-tight block leading-none">
              {BUSINESS_INFO.name}
            </span>
            <span className="text-[10px] text-stone-500 font-semibold tracking-wide">
              Aland, Kalaburagi
            </span>
          </div>
        </Link>

        {/* Desktop Nav — thin gold underline for the active item, no pill */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-2 text-xs font-semibold tracking-wide transition ${
                  isActive ? 'text-ivory' : 'text-ivory/60 hover:text-ivory'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute left-3.5 right-3.5 -bottom-px h-px bg-saffron" />
                )}
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-whatsapp hover:opacity-90 text-white rounded-full text-xs font-bold shadow-sm transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp Help</span>
          </a>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-ivory/80 hover:text-ivory hover:bg-white/5 rounded-control transition"
            aria-label="Toggle Navigation"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — same dark glass surface as the bar itself */}
      {isOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-ink/95 backdrop-blur-xl px-4 py-4 space-y-1 animate-in fade-in">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-3 rounded-control text-sm font-semibold transition ${
                  isActive ? 'text-saffron bg-white/5' : 'text-ivory/70 hover:bg-white/5 hover:text-ivory'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 mt-2 border-t border-white/[0.06]">
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 p-3 bg-whatsapp text-white font-bold rounded-full text-xs shadow-sm"
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