'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BUSINESS_INFO } from '@/lib/constants';
import { 
  Menu, 
  X, 
  PhoneCall, 
  MessageSquare, 
  MapPin, 
  Clock, 
  GraduationCap, 
  FileText 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Services', href: '/services' },
    { name: 'KCET / JEE / NEET', href: '/counselling' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      
      {/* Top Notification / Information Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {BUSINESS_INFO.hours}
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Aland, Karnataka
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <a 
              href={`tel:${BUSINESS_INFO.phone}`} 
              className="hover:text-white font-medium transition"
            >
              Call: +91 {BUSINESS_INFO.phone}
            </a>
            <span className="text-slate-600">|</span>
            <Link 
              href="/login" 
              className="hover:text-white font-medium text-slate-400 transition"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand */}
          <Link href="/" className="flex flex-col select-none">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
              SPARSHA CYBER CAFE
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              & Land Services • Aland
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs sm:text-sm font-semibold transition ${
                    isActive 
                      ? 'text-blue-600 font-bold' 
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Callouts */}
          <div className="hidden lg:flex items-center gap-2.5">
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent('Hello Sparsha Cyber Cafe, I have a query regarding online services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </a>

            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Now
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent('Hello Sparsha Cyber Cafe, I have a query regarding online services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Office
            </a>
          </div>
        </div>
      )}

    </header>
  );
}