import React from 'react';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/constants';
import { ShieldCheck, Phone, Mail, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-black text-sm tracking-tight">{BUSINESS_INFO.name}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized digital facilitation center in Aland for 371(J) quota certificates, Bhoomi RTC Pahani extracts, KCET/NEET option entry, and government applications.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/" className="hover:text-blue-400 transition">Home Portal</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-blue-400 transition">Services Directory</Link>
              </li>
              <li>
                <Link href="/counselling" className="hover:text-blue-400 transition">Admission Desk (KCET / NEET)</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition">Contact & Timings</Link>
              </li>
            </ul>
          </div>

          {/* Center Details */}
          <div className="space-y-3 text-xs text-slate-400">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Center Details</h4>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Monday – Sunday: 8:00 AM – 8:00 PM</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Near Lingayat Bhavan, Sagri Complex, Razvi Road, Aland, Karnataka 585302</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>+91 7090161083 / +91 7483941814</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Shashikantkmali83@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 {BUSINESS_INFO.name}. All rights reserved.</p>
          <Link href="/login" className="hover:text-slate-300 transition">
            Operator / Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
