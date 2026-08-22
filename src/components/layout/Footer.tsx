import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              <span className="font-black text-sm tracking-tight">{BUSINESS_INFO.name}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized digital facilitation center in Aland for 371(J) quota certificates, Bhoomi RTC Pahani extracts, KCET/NEET option entry, and government recruitment applications.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Quick Navigation</h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/services" className="hover:text-white transition">Services Directory</Link></li>
              <li><Link href="/counselling" className="hover:text-white transition">Admission Desk (KCET / NEET)</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact & Timings</Link></li>
            </ul>
          </div>

          {/* Column 3: Timings & Support */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Center Timings</h3>
            <div className="text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{BUSINESS_INFO.workingHours.full}</span>
              </p>
              <p className="flex items-center gap-1.5 pt-1 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-white break-all transition">
                  {BUSINESS_INFO.email}
                </a>
              </p>
            </div>
          </div>

          {/* Column 4: Location */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Location</h3>
            <p className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{BUSINESS_INFO.address}</span>
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{BUSINESS_INFO.phonePrimary} / {BUSINESS_INFO.phoneSecondary}</span>
              </p>
              <a
                href={BUSINESS_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold pt-1"
              >
                <Navigation className="w-3 h-3" />
                <span>Get Route (Plus Code: {BUSINESS_INFO.plusCode})</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>© 2026 {BUSINESS_INFO.name}. All rights reserved.</span>
          {/* Always opens password/login prompt */}
          <Link 
            href="/login" 
            className="hover:text-slate-300 transition text-[11px] font-semibold text-slate-400"
          >
            Operator / Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}