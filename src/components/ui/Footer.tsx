import React from 'react';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/constants';
import { 
  MapPin, 
  PhoneCall, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Summary */}
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-base font-black text-white tracking-tight">
              SPARSHA CYBER CAFE
            </h3>
            <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">
              & Land Services • Aland
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete digital document assistance, Bhoomi land records, KCET admission counselling, and government portal services in Aland.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-blue-400 transition">
                  All Services Catalog
                </Link>
              </li>
              <li>
                <Link href="/counselling" className="hover:text-blue-400 transition">
                  KCET / NEET / JEE Desk
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition">
                  Contact & Map
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition text-slate-500">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Popular Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Karnataka 371(J) Verification</li>
              <li>• Nadakacheri Caste & Income (RD)</li>
              <li>• Bhoomi RTC & Mutation Status</li>
              <li>• KEA Option Entry & Counselling</li>
              <li>• New PAN Card & Aadhaar Link</li>
            </ul>
          </div>

          {/* Office Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Aland Center
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href={`tel:${BUSINESS_INFO.phone}`} className="text-white hover:underline">
                  +91 {BUSINESS_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:underline">
                  {BUSINESS_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{BUSINESS_INFO.hours}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Sparsha Cyber Cafe & Land Services. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Authorized Online Application & Facilitation Desk
          </p>
        </div>
      </div>
    </footer>
  );
}